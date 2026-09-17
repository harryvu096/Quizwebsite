# ⚡ AHW Quizverse — VU Exam Arena

Gamified MCQ practice arena for Virtual University students: **68 subjects · 7,587 past-paper MCQs · Mid + Finalterm arenas**, with hearts, streaks, boss battles, XP levels, certificates and a Mistake Vault.

## 🆕 Latest Feature Updates (English)

- **Mobile feedback bottom-sheet + auto-scroll** — after answering, the view scrolls so the explanation and Next button sit comfortably on screen; on small screens the feedback panel sticks to the bottom thumb-zone.
- **Swipe navigation (quiz screen)** — swipe **right** for the next question, swipe **left** to reopen the previous question in a read-only review state (your pick marked ✕, correct marked ✓). Hearts, score and timer stay untouched while reviewing.
- **Vibration (haptics)** — short buzz on correct answers, double buzz on wrong ones. Toggle with the 📳 button in the quiz topbar (ON by default, can be switched OFF).
- **Turbo Mode ⚡ (opt-in, OFF by default)** — toggle in the quiz topbar; when enabled, the next question loads automatically 1.5 seconds after answering. The button pulses while active. Auto-next never fires during review, modals, or when out of hearts.
- **Wrong-pick ✕ marker** — the option a player chose wrongly is now marked with a ✕ just like the correct option gets a ✓.
- **Phone back button** — walks screen-by-screen inside the app (quiz → map → exams → subjects → home) instead of leaving the website; 🏠 buttons and a clickable AHW logo jump home anytime.
- **Footer credit** — "Developed by All VU Students · Credit: All VU Students".
- **PWA (offline + installable)** — `manifest.webmanifest` + `sw.js` cache the whole app (shell + all 4,152 MCQs). On the hosted site students get "Add to Home Screen" and full offline practice; SW auto-registers on http(s) only, so the double-click file keeps working too.
- **Progress Export / Import** — 📤 downloads a JSON backup of XP, stars, certs, leaderboard and Mistake Vault; 📥 restores it on any device (buttons on the Subjects topbar).
- **Category tidy-up** — chip renamed "Management & Economics"; every category lists subjects in code order (CS101 → CS201 → …, ENG101 → ENG201 → …).
- **💻 C++ Lab (online compiler)** — real compile + run via a fast parallel provider race (Judge0 GCC-14, Wandbox GCC-14, Compiler Explorer, CORS-proxy fallbacks, custom Piston support), dark mini-IDE with tabs for multiple files, line numbers + syntax highlighting + Tab support, stdin input box, **.cpp download (Content-Disposition, always .cpp) / open .cpp files / auto-save**, VU assignment snippets (menu-driven, class skeleton, file I/O, pointers), expert Settings (C++14/17/20, -O0/-O2, -Wall, custom API URL, font size, light theme), and **20 VU handout-based challenges (CS201/CS301/CS304) with AUTO-CHECK + XP rewards** — boring practice becomes a game. Internet required for Run. All UI text in English.
- **Mock Exam (VUtes-style midterm)** — home button opens a subject picker; the exam room mirrors VU's qb.vu.edu.pk layout: question with radio options on the left, question palette + Submit on the right, 50-minute countdown on top (red pulse in the last 5 minutes, auto-submit at 0:00). Objective subjects (CS101, ENG101, PAK301, ISL202, PHY101, MGT301, MGT503, SOC101, PSY101) get **40 MCQs / 40 marks**; all other subjects get **14 MCQs + 2 short (3 marks) + 2 long (5 marks) = 30 marks**. MCQs auto-graded; subjective answers are self-checked against a model answer in the result screen (award-marks buttons). Result shows MCQ marks, subjective marks, total, percentage, VU-style grade (A+…F) and pass/fail at 40%. Questions are drawn from the same banks already in the app (mid bank first, topped up from the final bank when needed). ISL202 Islamiat bank (40 MCQs) added for the objective list.

## 📁 File Structure (3 + data)

