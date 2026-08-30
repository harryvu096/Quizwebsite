# ⚡ AHW Quizverse — VU Exam Arena

Gamified MCQ practice arena for Virtual University students: **50 subjects · 3,322 past-paper style MCQs · Mid + Finalterm arenas**, with hearts, streaks, boss battles, XP levels, certificates and a Mistake Vault.

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
- **💻 C++ Lab (online compiler)** — real compile + run via free Piston API (g++), dark editor with line numbers + syntax highlighting + Tab support, stdin input box, **.cpp download / .cpp open / auto-save**, VU assignment snippets (menu-driven, class skeleton, file I/O, pointers), aur **20 VU handout-based challenges (CS201/CS301/CS304) with AUTO-CHECK + XP rewards** — boring practice ab game hai. Run ke liye internet zaroori hai.
- **Mock Exam (VUtes-style midterm)** — home button opens a subject picker; the exam room mirrors VU's qb.vu.edu.pk layout: question with radio options on the left, question palette + Submit on the right, 50-minute countdown on top (red pulse in the last 5 minutes, auto-submit at 0:00). Objective subjects (CS101, ENG101, PAK301, ISL202, PHY101, MGT301, MGT503, SOC101, PSY101) get **40 MCQs / 40 marks**; all other subjects get **14 MCQs + 2 short (3 marks) + 2 long (5 marks) = 30 marks**. MCQs auto-graded; subjective answers are self-checked against a model answer in the result screen (award-marks buttons). Result shows MCQ marks, subjective marks, total, percentage, VU-style grade (A+…F) and pass/fail at 40%. Questions are drawn from the same banks already in the app (mid bank first, topped up from the final bank when needed). ISL202 Islamiat bank (40 MCQs) added for the objective list.

## 📁 File Structure (3 + data)

```
Quizwebsite/
├── index.html          ← HTML shell (21 KB) — structure & screens
├── css/style.css       ← poori styling (CSS3, custom animations)
├── js/app.js           ← game engine (quiz logic, XP, vault, certs)
├── data/
│   ├── mcqs.json       ← ✅ SAB subjects ke MCQs (single source of truth)
│   └── mcqs.js         ← auto-generated mirror (see below)
├── tools/build.js      ← data builder/validator (Node)
├── og-banner.jpg       ← WhatsApp/social share image
└── ANALYSIS.md         ← full website audit & roadmap
```

## 📲 Mobile / Online Preview

- **standalone.html** — poori site EK file mein (CSS+JS+data inline). Download kar ke phone par kholo, ya WhatsApp par share karo.
  Regenerate: `node tools/build-standalone.js`
- **Online links (mobile-friendly), order mein try karein:**
  1. `https://cdn.jsdelivr.net/gh/harryvu096/Quizwebsite@arena/01a034d6-quizwebsite/standalone.html`
  2. `https://rawcdn.githack.com/harryvu096/Quizwebsite/arena/01a034d6-quizwebsite/standalone.html`
  3. `https://htmlpreview.github.io/?https://github.com/harryvu096/Quizwebsite/blob/arena/01a034d6-quizwebsite/standalone.html`
- **GitHub Pages (recommended, permanent):** repo Settings → Pages → Source: *Deploy from a branch* → branch `arena/01a034d6-quizwebsite` / root → Save. Phir site `https://harryvu096.github.io/Quizwebsite/` par live ho jayegi. (Sandbox token ko Pages API ka access nahi, is liye ye 30-second step repo owner karega.)

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

## 🗺️ Roadmap (ANALYSIS.md se)

- ✅ P0: Enter bug fix, Coming-Soon system, meta/OG tags, 9 missing subjects filled
- ✅ P2: File split (HTML/CSS/JS/JSON)
- ⏳ P1: wall-clock timer + tab-hide pause; modal Esc/backdrop close
- ⏳ P2: PWA (manifest + service worker) for offline install
- ⏳ P3: accessibility sweep (h1, aria-labels), progress export/import

## 📞 Support

Site ke andar Contact modal maujood hai. © 2026 AHW Quizverse · Made by Huraira ❤️
