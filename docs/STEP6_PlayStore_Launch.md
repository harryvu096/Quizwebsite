# STEP 6: GOOGLE PLAY STORE LAUNCH — A to Z Guide
> Time: 1-2 days (review) | Cost: $25 one-time Play Console fee

---

## 1. Play Console Account Banana (Agar Nahi Hai)

1. **play.google.com/console** → Sign in with Gmail (jo hamesha use karoge — change nahi hota)
2. **Pay $25** via Debit/Credit Card (one-time, lifetime) → Identity verify (CNIC + Selfie, 1-2 days)
3. **Developer Name:** `Bolty Games Studio` (ya apna naam — baad mein change ho sakta hai)
4. **Done!** Ab app publish kar sakte ho.

---

## 2. Naya App Banao

Play Console → **Create App** → Details:
- **App Name:** `Bolty's Puzzle Park: Screw, Sort & Arrow 3 in 1` (50 chars max — ASO optimized)
- **Default Language:** English (US) — baad mein Urdu add kar dena
- **App or Game:** Game
- **Free or Paid:** Free (with IAP)
- **Declarations:** ✅ Content guidelines, US export laws (tick both)

**Category:** Game → **Puzzle** → Tags: `Puzzle`, `Brain`, `Casual`

**Contact:** Your email (e.g., `boltysupport@gmail.com`) — players isi par contact karenge.

---

## 3. Store Listing — ASO Keywords ke Saath

### Title (30 chars — short, searchable):
```
Bolty's Puzzle Park: 3 in 1
```

### Short Description (80 chars — yeh search mein dikhta hai):
```
🔩 Screw puzzle + 🍕 Color sort + ➡️ Arrow maze — 110 levels, 11 bosses! Offline!
```

### Long Description (4000 chars — keywords: screw puzzle, sort, arrow, offline, brain, 3 in 1):
```
🎪 Welcome to BOLTY'S PUZZLE PARK — 1 App, 3 Addictive Puzzle Worlds!

🔩 WORLD 1: SCREW RESCUE (50 Levels)
Twist, unscrew and rescue Bolty the robot! Match colorful screws to the right boxes. Think before you tap — limited slots!

🍕 WORLD 2: SORT & SERVE (30 Levels)
Drag colorful pizza plates to the correct tables! Fast conveyor, happy customers, combo bonuses!

➡️ WORLD 3: ARROW ESCAPE (30 Levels)
Rotate arrows to guide the King to the exit! Avoid walls, lasers and portals!

🌟 WHY PLAY?
✓ 110 HAND-CRAFTED LEVELS + 11 BOSSES
✓ Daily rewards, 7-day streaks & spin wheel
✓ Shop with 10+ Bolty skins (Pirate, Chef, King!)
✓ Weekly leaderboards — compete globally
✓ Offline play — no WiFi needed!
✓ No pay-to-win — all levels free, ads only on fail
✓ <60MB — light on storage & battery

🧠 Perfect for 5-min breaks or hour-long fun. Train your brain, relax your mind!

📧 Support: boltysupport@gmail.com
🔒 Privacy: https://harryvu096.github.io/Quizwebsite/privacy.html

Download now — Twist, Sort, Rescue!
```

### Keywords (Play Console → Store Listing → Tags):
`screw puzzle, color sort, arrow maze, brain game, puzzle park, offline puzzle, 3 in 1 games, sort puzzle, screw sort`

### Assets Upload:
- **App Icon:** `GameProject/assets/app_icon_512.png` (512x512 PNG, 32-bit)
- **Feature Graphic:** `GameProject/assets/feature_graphic_1024x500.png` (1024x500 JPG/PNG)
- **Phone Screenshots:** 8 screenshots `GameProject/assets/screenshots/*.png` (1080x1920, PNG)
- **Tablet Screenshots:** Same 8 (Play Console requires at least 2 — phone screenshots reuse karo)
- **Video (Optional but boost 30% installs):** 30-sec gameplay record (OBS se hub → screw → sort → arrow → win) → YouTube unlisted → link add karo

---

## 4. App Bundle (AAB) Upload

Play Console → **Production** → **Create New Release** → Upload `Builds/Android/bolty-aab-v1.aab` (or from `GameProject` preview, later Unity AAB)