```
Quizwebsite/
├── index.html          ← HTML shell (~39 KB) — structure & screens
├── css/style.css       ← poori styling (CSS3, custom animations)
├── js/app.js           ← game engine (quiz logic, XP, vault, certs)
├── js/compiler.js      ← 💻 C++ Lab (online compiler)
├── data/
│   ├── mcqs.json       ← ✅ SAB subjects ke MCQs (single source of truth)
│   └── mcqs.js         ← auto-generated mirror (see below)
├── tools/build.js      ← data builder/validator (Node)
├── tools/build-standalone.js ← standalone.html generator (Node)
├── tools/import-mcqs.js ← 📥 MCQ importer (JSON/CSV/TXT + Moaaz solved-paper mode)
├── tools/pdf-mcq-extract.py ← ⭐ PDF ➜ text WITH answer key (bold/glyph detection)
├── tools/pdf-to-text.py ← simple PDF/DOCX ➜ TXT converter
├── tools/clean-mcqs.py ← data cleaner (page-refs, glued-text junk)
├── standalone.html     ← poori site EK file mein (share/offline)
├── sw.js + manifest.webmanifest ← PWA (install + offline)
├── ahw-quizverse-netlify.zip    ← ready-to-deploy bundle
├── og-banner.jpg       ← WhatsApp/social share image
├── ROADMAP.md          ← feature plan (kya banana chahiye, priority ke sath)
└── ANALYSIS.md         ← full website audit
```

