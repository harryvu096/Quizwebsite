# 🔍 AHW Quizverse — Complete Website Analysis

**Date:** 24 Aug 2026 · **File analyzed:** `index.html` (4,282 lines, 492 KB, gzip ~171 KB)

---

## ✅ Pehle Good News — Jo Cheezein Achi Hain

| # | Good Point |
|---|-----------|
| 1 | JavaScript **syntactically valid** hai (Node `--check` pass) — koi crash-worthy syntax error nahi |
| 2 | **2,117 MCQs** parse kiye gaye — **0 data errors**: na koi wrong answer index, na duplicate options, na missing explanation |
| 3 | Game design zabardast hai: ❤️ hearts, 🔥 streaks, 👑 Boss Battles, 📕 Mistake Vault, 🎓 Certificates, XP levels |
| 4 | User-generated text (player name, search) par `escape()` use hota hai → **XSS-safe** |
| 5 | `localStorage` wrapper try/catch ke sath hai → private-mode browsers mein crash nahi karega |
| 6 | Audio unlock handling robust hai (multiple gesture listeners) |
| 7 | Koi external request nahi (fonts, favicon inline) → offline-friendly base |
| 8 | Keyboard shortcuts (1–4 for answers, Enter for next) — power-user touch |

---

## 🔴 Critical Mistakes (Functional Bugs)

### 1. `Enter` key double-fire bug — question skip ho jata hai ⚠️
Jab "Next ➜" button focused ho aur user Enter dabaye, `nextQuestion()` **do baar** call hota hai:
- ek baar global `keydown` listener se (line ~4270)
- ek baar button ke apne `onclick` se (keyboard activation)

**Result:** ek question skip ho jata hai. Yehi bug home screen par bhi hai: kisi bhi button (How to Play, Contact) par Enter dabao to `startJourney()` bhi chal jata hai.
**Fix:** keydown handler mein `if (e.target.tagName === "BUTTON") return;` ya `e.preventDefault()` + target check.

### 2. Timer drift + background-tab issue ⏱️
`setInterval` har 100ms mein `timeLeft -= 0.1` karta hai. Problems:
- Heavy load par interval slow ho jata hai → timer drift karta hai
- Background tab mein browser interval ko ~1s tak throttle kar deta hai → **timer wahan effectively pause** ho jata hai (inconsistent)
- Koi "pause on tab hide" feature nahi

**Fix:** wall-clock based timer: `endTime = Date.now() + 60000`, phir `timeLeft = (endTime - Date.now())/1000`. Saath hi `visibilitychange` par auto-pause ka option.

### 3. Modals trap karte hain — close karne ke limited tareeqay
- Background par click se modal close **nahi** hota
- `Escape` key se close **nahi** hota
- Koi focus-trap nahi, `role="dialog"` / `aria-modal` nahi

### 4. Dead code
- `testSound()` function defined hai (line ~3587) magar **kisi button se call nahi hota**
- `clearVault()` mein `document.getElementById("goQuote");` — ek useless statement
- `showGameOver()` path par stray references

### 5. `resetProgress()` inconsistent hai
"Reset ALL progress" likha hai magar `totalScore` 💰 aur Mistake Vault (`profile.mistakes`) reset **nahi** hote. User confuse hoga.

### 6. Fragile boss-level logic (leaderboard tags)
Leaderboard mein boss detection hardcoded hai: `e.level>=4 && e.sub!=="cs601"` aur `e.level===7 && e.sub==="cs601"`. Aaj kaam karta hai, magar jaise hi kisi subject mein levels barhaye jaayenge, tags toot jayenge. Har subject apna boss-id khud janta hai — wahan se lookup karo.

### 7. Empty-question-bank edge case (defensive)
Agar kabhi koi unlocked level 0 questions ke sath ban gaya to `finishLevel()` mein `0/0 = NaN` accuracy aa jayegi. Placeholder subjects locked hain is liye abhi safe, magar guard lagana chahiye (`if(!G.qs.length) return;`).

---

## 🟠 Content Mistakes

