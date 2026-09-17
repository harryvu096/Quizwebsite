#!/usr/bin/env python3
"""
AHW Quizverse — Drive past-paper crawler + converter
------------------------------------------------------------------
Ye script Drive ke public folders ko crawl karti hai, PDF/DOCX/PPTX/ZIP/TXT
files download karti hai, unka TEXT nikal kar `out/` me rakh deti hai —
taake `tools/import-mcqs.js` unhe app ke banks me daal sake.

Local bhi chalti hai, aur GitHub Actions me bhi (workflow: fetch-drive.yml).
CI me chalti hai to poori internet + poppler milta hai (local machine par
kuch cheezein missing ho sakti hain).

Usage:
    python3 tools/ci-fetch-drive.py '<spec-json>' [limit] [outdir]

spec-json  = [{"url":"https://drive.google.com/drive/folders/XXXX","exam":"MID"}, ...]
             (exam = MID | FINAL — folder me mid/final na likha ho to yeh hint use hota hai)
limit      = max files per folder (default 400)
outdir     = default "out"

Output: out/<CODE>_<EXAM>__<originalname>.txt + out/_manifest.txt
"""
import json
import os
import re
import shutil
import subprocess
import sys
import time
import zipfile

try:
    import requests
except ImportError:
    subprocess.run([sys.executable, "-m", "pip", "install", "-q", "requests"], check=False)
    import requests

UA = {"User-Agent": "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124 Safari/537.36"}
SESSION = requests.Session()
SESSION.headers.update(UA)

SKIP_NAMES = re.compile(r"^(readme|notes|instructions|license|index)\b", re.I)


# ------------------------------------------------------------------ helpers
def log(*a):
    print(*a, flush=True)


def safe(name, maxlen=70):
    name = re.sub(r"[\\/:*?\"<>|]+", "_", name)
    name = re.sub(r"\s+", " ", name).strip()
    return name[:maxlen]


def load_subjects():
    """js/app.js se subject codes + titles nikalta hai."""
    codes, titles = {}, {}
    try:
        app = open(os.path.join(os.path.dirname(__file__), "..", "js", "app.js"), encoding="utf8").read()
        for m in re.finditer(r'code:"([A-Z]{2,4}\d{3})"\s*,\s*title:"([^"]+)"', app):
            codes[m.group(1)] = m.group(2)
            titles[m.group(1)] = m.group(2)
    except Exception as e:
        log("warning: app.js padh nahi paya:", e)
    return codes, titles


CODES, TITLES = load_subjects()
TITLE_WORDS = {c: [w for w in re.sub(r"[^A-Za-z ]", " ", t).lower().split() if len(w) > 4] for c, t in TITLES.items()}


def detect_code(text):
    """Text (folder + filename) se subject code dhoondta hai."""
    up = re.sub(r"[_\-.]+", " ", text).upper()
    m = re.search(r"\b([A-Z]{2,4})\s?(\d{3})\b", up)
    if m:
        code = (m.group(1) + m.group(2)).replace(" ", "")
        if code in CODES:
            return code
    low = text.lower()
    for code, words in TITLE_WORDS.items():
        if words and all(w in low for w in words[:2]) and len(words) >= 2:
            return code
    if m:
        return (m.group(1) + m.group(2)).replace(" ", "")
    return None


def detect_exam(text, hint=None):
    up = re.sub(r"[_\-.]+", " ", text).upper()
    if re.search(r"\bFINALS?\b|\bFINAL\s?TERM\b|\bFINALTERM\b", up):
        return "FINAL"
    if re.search(r"\bMID\b|\bMID\s?TERM\b|\bMIDTERM\b", up):
        return "MID"
    return hint or "MID"


# ------------------------------------------------------------------ drive crawl
def list_folder(fid):
    """embeddedfolderview se files + subfolders ki list nikalta hai."""
    url = f"https://drive.google.com/embeddedfolderview?id={fid}#list"
    for attempt in range(3):
        try:
            r = SESSION.get(url, timeout=60)
            if r.status_code == 200:
                break
        except Exception as e:
            log(f"  retry {attempt+1} list {fid}: {e}")
        time.sleep(3)
    else:
        return [], []
    html = r.text
    files, folders = [], []
    for seg in html.split('<div class="flip-entry"')[1:]:
        m_id = re.search(r'id="entry-([^"]+)"', seg)
        m_title = re.search(r'class="flip-entry-title">([^<]*)<', seg)
        if not m_id:
            continue
        eid, title = m_id.group(1), (m_title.group(1) if m_title else "")
        if "drive/folders/" in seg[:4000]:
            folders.append({"id": eid, "name": title})
        elif "drive.google.com/file/d/" in seg[:4000]:
            files.append({"id": eid, "name": title})
    return files, folders