> ⚠️ **Clone/paste karne se pehle ye parhein (important):** poora multi-file project **default branch `main`** par aata hai
> (PR #1 merge hone ke baad). Us se pehle clone karen to purani *single-file* `index.html` mil sakti hai — is liye
> branch specify karein:
> ```bash
> git clone -b arena/01a0adf1-quizwebsite https://github.com/harryvu096/Quizwebsite.git
> ```
> Kisi AI ko repo dena ho to yehi bolein: *"repo ka complete version branch `main` (ya `arena/01a0adf1-quizwebsite`) se padho"* —
> warna AI sirf ek HTML file dekh kar adhoora jawab deta hai.

## 📲 Mobile / Online Preview

- **standalone.html** — poori site EK file mein (CSS+JS+data inline). Download kar ke phone par kholo, ya WhatsApp par share karo.
  Regenerate: `node tools/build-standalone.js`
- **Online links (mobile-friendly), order mein try karein:**
  1. `https://cdn.jsdelivr.net/gh/harryvu096/Quizwebsite@arena/01a0adf1-quizwebsite/standalone.html`
  2. `https://rawcdn.githack.com/harryvu096/Quizwebsite/arena/01a0adf1-quizwebsite/standalone.html`
  3. `https://htmlpreview.github.io/?https://github.com/harryvu096/Quizwebsite/blob/arena/01a0adf1-quizwebsite/standalone.html`
- **GitHub Pages (recommended, permanent):** repo Settings → Pages → Source: *Deploy from a branch* → branch `arena/01a0adf1-quizwebsite` / root → Save. Phir site `https://harryvu096.github.io/Quizwebsite/` par live ho jayegi. (Sandbox token ko Pages API ka access nahi, is liye ye 30-second step repo owner karega.)

## ▶️ Chalane ka tareeqa

**Option A — HTML file se (no server needed):**
Poora folder download karein aur `index.html` par double-click karein. Sab kuch relative `<link>`/`<script>` tags se load hota hai (koi `fetch()` nahi), is liye **file:// par 100% chalta hai** — offline bhi!

**Option B — koi bhi static server:**
```bash
python3 -m http.server 8080        # phir http://localhost:8080
```
GitHub Pages par bhi seedha deploy ho sakta hai (Settings → Pages → branch select).

## ✏️ MCQs add / edit karne ka tareeqa

1. `data/mcqs.json` kholein — har bank ka format:
   ```json
   "Q_CS402_MID": { "lv": [ { "id":1, "icon":"🔤", "name":"...", "desc":"...",
       "c1":"#8b5cf6", "c2":"#ec4899",
       "questions": [ ["Question text ___", ["optA","optB","optC","optD"], correctIndex, "Why explanation"], ... ]
     } ], "boss": { ... } }
   ```
2. Phir run karein:
   ```bash
   node tools/build.js
   ```
   Ye `mcqs.json` ko validate karta hai (wrong answer index / missing explanation pakarta hai) aur `data/mcqs.js` regenerate kar deta hai.

> **`mcqs.js` kyun hai?** Browser `fetch()` se JSON **file:// par nahi** padh sakta. Is liye app JSON ko `<script>` tag se load karta hai — yehi trick site ko double-click-open banati hai. HTTP server par bhi wahi file chalti hai.

## 📥 Drive / PDF / past papers se MCQs import karna (naya)

Poori tafseel `ROADMAP.md` me hai — short version:

```bash
# 1) Drive/WhatsApp ki PDF/DOCX/TXT/CSV/JSON files ko incoming/ me rakhein

# 2) PDF -> text (ANSWER KEY ke sath) — Moaaz/Waqar past papers ke liye
python3 tools/pdf-mcq-extract.py incoming --out=incoming

#    (simple PDF/DOCX ke liye: python3 tools/pdf-to-text.py incoming)

# 3) Dry-run: sirf report (kuch save nahi hota)
node tools/import-mcqs.js incoming --dry

# 4) Report check karne ke baad asli import (backup + validation khud hoti hai)
node tools/import-mcqs.js incoming

# 5) Single-file build update
node tools/build-standalone.js
```

**Importer kya khud karta hai:**

- **Subject + exam khud pehchanta hai** — filename ya text se (`CS301_Final.txt` → `Q_CS301_FINAL`, `Data Structures Mid MCQs.docx` → `Q_CS301_MID`). Manual override: `--subject=Q_CS201_FINAL`.
- **Duplicate skip** — pehle se mojood sawal (82%+ similarity) dobara add nahi hota.
- **Answer key dhoondta hai** — `Answer: B`, `Correct: option text`, correct option par `*` ya `✓`, CSV column, JSON index (0-based ya 1-based — `--ans-base=1`).
- **Safety** — har import se pehle `data/.backups/mcqs-<timestamp>.json`, har MCQ ki validation (answer index range, 2+ options, duplicate options, missing explanation), aur `reports/import-<timestamp>.md` me poora hisaab (kitne add, kitne dup, kya skip hua aur kyun).
- **Levels me barabar baantta hai** (`--distribute=even`, default) — ya sab ek level me (`--distribute=level2`).

**Solved-paper mode (Moaaz/Waqar collections):** `Question No: 5 ( Marks: 1 )` wale papers khud detect ho jate hain — sahi option **bold font** ya ✔ glyph se pakra jata hai (`tools/pdf-mcq-extract.py` usay `► **correct**` bana deta hai), baqi options se answer key nikal aati hai.

> Explanation na ho to `--why=placeholder` (default) ya `--why=answer`. Naya bank banana ho (subject app me nahi) to `--new-bank`.

> **Data size:** 7,587 MCQs = `data/mcqs.json` ~1.7 MB (standalone.html ~1.9 MB). Pehli visit par ye load hota hai, phir PWA cache se **offline** chalta hai. Agla optimization: per-subject lazy loading (ROADMAP.md).

## 🎨 Tailwind CSS — use karein ya nahi? (Faisla)

**Mera mashwara: is project ke liye CSS3 hi behtar hai — Tailwind NAI.** Wajuhat:

| Point | CSS3 (current) | Tailwind |
|---|---|---|
| **Build step** | ❌ zaroorat nahi — file double-click se chalti hai | ✅ Node/build (Vite) lazmi — warna utility classes kaam nahi karti |
| **Offline / file://** | ✅ 100% offline | ❌ CDN (Play CDN) online-internet mangta hai; offline install toot jata hai |
| **Custom game feel** | ✅ bounce, confetti, ribbons, gradients — hand-crafted | ⚠️ har custom animation ke liye phir bhi custom CSS likhni parti hai |
| **File size** | 23 KB | CDN script ~300 KB+ runtime JIT |
| **Team speed** | 1 developer ke liye simple | Bari team mein consistent, lekin yahan overkill |

**Kab Tailwind theek hota?** Agar aap future mein multi-page site + build pipeline (Vite/Next) + bari team banayen, to Tailwind utility classes se UI tez banta hai aur design consistent rehta hai. Tab `js/app.js` ko components mein tor kar Tailwind + Vite use karein.

**Abhi ke liye:** current CSS3 ko section-wise organized rakhein (already hai), `prefers-reduced-motion` jaise modern CSS features add karte jayen. Hybrid bhi possible hai: custom CSS base + sirf spacing utilities ke liye kuch classes — lekin build-step ke bina full Tailwind faida nahi deta.

## 🗺️ Roadmap

Poora feature plan **`ROADMAP.md`** me hai. Top 5 (mera mashwara):

1. **Content**: import tool se har subject ka bank **100+ MCQs** karein (abhi har bank 30–36).
2. **🎯 Weakness Trainer** (spaced repetition) — Mistake Vault ko learning system banaye.
3. **🔥 Daily Challenge + streak** — rozana wapsi (retention).
4. **📤 WhatsApp score card** — free viral growth.
5. **🔍 Global MCQ search** — revision ka best tool.

Purana status: ✅ Enter bug fix · ✅ Coming-soon system · ✅ meta/OG tags · ✅ file split · ✅ PWA + offline · ✅ export/import · ⏳ accessibility sweep (h1, aria-labels, reduced-motion).

## 📞 Support

Site ke andar Contact modal maujood hai. © 2026 AHW Quizverse · Made by Huraira ❤️