### 8. Homepage jhoot bolti hai: "39 Subjects" — asal mein sirf 30 complete hain
**9 subjects ke dono banks (Mid + Final) bilkul khali hain** aur "Loading Soon 🚧" placeholder dikhate hain:

| Missing Banks | Subjects |
|---|---|
| 18 exam banks missing | **CS402** (Automata), **MCM101, MCM301, MCM304, MCM310** (Mass Comm), **PSY101, PSY502** (Psychology), **STA301, STA630** (Statistics) |

User subject kholta hai, exam select karta hai, phir locked "Loading Soon" card dekhta hai — bura experience.
**Fix:** (a) banks fill karo, ya (b) subject card par "Coming Soon 🚧" ribbon lagao aur homepage par likho "30 Subjects Live · 9 Coming Soon".

### 9. Content depth kam hai
Har exam bank mein sirf ~33–36 MCQs hain (3 levels × ~11 + boss). VU past papers ke hisab se ye kam hai — students 2-3 din mein khatam kar lenge. "2000+ MCQs" ka claim technically sahi hai magar subject-wise depth barhani chahiye.

---

## 🟡 Architecture / Code Quality

### 10. Ek hi 492 KB file — sab kuch ek jagah
HTML + CSS (296 lines) + JS engine (~800 lines) + **2,100 questions** sab `index.html` mein. Ye sab se bara structural masla hai:
- Koi bhi edit karna risky hai (2100 questions ke beech)
- Poora 492 KB har visit par download + parse hota hai — slow mobile networks par first paint late
- Koi caching nahi kyunki sab kuch HTML ke andar hai

**Fix:**
```
/css/style.css
/js/app.js
/data/cs601-mid.json, cs601-final.json ... (per-subject)
```
Questions ko JSON files mein rakho aur subject kholne par `fetch()` karo → initial load ~80% kam.

### 11. Repo hygiene kharab
- Sirf ek commit: "Add files via upload" — koi history nahi
- Koi `README.md`, `LICENSE`, `.gitignore` nahi
- Deployment instructions nahi

### 12. Koi build/test tooling nahi
Data validation (jo main ne manually ki — answer index, duplicates) ek chhota sa script ban jaye jo har commit par chale (GitHub Actions), taake future mein ghalat MCQ na jaaye.

---

## 🔵 UX / Accessibility Mistakes

| # | Masla | Fix |
|---|-------|-----|
| 13 | Page par koi `<h1>` nahi (SEO + screen reader dono ke liye bura) | Logo/title ko `<h1>` banao |
| 14 | Emoji-only buttons (🔊 🗑️ ❓ 📕) bina `aria-label` | `aria-label="Sound on/off"` waghera |
| 15 | `prefers-reduced-motion` support nahi — animations/confetti hamesha on | Media query add karo |
| 16 | Kuch jagah 10–11px text — mobile par unreadable | Minimum 12px |
| 17 | Native `alert()` / `confirm()` dialogs — app ka polish break karta hai | In-page modals use karo (revive modal jaisa) |
| 18 | `background-attachment: fixed` — iOS Safari par scroll janky hota hai | Hatao, ya normal gradient rakho |
| 19 | `<noscript>` fallback nahi | Ek simple message add karo |
| 20 | Contact form "Send" par WhatsApp auto-open + clipboard write — kuch browsers mein confusing | Pehle sirf confirmation dikhao, user button click kare |

---

## 🟣 SEO / Social Sharing

### 21. ~~Meta tags missing~~ ✅ FIXED (2026-08-24) — description, theme-color, og:*, twitter:* + `og-banner.png` add ho gaye
Sirf `charset` aur `viewport` hain. Add karo:
```html
<meta name="description" content="AHW Quizverse — VU exam MCQ practice...">
<meta name="theme-color" content="#7c3aed">
<meta property="og:title" content="AHW Quizverse — VU Exam Arena">
<meta property="og:description" content="...">
<meta property="og:image" content="banner.png">
<link rel="canonical" href="https://yourdomain/">
```
VU students WhatsApp groups mein links share karte hain — og:image wala preview free marketing hai.

---

## ⚫ Security / Privacy

