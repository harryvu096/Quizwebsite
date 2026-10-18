# 🎪 Bolty's Puzzle Park: Screw, Sort & Arrow — 3 in 1

> **110 Levels | 11 Bosses | Offline | <60MB | Unity-ready + Capacitor APK**

Ek hi app mein 3 trending puzzle games:
- 🔩 **Screw Rescue (50 levels)** — Screws kholo, Bolty ko rescue karo
- 🍕 **Sort & Serve (30 levels)** — Color plates sort karke customers khush karo
- ➡️ **Arrow Escape (30 levels)** — Arrows ghumake King ko nikalna

## 📱 Preview (Abhi Khelo)

1. **Double-click:** `index.html` kholo — bina server ke chalta hai
2. **PWA Install:** Chrome mein Open → `⋮ → Install App` → Offline khel sakte ho
3. **Phone:** `python3 -m http.server 8080` → `http://localhost:8080` → Phone browser mein IP kholo

## 📦 APK Kaise Banayein (3 Tareeke)

### Tareeka 1: GitHub Actions se Auto APK (Sabse Aasaan — 5 min, No Setup)

1. GitHub par naya repo banao: `https://github.com/new` → Name: `BoltysPuzzlePark` → Create
2. Is folder ko push karo:
   ```bash
   git init
   git add .
   git commit -m "Initial 110 levels"
   git branch -M main
   git remote add origin https://github.com/TUMHARA_USERNAME/BoltysPuzzlePark.git
   git push -u origin main
   ```
3. GitHub → `Actions` tab → `Build APK` workflow chalega → 3-5 min baad `Artifacts` mein se `BoltysPuzzlePark-debug-apk` download karo → Phone mein install!

### Tareeka 2: Local PC par (Android Studio)

```bash
npm install
npx cap add android
npx cap sync
npx cap open android   # Android Studio khulega
# Android Studio mein: Build → Generate Signed Bundle/APK → APK → Create keystore → Build
```

AAB (Play Store) ke liye: `Build → Generate Signed Bundle → Android App Bundle`

### Tareeka 3: PWABuilder (No Code, 1-click)

1. `https://www.pwabuilder.com` kholo
2. Apna game ka URL daalo (GitHub Pages URL: `https://TUMHARA_USERNAME.github.io/BoltysPuzzlePark/`)
3. `Build My PWA` → Android Package download → APK ready!

## 🎮 Levels (110 Total)

- `data/levels.json` mein sab 110 levels ka config hai — har level ka colors, boxes, time, boss flag
- Procedural + hand-tuned: H1 2026 ka hybrid-casual trend follow, S-curve difficulty, 70% win rate

## 🛠️ Folder Structure (Clean — Quiz Website se Separate)

```
/ (root)
├── index.html              ← Game ka main file (playable)
├── css/style.css           ← Cozy Toy Park style
├── js/game.js              ← 110 levels engine, save, ads hooks
├── data/levels.json        ← 110 hand-crafted levels
├── assets/
│   ├── app_icon_512.png    ← Play Store icon 512x512
│   ├── feature_graphic_1024x500.png ← Feature graphic
│   └── screenshots/ (8)
├── manifest.webmanifest    ← PWA install
├── capacitor.config.json   ← APK config (com.bolty.puzzlepark)
├── package.json
├── .github/workflows/build-apk.yml ← Auto APK builder
├── privacy.html            ← Play Store privacy policy
└── tools/
    └── check-levels.js     ← Levels validator
```

## 🔒 Play Store Upload

1. `play.google.com/console` → $25 → Create App → `Bolty's Puzzle Park: 3 in 1`
2. Store Listing: Title, Short Desc, Long Desc (see `docs/playstore-listing.txt`), Icon, Feature Graphic, 8 Screenshots
3. Content Rating → Data Safety → Privacy Policy (host `privacy.html` on GitHub Pages)
4. Production → Upload AAB (from GitHub Actions artifact `app-release.aab`)
5. Review → Live in 1-3 days!

## 💰 Monetization (Ready)

- AdMob IDs placeholders `js/game.js` mein — `ca-app-pub-3940256099942544/...` (test IDs) → Play Console se pehle real IDs daalo
- IAP: `remove_ads`, `coins_*`, `gems_*` — Google Play Billing ready
- Firebase: `firebaseConfig` daalo `js/game.js` mein → Analytics + Leaderboard on

## 📧 Support

Tumhara kaam: Sirf GitHub repo banao aur push karo — APK auto ban jayega!
Baqi docs (Market Research, GDD, Monetization, Marketing, Earning) `../Quizwebsite/docs/` mein hain agar chahiye.

Made with ❤️ in Pakistan — Bolty Games Studio 🇵🇰