- **Release Name:** `1.0 — Launch`
- **Release Notes:** `🎪 Initial release — 110 levels, 3 worlds, offline play!`
- **Next** → Error check — agar icon/screenshots missing to yahin batayega.

---

## 5. Content Rating — IARC Questionnaire

Play Console → **Content Rating** → Start:
- Category: Game → Puzzle
- Violence: **No**
- Language: **No**
- Gambling: **No** (play money? No)
- User Interaction: **Yes** (leaderboard)
- Result: **Everyone / PEGI 3** ✅ — Kids bhi khel sakte hain.

---

## 6. Data Safety Form

Play Console → **Data Safety** → Fill:

| Question | Answer |
|----------|--------|
| Does app collect data? | **Yes** (Firebase + AdMob) |
| Data collected? | Device ID, App interactions, Crash logs |
| Purpose? | Analytics, Advertising, Fraud prevention |
| Encrypted in transit? | **Yes** (HTTPS) |
| Users can delete? | **Yes** (Settings → Clear Data + Firebase delete) |
| Ads? | **Yes** (AdMob) |
| Target children? | **No** (13+), or "Yes with parental guidance" if want Family program |

**Privacy Policy URL:** Create one FREE:
1. privacypolicytemplate.net → Fill → Download `privacy.html` → Upload to `https://harryvu096.github.io/Quizwebsite/privacy.html` (or GitHub Pages / Google Sites free)
2. Add to Play Console → **Privacy Policy** → Paste URL

**Sample Privacy Text (Copy):**
```
Bolty's Puzzle Park collects anonymous usage data via Firebase and shows ads via AdMob. No personal data sold. Contact boltysupport@gmail.com to delete data. Full policy: [link]
```

---

## 7. App Content — Declarations

- **Target Audience:** 13+ (if Family program chahiye to 9+ with "Designed for Families" — extra review)
- **News App?** No
- **COVID?** No
- **Encryption?** Yes, but exempt (standard HTTPS) — select "Yes, but does not require export compliance"

---

## 8. Pricing & Distribution

- **Countries:** Select All (150+ countries) — ya start with Top 10 (PK, IN, ID, BR, US, GB, BD, NG, PH, MX)
- **Price:** Free
- **In-App Purchases:** Declare all Product IDs (remove_ads, coins, gems) — Play Console auto-detects from AAB
- **Ads:** **Yes, contains ads**
- **Device Catalog:** Leave all devices enabled (min API 24 ensures old phones excluded auto)

---

## 9. Pre-Launch Report & Testing

- Upload AAB → **Pre-launch report** auto-generates (Firebase Test Lab — 10 devices par test, crashes bhejta hai)
- Fix any crashes → Re-upload AAB (version code +1)
- **Internal Testing Track:** Pehle 5-10 friends ko invite karo → `Version 1.0` test karo → Feedback lo → Then Production

---

## 10. ROLLOUT

1. **Review All Sections:** Green tick sab par hona chahiye (Store Listing, Content Rating, Data Safety, App Content, Pricing, App Bundle)
2. **Send for Review** → Google 1-3 days mein review karta hai (new account 5-7 days bhi lag sakte hain)
3. **If Rejected:** Email check karo — common reason: missing privacy policy, icon low quality, deceptive ads — fix → resubmit
4. **If Approved:** 🎉 Live! Link: `https://play.google.com/store/apps/details?id=com.bolty.puzzlepark`

**Post-Launch:**
- **Update AAB:** Har update mein `versionCode` +1, `versionName` 1.1, 1.2 etc. → Play Console → Production → New Release
- **Staged Rollout:** Pehle 10% users → no crashes → 100%

---

## 11. Checklist Before Submit

- [ ] App Icon 512x512, Feature Graphic 1024x500, 8 Screenshots
- [ ] AAB <150MB (target <60MB) signed with keystore
- [ ] Privacy Policy URL live
- [ ] Content Rating Everyone
- [ ] Data Safety complete
- [ ] IAP products created & tested
- [ ] Tested on 2 real phones (offline, ads, purchase)
- [ ] Store listing ASO keywords added
- [ ] Contact email valid

> Next: STEP 7 Marketing — TikTok/Reels viral kaise karein!
