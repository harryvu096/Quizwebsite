# STEP 3: ART & ASSETS — Bolty's Puzzle Park
> Version 1.0 | 18 Oct 2026 | Art Style: Cozy Toy Park (Rounded, Thick Outline, Pastel+Vibrant)

## Art Style Guide (Consistent for All Assets)

**Palette:**
- Primary Purple #7c3aed, Accent Orange #f97316, Success Mint #10b981, Heart Pink #ec4899, Screw Metal #64748b
- Background: #fdf6ff (warm white), Workshop wood #a16207, Kitchen tile #e0f2fe, Castle stone #e2e8f0

**Rules:** Rounded shapes (16px radius), 4px thick outline (#2b2140), soft shadow, chubby cute characters, big eyes (2:1 head:body), no realistic textures — toy-like.

**Fonts:** Fredoka One (Headings), Nunito Black (UI numbers), Poppins (body)

---

## 1. CHARACTERS

### Bolty — Main Hero Robot
- **Base:** Peela dome head (screw on top), neela chubby body, screwdriver hands, orange boots, big cyan eyes
- **6 Emotions:** Happy (win), Sad (lose), Excited (boss), Dizzy (fail), Sleepy (splash), Victory (3-star)
- **Skins (10):** Default, Pirate (hat+eyepatch), Chef (hat+spoon), King (crown), Space (helmet), Ninja (headband), Super (cape), Farmer (straw hat), DJ (headphones), Golden (premium)

### Customers (Sort World)
- 5 types: Kid, Lady, Man, Grandma, Chef — chubby, waiting with color plate icon above head (red/blue/green/yellow/purple)

### King (Arrow World)
- Mini king with crown, red cape, mustache, cheering animation

---

## 2. UI SCREENS (10 Screens)

All screens 1080x1920 portrait, 16px rounded cards, chunky buttons with 4px shadow.

1. **Splash (1080x1920):** Purple gradient, Bolty sleeping on toolbox, "Bolty's Puzzle Park" logo (Fredoka), loading bar with screw moving, "Learn. Play. Conquer." tagline
2. **Hub — Park Map:** Top bar: Coin 💰/Gem 💎/Heart ❤️ counters, Center: 3 World Gates (Workshop gate with screws, Kitchen gate with pizza, Castle gate with arrows) + progress e.g., "12/50", Bottom: Shop, Daily Wheel, Settings, Leaderboard icons
3. **Level Map (per world):** Grid, locked (grey lock), unlocked (color), stars below each level, Boss levels have crown, path line connecting levels
4. **Gameplay Screw:** Top: Timer ring (60) + Hearts, Center: Puzzle board (wood workshop), Screws (color caps), Boxes (color outlines), Bottom: Empty slots (3) + Hint (20💰) button
5. **Gameplay Sort:** Top: Timer + Score, Center: Conveyor belt + plates + Tables (color zones), Customer queue
6. **Gameplay Arrow:** Top: Timer, Center: Maze grid (stone tiles), Arrows (wooden), King at start, Exit flag, Bottom: GO button + Hint
7. **Result Win:** Big "LEVEL COMPLETE!" + Stars animation (pop), Coins burst, XP bar, Next Level / Hub / "Try Pizza World!" cross-promo
8. **Result Lose / Out of Hearts:** "OUT OF HEARTS! 💔" + 2 options: "Watch Ad for +1 Heart (Rewarded)" vs "100 Coins" vs "Go Home"
9. **Shop:** Tabs: Skins (grid with Bolty previews), Currencies (coin/gem packs), Remove Ads ($2.99 banner)
10. **Settings:** Toggles: Music, SFX, Vibrate, Notifications, Privacy Policy link, Rate Us, Version 1.0

**Buttons:** Green (#10b981) primary, Orange (#f97316) secondary, Grey (#94a3b8) cancel — all with white text + shadow

---

## 3. ASSETS LIST WITH GENERATION PROMPTS

### App Icon (512x512) — Play Store Required
**File:** `assets/app_icon_512.png`
**Prompt:** "Cute chubby yellow robot head with big cyan eyes, holding colorful screw, thick toy outline, purple to orange gradient background, 3 small badges bottom: screw, pizza, arrow, playful kids game icon, flat vector, centered, no text"

### Feature Graphic (1024x500) — Play Store Required
**File:** `assets/feature_graphic_1024x500.png`
**Prompt:** "Wide banner, left: cute yellow robot Bolty waving with screwdriver, center: 3 worlds — workshop with screws, kitchen with conveyor pizza plates, castle maze with arrows, right: title 'Bolty's Puzzle Park: 3 in 1' in bold rounded font, purple orange gradient, confetti, toy style, vibrant"

### Screenshots (8 Required — 1080x1920)

| # | File | Screen | Prompt |
|---|------|--------|--------|
| 1 | `screenshots/01_hub.png` | Hub Park Map | "Mobile game hub, theme park map with 3 gates, coin gem counters top, cute robot mascot, purple cozy style" |
| 2 | `screenshots/02_screw.png` | Screw Gameplay | "Puzzle gameplay, colorful screws in locked boxes, empty slots, timer 45, wood workshop background, clean UI" |
| 3 | `screenshots/03_sort.png` | Sort Gameplay | "Color sorting conveyor, plates on tables, customers queue, kitchen tiles, score 1200" |
| 4 | `screenshots/04_arrow.png` | Arrow Gameplay | "Maze puzzle, wooden arrows on stone tiles, king character, exit flag, laser obstacles" |
| 5 | `screenshots/05_win.png` | Win Result | "Level complete celebration, 3 stars confetti, coins +50, next level button, toy style" |
| 6 | `screenshots/06_boss.png` | Boss Level | "Giant locked vault boss, 8 screws, crown icon, intense but cute, 'BOSS DEFEATED!'" |
| 7 | `screenshots/07_shop.png` | Shop | "Shop grid, robot skins pirate chef king, gem packs, remove ads banner, vibrant" |
| 8 | `screenshots/08_daily.png` | Daily Rewards | "7-day calendar, daily spin wheel, streak flame, rewards coins gems" |

### Backgrounds (1080x1920)

| File | World | Prompt |
|------|-------|--------|
| `assets/bg_workshop.png` | Screw | "Cozy toy workshop, wood planks, toolbox, soft light, pastel, no characters, vertical, game background, subtle pattern" |
| `assets/bg_kitchen.png` | Sort | "Cute kitchen tiles, conveyor belt top, pastel blue white, toy style, clean" |
| `assets/bg_castle.png` | Arrow | "Castle stone walls, flags, maze floor texture, soft shadows, toy style" |
| `assets/bg_hub.png` | Hub | "Theme park with 3 themed zones, purple sky, confetti, cheerful" |

### Icons & UI Elements (Vector, 256x256)

- `assets/icon_coin.png` — Gold coin with star, thick outline
- `assets/icon_gem.png` — Pink diamond gem, sparkle
- `assets/icon_heart.png` — Red heart with shine
- `assets/icon_hint.png` — Lightbulb yellow, glow
- `assets/icon_star.png` — Gold star, 3D
- `assets/screw_red.png`, `screw_blue.png`, `screw_green.png`, `screw_yellow.png`, `screw_purple.png` — Screw with color cap, metal body
- `assets/box_red.png` etc. — Box with color outline, open/closed states
- `assets/plate_red.png` etc. — Plate with color food
- `assets/arrow_up.png`, `arrow_right.png` etc. — Wooden arrow, thick outline

---

## 4. SOUND EFFECTS & MUSIC (Royalty-Free)

**Source:** Pixabay Music / OpenGameArt / Freesound (CC0) — No copyright

| File | Type | Usage | Source Example |
|------|------|-------|----------------|
| `audio/bgm_hub.mp3` | Music | Hub, cheerful lo-fi 100 BPM, loop | "Happy Kids Park" - Pixabay |
| `audio/bgm_game.mp3` | Music | Gameplay, upbeat puzzle 110 BPM | "Puzzle Fun" - Pixabay |
| `audio/bgm_boss.mp3` | Music | Boss, intense but cute 120 BPM | "Boss Toy" - Pixabay |
| `audio/sfx_tap.mp3` | SFX | Screw tap / Arrow tap | Click pop |
| `audio/sfx_screw.mp3` | SFX | Screw unscrew ASMR | Metal unscrew |
| `audio/sfx_sort.mp3` | SFX | Plate serve, ding | Ding pop |
| `audio/sfx_move.mp3` | SFX | King move | Footstep |
| `audio/sfx_win.mp3` | SFX | Level win fanfare | Cheer + confetti pop |
| `audio/sfx_lose.mp3` | SFX | Level fail | Sad trombone cute |
| `audio/sfx_star.mp3` | SFX | Star earned | Sparkle chime |
| `audio/sfx_coin.mp3` | SFX | Coin collect | Coin ding |
| `audio/sfx_heart.mp3` | SFX | Heart lost | Heartbeat break |

**Implementation:** All audio OGG + MP3, <300KB each, pooled, mute toggle in settings.

---

## 5. FOLDER STRUCTURE (Assets)

```
/assets
  app_icon_512.png
  app_icon_1024.png (hi-res)
  feature_graphic_1024x500.png
  bg_workshop.png
  bg_kitchen.png
  bg_castle.png
  bg_hub.png
  icon_coin.png … (12 icons)
  screw_*.png (5 colors)
  box_*.png (5 colors + open/closed)
  plate_*.png (5 colors)
  arrow_*.png (4 directions)
  bolty_happy.png … (6 emotions + 10 skins = 16 files)
  /screenshots
    01_hub.png … 08_daily.png
  /audio
    bgm_*.mp3 (3)
    sfx_*.mp3 (9)
/docs
  STEP3_Art_Assets.md (this file)
```

---

## 6. GENERATION STATUS

> All asset prompts ready. Actual PNG generation via AI (DALL-E / Stable Diffusion) or Figma manual draw.
> For playable preview, we use CSS/Canvas placeholders with same colors/shapes — 100% original, no copyright risk.
> Next Step builds these assets into Unity + HTML5 preview.

