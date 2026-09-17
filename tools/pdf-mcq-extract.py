#!/usr/bin/env python3
"""
AHW Quizverse — PDF -> MCQ text (answer-key aware)  ⭐ main extractor
------------------------------------------------------------------
VU past-paper PDFs (Moaaz / Waqar / Faheem collections) me SAHI jawab ka nishan:
  1) **bold font**  (Times-Bold / Arial-Bold ...)  ← sab se aam
  2) Wingdings/Symbol glyph (U+F020 = ✔) option ke aage
Normal text extraction dono gira deta hai — is liye answer key gum ho jati hai.

Ye script pdfminer se har line ka text + font + position nikalta hai, har sawal ke
options ka "bold ratio" compute karta hai, aur sahi option ko mark karta hai:

    ► BASIC
    ► **PASCAL**        <-- sahi jawab (bold tha)
    ► JAVA

Phir `tools/import-mcqs.js` (solved-paper mode) is text ko MCQs me badal deta hai.

Usage:
    python3 tools/pdf-mcq-extract.py <file.pdf|folder> [--out=incoming] [--min-bold=0.7] [--bold-only]
"""
import os
import re
import sys

try:
    from pdfminer.high_level import extract_pages
    from pdfminer.layout import LTTextContainer, LTChar
except ImportError:
    print("pdfminer install karein:  pip3 install --break-system-packages pdfminer.six")
    sys.exit(1)

BOLD_HINTS = ("bold", "black", "heavy", "semibold", "demi", "extrabold")
OPT_CHARS = "►▶➢→»•"
PUA = re.compile(r"[\ue000-\uf8ff]")
MIN_BOLD = next((float(a.split("=", 1)[1]) for a in sys.argv[1:] if a.startswith("--min-bold=")), 0.7)
BOLD_ONLY = "--bold-only" in sys.argv
RE_QNO = re.compile(r"Question\s*No\s*[:.\-]?\s*\d+", re.I)


def is_bold(fontname):
    f = (fontname or "").lower()
    if "+" in f:
        f = f.split("+", 1)[1]
    f = f.replace("bolditalic", "")
    return any(h in f for h in BOLD_HINTS) and "italic" not in f


def _chars(tl):
    try:
        it = iter(tl)
    except TypeError:
        return [tl]
    return [ch for ch in it if hasattr(ch, "get_text")]


def line_info(tl):
    """-> dict(text, bold_ratio, has_pua, y0, y1)  (option marker chars ignore karke)"""
    chars = [c for c in _chars(tl) if isinstance(c, LTChar)]
    if not chars:
        return None
    text_parts, mark_chars = [], []
    for c in chars:
        t = c.get_text()
        if PUA.search(t):
            mark_chars.append(c)
            continue
        text_parts.append((t, c))
    text = "".join(t for t, _ in text_parts)
    meaningful = [(t, c) for t, c in text_parts if t.strip() and t not in OPT_CHARS]
    bold = sum(1 for t, c in meaningful if is_bold(c.fontname))
    ratio = bold / len(meaningful) if meaningful else 0.0
    bbox = tl.bbox
    return {"text": text.rstrip(), "ratio": ratio, "pua": len(mark_chars),
            "y0": bbox[1], "y1": bbox[3], "x0": bbox[0]}


def extract_lines(path):
    out = []
    for page in extract_pages(path):
        rows = []
        for el in page:
            if not isinstance(el, LTTextContainer):
                continue
            for tl in el:
                info = line_info(tl)
                if info and info["text"].strip():
                    rows.append(info)
        rows.sort(key=lambda r: (-r["y1"], r["x0"]))
        out.extend(rows)
    return out


def flag_answers(rows):
    """Har sawal ke options me se sahi option ko '**' se mark karta hai."""
    def is_opt(r):
        return any(ch in r["text"] for ch in OPT_CHARS)

    groups, cur = [], None
    for r in rows:
        if RE_QNO.search(r["text"]):
            if cur:
                groups.append(cur)
            cur = []
        if cur is not None and is_opt(r):
            cur.append(r)
    if cur:
        groups.append(cur)

    for opts in groups:
        if not opts:
            continue
        scored = [o["ratio"] for o in opts]
        best = max(scored)
        winners = [o for o in opts if o["ratio"] == best]
        if best >= MIN_BOLD and len(winners) == 1:
            winners[0]["flag"] = "bold"
            continue
        pua = [o for o in opts if o["pua"] > 0]
        if len(pua) == 1:
            pua[0]["flag"] = "glyph"
    return rows


def render(rows):
    lines = []
    for r in rows:
        text = re.sub(r"[ \t]{2,}", " ", r["text"]).strip()
        if r.get("flag"):
            m = re.match(rf"^([{OPT_CHARS}]\s*)(.*)$", text)
            if m and m.group(2).strip():
                inner = m.group(2).strip().replace("**", "")
                text = f"{m.group(1)}**{inner}**"
            else:
                text = "**" + text.replace("**", "") + "**"
        lines.append(text)
    return "\n".join(lines)


def process(path, outdir):
    try:
        rows = flag_answers(extract_lines(path))
        txt = render(rows)
    except Exception as e:
        return None, f"extract fail: {type(e).__name__}: {e}"
    if not txt.strip():
        return None, "koi text nahi (scanned PDF?)"
    name = re.sub(r"\s+", " ", os.path.splitext(os.path.basename(path))[0])[:70]
    dest = os.path.join(outdir, name + ".txt")
    keep = []
    for l in txt.split("\n"):
        s = l.strip()
        if re.fullmatch(r"\d{1,3}", s):
            continue
        keep.append(l)
    open(dest, "w", encoding="utf8").write("\n".join(keep))
    flagged = sum(1 for r in rows if r.get("flag"))
    qs = sum(1 for r in rows if RE_QNO.search(r["text"]))
    return dest, f"{qs} questions, {flagged} answer-markers"


if __name__ == "__main__":
    args = [a for a in sys.argv[1:] if not a.startswith("--")]
    outdir = next((a.split("=", 1)[1] for a in sys.argv[1:] if a.startswith("--out=")), "incoming")
    if not args:
        print(__doc__)
        sys.exit(1)
    os.makedirs(outdir, exist_ok=True)
    src = args[0]
    files = []
    if os.path.isdir(src):
        for root, _, names in os.walk(src):
            files += [os.path.join(root, n) for n in names if n.lower().endswith(".pdf")]
    else:
        files = [src]
    ok = 0
    for f in sorted(files):
        dest, msg = process(f, outdir)
        print(("✅ " if dest else "⚠️  ") + os.path.basename(f)[:58] + " -> " + msg)
        ok += 1 if dest else 0
    print(f"\n{ok}/{len(files)} PDF -> text. Ab:  node tools/import-mcqs.js {outdir} --dry")
