# 🚀 AHW Quizverse — Aage ka Roadmap (Feature Plan)

**Date:** 17 Sep 2026 · Ye document batata hai ke website ko students ke liye *aur* unique, interesting aur helpful banane ke liye kya karna chahiye — priority order me, effort ke sath.

---

## 🥇 Phase 1 — Content ko "exam-ready" karna (sab se zaroori)

| # | Kaam | Kyun zaroori | Effort |
|---|---|---|---|
| 1 | ✅ **Past papers import ho gaye** — 4,167 → **7,587 MCQs** (38 banks barhe, 5 banks 200+, 15 banks 100+). Baqi FINAL banks + missing subjects ke liye aur papers chahiye | Content hi asli product hai | ✅ Done (mid-term) |
| 2 | **Baqi banks 200+ tak le jana** — khaas kar FINAL banks (abhi zyada tar 36 MCQs) aur thin subjects (ECO404, ECO501, ENG401/501/502, PSY405/406/504/505, SOC201/301/302/401) | Final term me bhi wohi depth chahiye | Medium (data) |
| 3 | **Performance: per-subject lazy loading** — 1.7 MB data har visit par load hota hai; subject kholne par hi uska bank load ho | Mobile par first load tez, data unlimited barh sakta hai | 3–4 hr |
| 3 | **Solved past papers** (2020–2025) har subject ka "Past Papers" level | VU me past paper practice = sab se zyada maangi jane wali cheez (YouTube pe log videos banate hain kyunki official papers nahi milte) | Medium |
| 4 | Har MCQ me **Lecture number** tag (importer already `meta.lec` save karta hai) → "Lecture-wise practice" | Handout ke lecture 12 tak paper aata hai; student ko exactly wohi lecture practice karni hoti hai | Low (data already aa rha hai) |

> **Note:** Import tool subject ko **filename se khud pehchanta hai** (`CS301_Final.txt`, `Data Structures Final MCQs.docx`), duplicates (fuzzy 82%+ similarity) skip karta hai, answer key na ho to flag karta hai, aur `data/.backups/` me backup rakh kar `reports/import-*.md` me hisaab deta hai.

---

## 🥈 Phase 2 — "Unique" gameplay (jaldi, kam mehnat, zyada fark)

| # | Feature | Kya karega | Kyun unique/helpful | Effort |
|---|---|---|---|---|
| 5 | **🎯 Weakness Trainer (spaced repetition)** | Mistake Vault ke ghalat MCQs ko SM-2 style schedule par dobara pesh karega (1 din → 3 din → 7 din → 21 din). Jo 3 baar sahi kare woh "mastered" ho jaye | Abhi vault sirf list hai. Ye ek *learning system* ban jata hai — students ka result actually improve hota hai | 2–3 hr |
| 6 | **🔥 Daily Challenge + Study Streak** | Roz 10 MCQs (mixed subjects), calendar me streak, XP bonus, "7-din streak" badge | Habit banati hai — student roz wapas aata hai. Retention = sab se bara game | 2 hr |
| 7 | **📤 WhatsApp Score Card (share image)** | Result ke baad canvas se ek sundar card: naam, subject, score, streak, "Mera 87% — tum try karo" + link | Free viral growth; VU students WhatsApp groups me share karte hain — app khud phailti hai | 2 hr |
| 8 | **🔍 Global MCQ Search** | Ek search box jo 4,152 MCQs me se keyword se question + explanation dhoond de (e.g. "normalization", "TCP", "Bayes") | Revision ke waqt handouts kholne se behtar; unique feature hai | 2 hr |
| 9 | **🔖 Bookmark / Flag for review** | Mushkil sawal ⭐ save karo, baad me "My Flagged" arena me practice | Students khud apna weak list banate hain | 1 hr |
| 10 | **📝 Handout Short Notes** (subject-wise) | Har subject ke liye 1-page cheat sheet (formulas, definitions) + PDF download | Exam se 1 din pehle yahi chahiye hota hai | Content Heavy |

---

## 🥉 Phase 3 — Social + VU-specific (bara fark, thora zyada kaam)

