#!/usr/bin/env python3
"""
AHW Quizverse — PDF / DOCX -> TXT helper
------------------------------------------------------------------
Drive / WhatsApp se mile past-paper files (PDF ya DOCX) ko plain text
me badal deta hai, taake:

    node tools/import-mcqs.js incoming/CS301_Final.txt

...seedha chala jaye.

Usage:
    python3 tools/pdf-to-text.py <file.pdf|file.docx|folder> [--out=incoming]

Engines (koi install lazmi nahi — jo mil jaye wohi use hota hai):
    DOCX : zip+xml (pure python, always works)
    PDF  : 1) pdftotext (poppler)  2) pdfminer.six  3) pypdf  4) built-in basic extractor
"""
import os
import re
import sys
import zipfile
import zlib

def docx_to_text(path):
    """DOCX = zip archive; document.xml se text nikalta hai (koi dependency nahi)."""
    with zipfile.ZipFile(path) as z:
        xml = z.read("word/document.xml").decode("utf8", "ignore")
    xml = re.sub(r"</w:p>", "\n", xml)
    xml = re.sub(r"<w:tab[^>]*/>", "  ", xml)
    xml = re.sub(r"<w:br[^>]*/>", "\n", xml)
    txt = re.sub(r"<[^>]+>", "", xml)
    txt = (txt.replace("&amp;", "&").replace("&lt;", "<").replace("&gt;", ">")
              .replace("&quot;", '"').replace("&apos;", "'"))
    return txt

def basic_pdf_to_text(path):
    """Simple text-PDFs ke liye chhota extractor (zlib streams + Tj/TJ operators)."""
    data = open(path, "rb").read()
    out = []
    for m in re.finditer(rb"stream\r?\n(.*?)endstream", data, re.S):
        raw = m.group(1)
        try:
            raw = zlib.decompress(raw)
        except Exception:
            pass
        try:
            s = raw.decode("latin-1")
        except Exception:
            continue
        if "Tj" not in s and "TJ" not in s:
            continue
        for line in re.findall(r"\[(.*?)\]\s*TJ|\((.*?)\)\s*Tj", s, re.S):
            chunk = line[0] or line[1] or ""
            parts = re.findall(r"\((.*?)(?<!\\)\)", chunk)
            text = "".join(parts)
            text = re.sub(r"\\([()\\])", r"\1", text)
            if text.strip():
                out.append(text)
        out.append("\n")
    return "\n".join(out)

def pdf_to_text(path):
    tmp = path + ".tmp.txt"
    # 1) poppler
    if os.system(f'pdftotext -layout "{path}" "{tmp}" 2>/dev/null') == 0 and os.path.exists(tmp):
        txt = open(tmp, encoding="utf8", errors="ignore").read()
        os.remove(tmp)
        if len(txt.strip()) > 100:
            return txt, "pdftotext"
    # 2) pdfminer.six
    try:
        from pdfminer.high_level import extract_text  # type: ignore
        txt = extract_text(path)
        if len(txt.strip()) > 100:
            return txt, "pdfminer"
    except Exception:
        pass
    # 3) pypdf
    try:
        from pypdf import PdfReader  # type: ignore
        txt = "\n".join((p.extract_text() or "") for p in PdfReader(path).pages)
        if len(txt.strip()) > 100:
            return txt, "pypdf"
    except Exception:
        pass
    # 4) built-in
    txt = basic_pdf_to_text(path)
    return txt, ("built-in (basic)" if len(txt.strip()) > 100 else "FAILED")

def convert(src, outdir):
    if os.path.isdir(src):
        files = []
        for root, _, names in os.walk(src):
            files += [os.path.join(root, n) for n in names if n.lower().endswith((".pdf", ".docx"))]
    else:
        files = [src]
    if not files:
        print("Koi PDF/DOCX nahi mili.")
        return 1
    os.makedirs(outdir, exist_ok=True)
    ok = 0
    for f in files:
        base = os.path.splitext(os.path.basename(f))[0] + ".txt"
        dest = os.path.join(outdir, base)
        if f.lower().endswith(".docx"):
            txt, eng = docx_to_text(f), "docx-xml"
        else:
            txt, eng = pdf_to_text(f)
        if eng.startswith("FAILED") or len(txt.strip()) < 60:
            print(f"⚠️  {os.path.basename(f)} -> text nahi nikla (scanned image PDF ho sakti hai).")
            print("    Hal: file ko Word/Google Docs me khol kar .txt/.docx me save karein,")
            print("         ya ise 'incoming/' me daal dein aur CSV/JSON me convert karein.")
            continue
        open(dest, "w", encoding="utf8").write(txt)
        print(f"✅ {os.path.basename(f)} -> {dest}  [{eng}, {len(txt)} chars, {txt.count(chr(10))} lines]")
        ok += 1
    print(f"\n{ok}/{len(files)} file(s) convert hui. Ab:\n  node tools/import-mcqs.js {outdir} --dry")
    return 0 if ok else 1

if __name__ == "__main__":
    args = [a for a in sys.argv[1:] if not a.startswith("--")]
    outdir = next((a.split("=", 1)[1] for a in sys.argv[1:] if a.startswith("--out=")), "incoming")
    if not args:
        print(__doc__)
        sys.exit(1)
    sys.exit(convert(args[0], outdir))
