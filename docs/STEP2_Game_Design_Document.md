# STEP 2: GAME DESIGN DOCUMENT (GDD) — BOLTY'S PUZZLE PARK : 3-in-1
> Option B — Day-1 Mega Launch | Version 1.0 | 18 Oct 2026 | Roman Urdu
> Target: Android 7.0+ | Orientation: Portrait | Engine: Unity (C#) — Web Preview ke liye HTML5/Canvas | Size: <60MB AAB

---

## 1. GAME IDENTITY

**Final Name (Play Store Title — 48 chars):**
**Bolty's Puzzle Park: Screw, Sort & Arrow 3 in 1**

**Short Title (Icon ke neeche):** `Bolty Park`

**Tagline:**
> "Twist, Sort, Rescue! — 1 App, 3 Puzzles, 1000 Challenges!"

**App Icon Concept:**
Cute robot "Bolty" (peela head, neela body, screw haath mein) — 3 mini badges neeche: 🔩 🍕 ➡️ — Background gradient purple → orange

**Elevator Pitch (30 sec mein samjhao):**
Bolty ek cute robot hai jo Puzzle Park mein phas gaya hai. Player ko 3 alag worlds mein puzzles solve karke usko rescue karna hai — Screws kholo, Pizza orders sort karo, aur Arrow maze se King ko nikalo. Har 10 levels ke baad Boss, daily spin, coins, skins — sab ek hi Park mein!

**Target Audience:**
- Primary: 13-35 saal, Pakistan + India + Indonesia + Brazil (Tier 2/3) — offline khelne wale, 5-20 min break wale
- Secondary: Kids 10-13 (parents allow karte hain kyunki no violence, brain game)
- 60% Male, 40% Female (Puzzle universal hai)

---

## 2. CORE GAMEPLAY LOOP — Har World ka 30-Second Loop

### Hub Loop (Meta - 10 sec)
```
Home (Park Map) → Daily Reward Claim → World Choose → Level Play → Win/Lose → Coins + XP → Shop/Next Level → Repeat
```

### WORLD 1: 🔩 Screw Rescue — "Twist & Rescue"
**Core Loop (30 sec):**
```
1. Puzzle Start: 1 locked box, 4-6 color screws (Red, Blue, Green, Yellow) + 2-3 empty boxes [0-3 sec]
2. Player screws par TAP karta hai → screw nikal ke correct color ke box mein jata hai (screw animation + "click" sound) [3-20 sec]
3. Box khulta hai → usme Bolty ka part milta hai (coin burst + confetti) [20-25 sec]
4. All boxes khule → WIN → 20 coins + 10 XP + star (1-3) → Next Level button + "Try Pizza World?" cross-promo [25-30 sec]
```
**Lose Condition:** Agar galat box mein screw dala → 5 sec time penalty + 1 hint slot waste, ya 60 sec timer khatam. 3 hearts per session.

**Satisfying Hook (TikTok viral):** Screw ka "unscrew" ASMR sound + color burst.

### WORLD 2: 🍕 Sort & Serve — "Color Plate Sort"
**Core Loop (30 sec):**
```
1. Conveyor par 3-5 color plates aa rahe hain (customers ke order colors) [0-3 sec]
2. Player plates ko drag karke same color ke table par sort karta hai [3-20 sec]
3. 3 same color plates ek table par → AUTO SERVE → customer khush + coin pop [20-25 sec]
4. 5 customers serve → WIN → 15 coins + combo bonus [25-30 sec]
```
**Lose:** Galat table par galat color → customer angry, 1 heart lost. Timer 60 sec.

### WORLD 3: ➡️ Arrow Escape — "Guide The King"
**Core Loop (30 sec):**
```
1. Maze dikhta hai, King ek kone mein, Exit dusre kone mein, beech mein 6-10 rotating arrows [0-3 sec]
2. Player arrows par TAP → arrow 90° rotate (↑ → → → ↓ → ←) [3-18 sec]
3. "GO" button press → King arrow path par chalta hai [18-25 sec]
4. Exit tak pahuncha → WIN → 25 coins (sabse zyada kyunki hardest) [25-30 sec]
```
**Lose:** King laser / wall se takraya → Level fail, 1 heart lost.

---

## 3. LEVEL DESIGN — 110 Hand-Crafted Levels (Day-1)

### Overall Progression

| World | Levels | Difficulty Curve | New Mechanic Every | Boss |
|-------|--------|-----------------|-------------------|------|
| 🔩 Screw | 1-50 | Easy → Hard (S-curve) | 5 levels | Every 10 levels (5 bosses) |
| 🍕 Sort & Serve | 1-30 | Easy → Medium | 5 levels | Every 10 levels (3 bosses) |
| ➡️ Arrow | 1-30 | Medium → Hard | 5 levels | Every 10 levels (3 bosses) |
| **TOTAL** | **110** | **S-curve overall** | - | **11 Boss Levels** |

### Difficulty Curve Graph (Text)
```
Difficulty
100% |                                      ●●● Arrow 25-30 (Hard + Portals)
80%  |                        ●●● Screw 40-50 (6 colors + 5 boxes)
60%  |            ●●● Sort 20-30 (Fast conveyor)
40%  |      ●●● Screw 20-30 (4 colors + locks)
20%  | ●●● Screw 1-10 (Tutorial, 2 colors, 2 boxes)
0%   +-------------------------------------------------> Levels 1-110
```

### 🔩 Screw World — 50 Levels Detail

| Level Range | Colors | Boxes | Obstacles | Time Limit | Coins Reward |
|-------------|--------|-------|-----------|------------|--------------|
| 1-5 (Tutorial) | 2 (Red, Blue) | 2 | None, hints show | 90 sec | 20 |
| 6-10 | 3 colors | 3 | Locked screws (need 2 taps) | 75 sec | 20 |
| 11-15 (Boss 1: Mini Vault) | 3 | 3 + 1 locked | Timer 60 sec | Boss reward 50 coins |
| 16-25 | 4 colors | 4 | Color-locked holes, extra empty slots | 60 sec | 25 |
| 26-35 | 4-5 colors | 4-5 | Bomb screw (tap wrong = -5 sec) | 60 sec | 30 |
| 36-50 | 5-6 colors | 5-6 | Double locks, limited empty slots (3 only) | 50 sec | 35 |

**Unlock:** Level 1 se open.

### 🍕 Sort & Serve — 30 Levels Detail

| Range | Plates | Tables | Speed | Special | Coins |
|-------|--------|--------|-------|---------|-------|
| 1-10 | 3 colors | 3 | Slow (5 sec per plate) | None | 15 |
| 11-20 | 4 colors | 4 | Medium (3 sec) | VIP customer (double coins) | 20 |
| 21-30 | 5 colors | 5 | Fast (2 sec) | Dirty plates (need wash tap) | 30 |

**Unlock:** Screw World Level 10 clear karo ya 200 coins se early unlock. (Monetization: impatience → rewarded ad to unlock)

### ➡️ Arrow World — 30 Levels Detail

| Range | Maze Size | Arrows | Obstacles | Coins |
|-------|-----------|--------|-----------|-------|
| 1-10 | 5x5 | 4-6 | Walls only | 25 |
| 11-20 | 7x7 | 8-10 | Lasers (red blocks), 1 portal | 30 |
| 21-30 | 9x9 | 12-15 | Moving walls, 2 portals, timer 45 sec | 35 |

**Unlock:** Screw Level 20 ya 400 coins se early unlock.

### Boss Levels (11 Total)
- Har 10 levels ke baad special design + 2x coins + confetti + "BOSS DEFEATED!" banner
- Example Boss — Screw Vault: Giant box, 8 screws, 4 boxes, only 3 empty slots → strategy must

### Star System (Har Level)
- ⭐ 1 star: Level complete (50%+)
- ⭐⭐ 2 stars: No hint used + under 70% time
- ⭐⭐⭐ 3 stars: Perfect + no wrong move + under 50% time
- 3 stars = extra 10 coins. Total stars se Park decorations unlock (retention hook)

---

## 4. ECONOMY & REWARDS

### Currency

| Currency | Kaise Milega | Kahan Kharch Hoga | Price |
|----------|--------------|-------------------|-------|
| **💰 Coins (Soft)** | Level win (15-35), Daily reward (50-500), Daily missions (100), Rewarded ad (50) | Hints (20 coins), Extra heart (100 coins), Skins (200-800), World early unlock | Free grind |
| **💎 Gems (Hard)** | Level 3-star (1 gem per 5 levels), Achievements, IAP | Premium skins, Remove Ads, Instant unlocks | IAP: 100 gems $0.99 → 2500 gems $19.99 |
| **❤️ Hearts (Lives)** | 3 free per world session, regenerate 1 per 10 min, max 5 | Level fail par 1 heart lost, 0 hearts = Wait or buy (100 coins / 10 gems) | - |

### Shop Items

| Item | Type | Cost | Hook |
|------|------|------|------|
| Bolty Skins (10) | Cosmetic | 200-800 coins / 20-100 gems | Pirate Bolty, Chef Bolty, King Bolty |
| Plate Themes (Sort world) | Cosmetic | 300 coins | Neon, Wood, Space |
| Arrow Trails | Cosmetic | 500 coins | Fire trail, Rainbow |
| Remove Ads | IAP | $2.99 / 299 PKR | Most popular IAP — 40% of IAP revenue |
| Coin Packs | IAP | $0.99 (500) to $9.99 (7000 + 1000 bonus) | - |
| Hint Pack (10 hints) | IAP/Rewarded | 200 coins or watch ad | - |

### Daily Missions (3 Rozana — Har World Cross)

| Mission | Reward | Purpose |
|---------|--------|---------|
| "Screw 5 levels clear karo" | 50 coins | Screw world retention |
| "Pizza 3 customers serve karo" | 50 coins | Sort world push |
| "Kisi bhi world mein 1 boss harayo" | 100 coins + 1 gem | Boss engagement |

**Weekly Mission (7 din):** 50 stars jama karo → 500 coins + rare skin.

### Daily Login Bonus (Streak)

| Day | Reward | Streak Bonus |
|-----|--------|--------------|
| 1 | 50 coins | - |
| 2 | 75 coins | - |
| 3 | 100 coins + 1 hint | - |
| 4 | 150 coins | - |
| 5 | 200 coins + 1 gem | - |
| 6 | 300 coins | - |
| 7 | 500 coins + Premium skin (Chef Hat) | 7-day streak → 2x coins next week |

**Streak lost?** Rewarded ad dekh ke streak bachao! (Monetization + retention combo)

### Daily Spin Wheel (Hub)
- Har din 1 free spin: 20-500 coins, 1-5 gems, hint, ya "Jackpot 1000 coins"
- Extra spin: Rewarded ad dekh ke

---

## 5. RETENTION FEATURES

| Feature | Kaise Kaam Karega | Retention Impact |
|---------|------------------|------------------|
| **Daily Login + Streak** | 7-day calendar, streak freeze via ad | Day 1→Day 7 retention +35% |
| **Daily Missions** | 3 cross-world missions rozana reset | Daily return reason |
| **Level Map + Stars** | Park map par 110 levels, 3-star chase, total stars se new park area unlock (Garden, Space Station) | Completionist loop |
| **Leaderboard (Weekly)** | Har world ka alag weekly coins leaderboard (local + global via Firebase) | Competition, 15% DAU boost |
| **Achievements (20)** | "First Win", "50 Screws", "No Hint 10 levels", "7-day streak" → Gem rewards | Long-term goals |
| **Push Notifications** | "🔩 Bolty intezar kar raha hai! Daily reward ready hai!" (1 per day, opt-in) | Churn recovery 10% |
| **Boss Every 10 Levels** | Special reward + celebration | Milestone dopamine |
| **Shop + Skins** | Coins se cosmetic — player apna Bolty customize kare | Personalization, IAP desire |

### Difficulty Curve Rules (Important)
- **No Pay-to-Win:** Har level free hints (via coins/ad) se solvable. Levels test karke 70% win rate target (easy), 40% (hard).
- **Fail = Encourage, Not Punish:** Fail par "Watch ad for +1 heart?" (optional), nahi to 10 min wait ya coins se buy — irritate nahi.
- **Dynamic Help:** 3 fail streak par auto hint glow: "Try this screw!" → frustration kam.

---

## 6. MONETIZATION PLACEMENTS (Irritate Nahi Karenge)

| Ad Type | Kahan | Frequency | eCPM | Why Not Irritating? |
|---------|-------|-----------|------|---------------------|
| **Rewarded Ad** | Hint, Extra Heart, Daily Spin, Streak Save, World Early Unlock | Always optional, user clicks | $5-$10 | Player khud choose karta hai |
| **Interstitial** | Level FAIL par (not win) | Max 1 per 3 min, har 3rd fail | $2-$4 | Win par kabhi nahi — celebration kharab nahi |
| **Banner** | Hub / Shop screen bottom only | Always visible but small | $0.5-$1 | Gameplay par kabhi nahi |

**AdMob Unit IDs (Placeholder → Play Console mein real IDs):**
- App ID: `ca-app-pub-3940256099942544~3347511713` (Google test ID)
- Rewarded: `ca-app-pub-3940256099942544/5224354917`
- Interstitial: `ca-app-pub-3940256099942544/1033173712`
- Banner: `ca-app-pub-3940256099942544/6300978111`

**IAP Products (Google Play Billing):**
- `remove_ads` ($2.99) — No interstitial/banner, rewarded still available
- `gems_100` ($0.99), `gems_550` ($4.99), `gems_1200` ($9.99), `gems_2500` ($19.99)
- `coins_500`, `coins_2500` etc.

---

## 7. USER FLOW & SCREENS

### App Flow Map
```
Splash (2 sec, Bolty logo + loading) → Hub (Park Map)
Hub → [Tap World Gate] → Level Map (1-50 / 1-30 grid) → Gameplay → Result (Win/Lose) → Hub
Hub → Shop → Skins/Coin Packs
Hub → Daily Rewards Popup (on app open)
Hub → Settings (Sound, Vibrate, Privacy, Restore Purchases)
Hub → Leaderboard
```

### 8 Screens List (UI)
1. **Splash / Loading** — Bolty sleeping, "Loading Park..." bar
2. **Hub — Park Map** — Top: Coins/Gems/Hearts, Center: 3 World Gates with progress (e.g., Screw 12/50), Bottom: Shop, Daily Wheel, Settings
3. **Level Map** — Grid 5x10, locked/unlocked/star status, Boss crown icons
4. **Gameplay — Screw** — Top: Timer + Hearts, Center: Puzzle board, Bottom: Empty slots / Hint button
5. **Gameplay — Sort** — Top: Timer, Center: Conveyor + Tables, Bottom: Score
6. **Gameplay — Arrow** — Top: Timer, Center: Maze, Bottom: GO / Rotate hint
7. **Result — Win** — Stars, Coins + XP burst, Next Level / Hub buttons, "Try other world" teaser
8. **Result — Lose / Out of Hearts** — "Watch Ad for +1 Heart?" (2 options: Watch Ad / Use 100 coins / Go Hub)
9. **Shop** — Tabs: Skins, Currencies, Remove Ads
10. **Settings** — Music/SFX toggle, Vibrate, Privacy Policy link, Rate Us, Version

> Note: Pause screen har gameplay mein (top-right pause button) → Resume / Restart / Hub

---

## 8. TECH SPECS

| Item | Detail |
|------|--------|
| Engine | Unity 2022.3 LTS (C#) — Preview ke liye HTML5 build bhi |
| Orientation | Portrait (1080x1920) |
| Min Android | 7.0 (API 24), Target 14 (API 34) |
| AAB Size Target | <60MB (textures compressed ASTC/ETC2, audio OGG) |
| Backend | Firebase: Analytics, Crashlytics, Remote Config (level difficulty tuning), Firestore Leaderboard |
| Ads | Google Mobile Ads SDK 11.x |
| IAP | Google Play Billing Library 7.x |
| Offline | Full offline play, leaderboard sync when online |
| Save | PlayerPrefs + JSON (coins, stars, levels, skins) — cloud save via Firebase Auth (optional Google login) |

---

## 9. ART STYLE (Next Step ke liye Brief)

**Style Name:** "Cozy Toy Park" — Soft rounded shapes, thick outlines, pastel + vibrant mix
- **Colors:** Purple (#7c3aed) primary, Orange (#f97316) accent, Mint (#10b981) success, Pink (#ec4899) hearts
- **Characters:** Bolty robot — chubby, big eyes, screwdriver hands, 6 emotions (happy, sad, excited, dizzy, sleepy, victory)
- **Environments:** Park theme — Screw World = Workshop (wood + metal), Sort World = Kitchen (tiles + conveyor), Arrow World = Castle (stone + flags)
- **UI:** Chunky buttons with shadow, rounded 16px, icon + text, kid-friendly but not childish

---

## 10. WHAT'S NEXT

STEP 3: Art & Assets — Characters, backgrounds, icons, 8 screenshots, app icon, feature graphic, sounds — sab ke prompts/files
STEP 4: Development — Unity C# code + HTML5 playable preview
STEP 5-8: Monetization, Play Store Launch, Marketing, Earning Plan

---

> ✅ GDD Approved? Agla Step ART hai — kya mein ab assets banana start karun?