| # | Feature | Kya karega | Kyun | Effort |
|---|---|---|---|---|
| 11 | **📅 Exam Countdown + Auto Study Plan** | Student apne subjects + exam dates daale → app roz ka plan banaye ("aaj CS301 ke lecture 1–9, 30 MCQs") | VU me mid/final dates fix hoti hain; ye feature kisi doosri site me nahi | 3–4 hr |
| 12 | **🏆 Class / Friends Leaderboard (real)** | Ab leaderboard sirf usi phone ka hai. Ek chhota free backend (Cloudflare Worker + KV ya Firebase) se class code se join → real weekly leaderboard | Dost mukabla karenge → engagement double | 4–5 hr |
| 13 | **📚 Past Paper PDF Library** | Har subject ke solved/unsolved past papers download ke liye (jo aap Drive me rakhein) | Students PDF bhi maangte hain, sirf quiz se kaam nahi chalta | 2 hr + content |
| 14 | **📱 Admin Panel (in-browser CSV upload)** | Aap khud browser se CSV daal kar MCQs add kar sakein — coding ke bina | Aap ko har baar mujh par depend na hona pare | 3 hr |
| 15 | **🗣️ Urdu + English Explanation Toggle** | Har MCQ ki tafseel Roman Urdu me bhi | VU ke bohat se students ko English explanation mushkil lagti hai — **ye hamara unique point ban sakta hai** | Content + 3 hr |
| 16 | **🤖 AI se Handout → MCQ** (bring-your-own Gemini key) | Student handout PDF daale, AI MCQs bana de, phir quiz khele | Sab se "wow" feature — lekin API key/limits ka masla | 5–6 hr |
| 17 | **🎧 "Listen" mode (audio explanation)** | Explanation ko awaaz me sunein (phone chalate waqt revision) | Pakistan me commute par parhne wale students ke liye | 3 hr |
| 18 | **👥 Live Multiplayer Quiz (rooms)** | 2–10 dost ek room me same questions, live scoreboard | Fun factor top, lekin backend chahiye | 6–8 hr |

---

## 🧹 Phase 4 — Hygiene / Polish (chhote kaam, bara professional fark)

- **GitHub Pages par deploy** → permanent link `https://harryvu096.github.io/Quizwebsite/` (30 second ka kaam, Settings → Pages). Abhi log jsDelivr/raw links use kar rahe hain jo slow aur adhoora experience dete hain.
- **Custom domain** (e.g. `ahwquizverse.com` ya free Cloudflare Pages) — WhatsApp par bharosa barhta hai.
- **Mock Exam ko visible karein** — UPDATES.md me likha hai "filhal hidden" — jab 50-min VU layout ready hai to ise enable kar dein, ye killer feature hai.
- **`LICENSE`** file + footer credit (already hai) — AGPL/MIT choose karein.
- **GitHub Actions**: har push par `node tools/build.js` + import-report validation — ghalat MCQ repo me na aaye.
- **Privacy-friendly analytics** (Umami/Plausible ya simple hit counter) → pata chale kaun se subjects sab se zyada kholay ja rahe hain, kahan students atakte hain.
- **Accessibility sweep** (ANALYSIS.md me #13–20): `<h1>`, aria-labels, `prefers-reduced-motion`, 12px minimum font.
- **Phone number** ko email/Google Form se replace (privacy risk).
- **Bilingual UI** (English/Urdu labels) — VU ka asli audience Urdu-first hai.

---

## 📊 Agar sirf 5 cheezein karni hon (mera mashwara)

1. **MCQ import se har bank 100+ karein** (Drive se) — content = product.
2. **Weakness Trainer (spaced repetition)** — app *study tool* ban jayegi, sirf game nahi.
3. **Daily Challenge + streak** — rozana wapsi.
4. **WhatsApp score card** — muft growth.
5. **Global MCQ search** — revision ka best tool.

Ye 5 mil kar app ko "VU students ke liye must-have" bana deti hain. Baad me leaderboard + exam planner + Urdu explanations.

---

## 🛠️ Import workflow (aaj se ready hai)

```bash
# 1) Drive/WhatsApp ki files ko incoming/ me rakhein (PDF/DOCX/TXT/CSV/JSON)

# 2) PDF/DOCX -> TXT (agar zaroorat ho)
python3 tools/pdf-to-text.py incoming --out=incoming

# 3) Pehle dry-run: sirf report dekhein (kuch save nahi hota)
node tools/import-mcqs.js incoming --dry

# 4) Report check karne ke baad asli import
node tools/import-mcqs.js incoming

# 5) Single-file build update
node tools/build-standalone.js
```

**Format jo tool khud samajh leta hai:**

```
1. Question text yahan?
A) option 1
B) option 2
C) option 3
D) option 4
Answer: B
Explanation: tafseel yahan
```

Iske ilawa: `a) opt b) opt c) opt d) opt` ek hi line me, correct option par `*`, `Answer: option ka text`, CSV (`question,optionA,optionB,optionC,optionD,answer,explanation`), aur JSON (`[[q,[o1,o2,o3,o4],ansIdx,why]]`).

**Safety:** har import se pehle `data/.backups/mcqs-<timestamp>.json` backup banta hai, aur har MCQ validate hota hai (answer index range, 2+ options, duplicate options, missing explanation) — kharab data repo me nahi ja sakta.