def download_file(fid, dest_dir, name):
    """Drive se file download karta hai (virus-scan confirm token handle karke)."""
    os.makedirs(dest_dir, exist_ok=True)
    dest = os.path.join(dest_dir, safe(name, 120))
    if os.path.exists(dest) and os.path.getsize(dest) > 0:
        return dest
    url = "https://drive.google.com/uc"
    try:
        r = SESSION.get(url, params={"export": "download", "id": fid}, stream=True, timeout=180)
        ctype = r.headers.get("Content-Type", "")
        if "text/html" in ctype:  # confirm page (bari files)
            txt = r.text if not r.raw.closed else ""
            m_uuid = re.search(r'name="uuid" value="([^"]+)"', txt) or re.search(r"uuid=([a-zA-Z0-9_-]+)", txt)
            m_conf = re.search(r'name="confirm" value="([^"]+)"', txt) or re.search(r"confirm=([0-9A-Za-z_-]+)", txt)
            params = {"export": "download", "id": fid, "confirm": "t"}
            if m_uuid:
                params["uuid"] = m_uuid.group(1)
            if m_conf:
                params["confirm"] = m_conf.group(1)
            r.close()
            r = SESSION.get(url, params=params, stream=True, timeout=300)
            ctype = r.headers.get("Content-Type", "")
        if "text/html" in ctype:
            log(f"  ⚠️  download blocked (html page): {name}")
            return None
        with open(dest, "wb") as f:
            for chunk in r.iter_content(1 << 16):
                f.write(chunk)
        r.close()
        size = os.path.getsize(dest)
        if size < 200:
            log(f"  ⚠️  too small ({size}B): {name}")
            os.remove(dest)
            return None
        return dest
    except Exception as e:
        log(f"  ⚠️  download error {name}: {e}")
        return None