### 22. Personal phone number hardcoded & public
`0347-0675100` page mein **kai jagah** hardcoded hai (footer, contact modal, JS strings). Public website par number dalne se spam/SMS harassment ka risk hai.
**Fix:** email address ya Google Form use karo, ya number ko JS mein obfuscate karo (phir bhi scrape ho sakta hai — best: form).

### 23. `globalThis.AHW` poora profile console par expose karta hai
Abhi harmless hai, magar kabhi bhi sensitive cheez is object mein mat daalo.

### 24. Data sirf localStorage mein — device change = sab progress gone
Students aksar phone/laptop switch karte hain.
**Fix:** kam az kam **Export/Import progress (JSON file)** button do. Future mein optional cloud sync (Firebase free tier).

---

## 📱 Performance / PWA Opportunities

### 25. PWA nahi hai — sab se bara missed opportunity
Target audience = students jo mobile par repeat visit karenge. Add karo:
- `manifest.webmanifest` (installable home-screen app)
- Service worker → **full offline support** (exam season mein internet chala jaye to bhi practice chale)
- Ye app 90% offline-friendly already hai (koi external dependency nahi) — sirf manifest + SW chahiye

### 26. Confetti canvas har resize par recreate hota hai — minor; ok hai
### 27. `background-attachment:fixed` repaint cost (upar #18)

---

## 🗺️ Priority Action Plan (Order mein karo)

| Priority | Kaam | Impact | Effort |
|---|---|---|---|
| **P0** ✅ DONE | Enter double-fire bug fix (#1) | 🔥 High (gameplay break) | 15 min |
| **P0** ✅ DONE | 9 missing subjects ko card par "Coming Soon" mark karo + homepage text theek karo (#8) + meta/og tags | 🔥 High (trust) | 30 min |
| **P1** | Wall-clock timer + tab-hide pause (#2) | High | 45 min |
| **P1** | Modal: backdrop-click + Esc close, aria roles (#3) | High | 1 hr |
| **P1** | Meta tags + og:image (#21) | High (free marketing) | 30 min |
| **P2** ✅ DONE | Questions ko alag JSON files mein split + fetch (#10) → ab `data/mcqs.json` + `css/style.css` + `js/app.js`; index.html sirf 21 KB | High (maintainability + speed) | 3–4 hr |
| **P2** | PWA: manifest + service worker (#25) | High (offline install) | 2 hr |
| **P2** | Progress Export/Import (#24) | Medium | 1 hr |
| **P3** | Accessibility sweep: h1, aria-labels, reduced-motion, min font 12px (#13–16) | Medium | 2 hr |
| **P3** | README + LICENSE + .gitignore + data-validation script (#11, #12) | Medium | 1 hr |
| **P3** | Phone number ko email/form se replace (#22) | Medium (privacy) | 30 min |
| **P4** | Missing 9 subjects ke banks fill karo (#9) | Long-term content | ongoing |

---

## 📊 Summary Score Card

| Area | Score | Notes |
|---|---|---|
| Game Design / Fun Factor | ⭐⭐⭐⭐⭐ | Hearts, boss, vault, certs — polished feel |
| MCQ Data Quality | ⭐⭐⭐⭐⭐ | 0 structural errors in 2,117 questions |
| Functional Correctness | ⭐⭐⭐ | Enter bug, timer drift, modal gaps |
| Content Completeness | ⭐⭐⭐ | 9/39 subjects empty shells |
| Architecture | ⭐⭐ | Single 492 KB file, no splitting |
| Accessibility | ⭐⭐ | No h1, no aria, no reduced-motion |
| SEO / Sharing | ⭐⭐ | Meta tags missing |
| Performance | ⭐⭐⭐ | No external requests (good), but monolith HTML |
| Mobile UX | ⭐⭐⭐⭐ | Responsive; fixed-bg jank minor |
| Repo Practices | ⭐⭐ | No README/LICENSE/history |

**Bottom line:** Ye ek *passionate, well-designed learning game* hai jis ki foundation solid hai. Sab se pehle 2 chhote bugs (Enter + placeholder subjects) theek karo, phir data ko files mein split kar ke PWA banao — ye site VU students mein genuinely popular ho sakti hai. 🚀
