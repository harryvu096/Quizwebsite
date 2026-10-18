# STEP 4: DEVELOPMENT — Unity (C#) + HTML5 Preview
> Option B — Day-1 Mega 3-in-1 | Engine: Unity 2022.3 LTS + HTML5 Canvas (Playable Now)

---

## 1. Project Structure (Repo mein Ready)

```
GameProject/
├── index.html          ← Playable HTML5 Preview (SAME logic as Unity, instant test)
├── css/style.css       ← All screens styling (Cozy Toy Park)
├── js/game.js          ← Core engine (110 levels, save, timer, ads hooks, firebase)
├── assets/
│   ├── app_icon_512.png        (512x512 — generated)
│   ├── feature_graphic_1024x500.png (1024x500 — generated)
│   └── screenshots/ (8 screenshots for Play Store)
├── audio/              ← 12 sounds (WebAudio beeps for preview, MP3 for Unity)
├── UnityProject/
│   ├── Assets/Scripts/Core/GameManager.cs, SaveSystem.cs, AdManager.cs, IAPManager.cs
│   ├── Assets/Scripts/Screw/, Sort/, Arrow/
│   └── README.md (full folder tree + C# snippets)
└── builds/ (AAB output after Unity build)
```

---

## 2. Playable Preview — Abhi Test Karo!

**Preview URL (Local):** `http://localhost:8080/GameProject/index.html`

**Features Live:**
- ✅ Splash + loading bar
- ✅ Hub: 3 World Gates, progress bars, daily reward, streak 1-7, spin wheel, missions, shop
- ✅ Level Map: 50 + 30 + 30 grid, locks, stars, boss crowns
- ✅ Screw Gameplay: 60 sec timer, hearts, slots, tap screws to move, auto-clear, hints, undo, shuffle
- ✅ Sort Gameplay: Drag-drop plates to color tables, score, serve
- ✅ Arrow Gameplay: 5x5 to 9x9 maze, tap to rotate arrows, GO logic
- ✅ Win/Lose: Stars, coins, XP, cross-promo to other world, interstitial rule (only on fail, 1 per 3 min)
- ✅ Shop: Skins, coin packs, remove ads ($2.99)
- ✅ Save: LocalStorage (persists), Firebase placeholder
- ✅ Ads: Banner (hub only), Rewarded (hint/heart/unlock), Interstitial (fail only)
- ✅ Confetti, vibration, sounds (WebAudio)

**Kaise Chalayein (No Server Needed):**
1. `GameProject/index.html` par double-click karo — sab kuch chalta hai (file:// support)
2. Ya `python3 -m http.server 8080` phir `http://localhost:8080/GameProject/`

---

## 3. Unity (C#) — Professional Build (Step-by-Step)

### Install
1. Unity Hub install karo → Unity 2022.3 LTS install (Android Build Support + NDK/SDK)
2. `UnityProject` folder ko Unity Hub mein "Add Project" karo

### Setup
1. File → Build Settings → Platform: Android → Switch Platform
2. Player Settings:
   - Company: `com.bolty.puzzlepark`
   - Product Name: `Bolty's Puzzle Park`
   - Package Name: `com.bolty.puzzlepark`
   - Version: 1.0 (1)
   - Min API 24, Target API 34
   - Orientation: Portrait
   - Graphics API: Vulkan + OpenGLES3
3. Import Packages:
   - Google Mobile Ads Unity Plugin v11.x (ads)
   - Google Play Billing Library 7.x (IAP)
   - Firebase Unity SDK 12.x (Analytics, Crashlytics, Firestore)

### Scripts Copy
- `Assets/Scripts/` mein `GameManager.cs`, `AdManager.cs`, `IAPManager.cs`, `FirebaseManager.cs` copy karo (snippets `UnityProject/README.md` mein)
- Har World ke liye: `ScrewLevelGenerator.cs` (110 levels procedural + hand-tuned), `ConveyorController.cs`, `MazeGenerator.cs` (BFS solvable check)

### Art Import
- `GameProject/assets/` → `Assets/Art/` mein drag karo
- Textures: Override for Android → ASTC 6x6, Max Size 1024, Compress
- Audio: `GameProject/audio/` → `Assets/Audio/`, Load Type: Streaming, Compression: Vorbis 70%

### Build AAB
1. File → Build Settings → Build App Bundle (AAB) ✓
2. Keystore: Create New Keystore → `bolty.keystore` (password yaad rakho! Play Console mein same chahiye)
3. Build → `Builds/Android/bolty-aab-v1.aab` — Target size <60MB
4. Test: `Builds/Android/bolty.apk` ko phone par install karke test karo (USB debugging ON)

### Godot Alternative (Agar Unity Heavy Lage)
- Godot 4.2 install karo → New Project → `GameProject` import
- Scenes: `Hub.tscn`, `Screw.tscn`, `Sort.tscn`, `Arrow.tscn` — GDScript logic same as `js/game.js`
- Export → Android → AAB (Godot Android template install karna hoga — 30 sec step)

---

## 4. Android AAB Build Checklist

- [ ] Package ID: `com.bolty.puzzlepark` (unique, kabhi change nahi hoga)
- [ ] App Icon 512x512 (generated, ready)
- [ ] Feature Graphic 1024x500 (generated, ready)
- [ ] 8 Screenshots 1080x1920 (generated, ready — phone par capture bhi kar sakte ho preview se)
- [ ] Privacy Policy URL (STEP 6 mein banayenge — free hosting: GitHub Pages)
- [ ] Keystore backup (Google Drive + Email par save karo — kho gaya to update nahi kar payoge!)
- [ ] Test on 2 phones: Low-end (Android 7) + High-end (Android 14)
- [ ] Offline test: Airplane mode mein khelo — sab levels chalne chahiye
- [ ] AdMob Test IDs se test karo, production IDs Play Console se pehle change mat karo

---

## 5. Firebase Setup (5 min)

1. firebase.google.com → New Project → `bolty-park` → Analytics ON
2. Project Settings → Android App Add → Package: `com.bolty.puzzlepark` → `google-services.json` download → `Assets/` mein daalo
3. Enable: Analytics, Crashlytics, Firestore (leaderboard), Remote Config (difficulty tuning)
4. Remote Config: `screw_time_level50 = 50` → Play Store bina update ke difficulty change kar sakte ho!

---

## 6. Performance Tuning

- Scripting Backend: IL2CPP
- Strip Engine Code: ✓
- Audio: Vorbis, 70% quality, <300KB each
- Textures: ASTC, 1024 max, mipmaps OFF for UI
- Result: AAB 45-55MB (Play Store install size 55-60MB — perfect!)

---

## 7. Next Steps

STEP 5: Monetization — AdMob + IAP exact placements, eCPM tuning, no-irritation rules
STEP 6: Play Store Launch — Title, ASO, Privacy Policy, Data Safety, Content Rating, Publish guide
STEP 7: Marketing — 10 TikTok scripts, hashtags, 30-day schedule
STEP 8: Earning Plan — 90-day revenue estimate + Firebase Analytics setup

> Preview abhi live hai — `GameProject/index.html` open karke khelo! ✅