# ------------------------------------------------------------------ converters
def txt_from_pdf(path):
    out = path + ".txt"
    if shutil.which("pdftotext"):
        subprocess.run(["pdftotext", "-layout", "-enc", "UTF-8", path, out], check=False,
                       stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
        if os.path.exists(out) and os.path.getsize(out) > 200:
            return out
    try:
        from pdfminer.high_level import extract_text
        t = extract_text(path)
        if len(t.strip()) > 200:
            open(out, "w", encoding="utf8").write(t)
            return out
    except Exception:
        pass
    return out if os.path.exists(out) and os.path.getsize(out) > 200 else None


def txt_from_ooxml(path):
    """DOCX / PPTX / XLSX — zip + xml se text (koi dependency nahi)."""
    try:
        with zipfile.ZipFile(path) as z:
            names = [n for n in z.namelist() if
                     n.endswith(".xml") and (n.startswith("word/") or n.startswith("ppt/slides/") or n.startswith("xl/"))]
            parts = []
            for n in sorted(names):
                if n.endswith("document.xml") or "slides/slide" in n or n.endswith("sharedStrings.xml"):
                    xml = z.read(n).decode("utf8", "ignore")
                    xml = re.sub(r"</w:p>|</a:p>|</row>", "\n", xml)
                    xml = re.sub(r"<w:tab[^>]*/>", "  ", xml)
                    out = re.sub(r"<[^>]+>", "", xml)
                    out = (out.replace("&amp;", "&").replace("&lt;", "<").replace("&gt;", ">")
                              .replace("&quot;", '"').replace("&apos;", "'"))
                    if out.strip():
                        parts.append(out)
        txt = "\n".join(parts)
        if txt.strip():
            f = os.path.splitext(path)[0] + ".txt"
            open(f, "w", encoding="utf8").write(txt)
            return f
    except Exception as e:
        log(f"  ⚠️  ooxml fail {os.path.basename(path)}: {e}")
    return None


def convert(path):
    """Kisi bhi file ko text me badalta hai. Returns txt path or None."""
    ext = os.path.splitext(path)[1].lower()
    if ext == ".pdf":
        return txt_from_pdf(path)
    if ext in (".docx", ".pptx", ".xlsx"):
        return txt_from_ooxml(path)
    if ext in (".txt", ".md", ".csv", ".json"):
        if os.path.getsize(path) < 60:   # ".gitkeep" waghera
            return None
        return path
    if ext in (".jpg", ".jpeg", ".png", ".gif", ".webp"):
        return None                      # OCR nahi (image-only scans skip)
    if ext == ".doc":
        return None                      # purana Word format
    return None


# ------------------------------------------------------------------ main
def crawl(fid, path_names, spec_exam, limit, outdir, seen, stats, depth=0):
    if fid in seen or depth > 6:
        return
    seen.add(fid)
    files, folders = list_folder(fid)
    log(f"{'  ' * depth}📁 {'/'.join(path_names[-2:]) or fid} — {len(files)} files, {len(folders)} folders")
    ctx = " ".join(path_names + [spec_exam or ""])
    exam = detect_exam(ctx, spec_exam)

    for f in files[:limit]:
        if SKIP_NAMES.match(f["name"]):
            continue
        if not re.search(r"\.(pdf|docx|pptx|xlsx|txt|csv|json|zip)$", f["name"], re.I):
            stats["skipped_type"] += 1
            continue
        code = detect_code(" ".join(path_names) + " " + f["name"])
        if not code and not stats.get("all"):
            stats["skipped_nosubject"] += 1
            if stats["skipped_nosubject"] <= 25:
                log(f"     · skip (subject nahi mila): {f['name']}")
            continue
        if stats["files"] >= stats["max_total"]:
            stats["limit_hit"] = True
            return
        raw = download_file(f["id"], os.path.join(outdir, "_raw"), f["name"])
        if not raw:
            stats["failed"].append(f["name"])
            continue
        stats["files"] += 1
        if raw.lower().endswith(".zip"):
            try:
                with zipfile.ZipFile(raw) as z:
                    z.extractall(os.path.join(outdir, "_raw", "_zip"))
                    for root, _, names in os.walk(os.path.join(outdir, "_raw", "_zip")):
                        for n in names:
                            p = os.path.join(root, n)
                            t = convert(p)
                            if t:
                                stats["txt"] += 1
                                shutil.copyfile(t, os.path.join(outdir, f"{code or 'UNKNOWN'}_{exam}__{safe(n, 60)}.txt"))
            except Exception as e:
                log(f"  ⚠️  zip fail: {e}")
            continue
        t = convert(raw)
        if not t:
            stats["noconvert"].append(f["name"])
            continue
        stats["txt"] += 1
        dest = os.path.join(outdir, f"{code or 'UNKNOWN'}_{exam}__{safe(os.path.splitext(f['name'])[0], 60)}.txt")
        try:
            shutil.copyfile(t, dest)
        except Exception as e:
            log(f"  ⚠️  copy fail: {e}")

    for sub in folders:
        crawl(sub["id"], path_names + [sub["name"]], spec_exam, limit, outdir, seen, stats, depth + 1)


def main():
    if len(sys.argv) < 2:
        print(__doc__)
        sys.exit(1)
    spec = json.loads(sys.argv[1])
    limit = int(sys.argv[2]) if len(sys.argv) > 2 else 400
    outdir = sys.argv[3] if len(sys.argv) > 3 else "out"
    os.makedirs(outdir, exist_ok=True)
    stats = {"files": 0, "txt": 0, "max_total": int(os.environ.get("MAX_TOTAL", "3000")),
             "failed": [], "noconvert": [], "skipped_type": 0, "skipped_nosubject": 0, "limit_hit": False}

    for entry in spec:
        url = entry.get("url", "")
        m = re.search(r"/folders/([A-Za-z0-9_-]+)", url) or re.search(r"[?&]id=([A-Za-z0-9_-]+)", url)
        if not m:
            log("⚠️  folder id nahi mila:", url)
            continue
        log(f"\n=== {entry.get('label', url)} (exam={entry.get('exam', 'auto')}) ===")
        crawl(m.group(1), [entry.get("label", "")], entry.get("exam"), limit, outdir, set(), stats)
        if stats["limit_hit"]:
            log("⚠️  max_total limit hit — baqi folders skip")
            break

    # manifest
    files = sorted(f for f in os.listdir(outdir) if f.endswith(".txt") and not f.startswith("_"))
    man = [
        "AHW Quizverse — Drive fetch manifest",
        f"files downloaded: {stats['files']}   |   text files ready: {stats['txt']}",
        f"skipped (type): {stats['skipped_type']}   |   skipped (subject detect nahi hua): {stats['skipped_nosubject']}",
        f"convert nahi hua: {len(stats['noconvert'])}   |   download fail: {len(stats['failed'])}",
        "",
        "TEXT FILES (import ke liye):",
        *[f"  {f}" for f in files],
        "",
        "DOWNLOAD FAIL:",
        *[f"  {n}" for n in stats["failed"][:100]],
        "",
        "CONVERT FAIL (image scans / purana .doc):",
        *[f"  {n}" for n in stats["noconvert"][:100]],
    ]
    open(os.path.join(outdir, "_manifest.txt"), "w", encoding="utf8").write("\n".join(man))
    log("\n" + "\n".join(man[:12]))
    log(f"\n✅ {len(files)} text files ready in {outdir}/")
    if stats["limit_hit"]:
        sys.exit(3)


if __name__ == "__main__":
    main()
