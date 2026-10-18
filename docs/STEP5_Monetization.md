# STEP 5: MONETIZATION — AdMob + IAP (No Irritation)
> Goal: Zyada earning + Khush player (1-star "too many ads" nahi aana chahiye)

---

## 1. Strategy: Hybrid (IAP 60% + Ads 40%)

| Source | % Revenue | ARPDAU | Example |
|--------|-----------|--------|---------|
| IAP (Remove Ads + Coins/Gems) | 60% | $0.06 | Remove Ads $2.99 = 40% of IAP |
| Rewarded Ads | 25% | $0.025 | Hint, Heart, Spin, Unlock |
| Interstitial | 10% | $0.01 | Only on FAIL, 1 per 3 min |
| Banner | 5% | $0.005 | Hub only, bottom |

**Total ARPDAU Target:** $0.09 (conservative, Pakistan Tier 2 traffic) → Tier 1 (USA) $0.25-0.50

---

## 2. Ad Placements (Exact Jagah)

### Rewarded Ads (Player Khud Click Karega — No Irritation)
| Placement | Trigger | Reward | eCPM | Frequency |
|-----------|---------|--------|------|-----------|
| Hint | 💡 Hint button (20 coins) → "Watch Ad for FREE Hint?" | Free hint | $8-12 | Unlimited (player choice) |
| Extra Heart | Out of Hearts → "Watch Ad +1 Heart?" | +1 Heart, continue | $7-10 | Max 3 per day |
| Streak Save | Streak break → "Watch Ad to SAVE streak?" | Streak continues | $6-9 | 1 per day |
| Daily Spin | Extra spin after free → "Watch Ad for extra spin?" | 20-500 coins | $5-8 | 3 per day |
| World Early Unlock | 🔒 World locked → "Watch Ad to unlock this session" | Temp unlock | $7-10 | Once per world |
| Shuffle | Shuffle button | Shuffle puzzle | $5-8 | 1 per level |

**Code (AdManager.cs):**
```csharp
public void ShowRewarded(string placement, Action onReward){
    if(adRewarded.IsLoaded()){
        adRewarded.OnUserEarnedReward += (s, e) => { onReward?.Invoke(); Log("rewarded_"+placement); };
        adRewarded.Show();
    } else { Toast("Ad not ready, try again!"); }
}
```

### Interstitial Ads (Sirf FAIL Par — WIN Par Kabhi Nahi)
- **When:** Level FAIL (time out or wrong moves) → Show interstitial **IF** 3 min since last interstitial AND player played 3+ levels
- **Why not on WIN:** Celebration kharab hota hai → 1-star reviews. FAIL par player already frustrated, ad expected hai.
- **Cap:** 1 per 3 min, max 4 per session, NO interstitial in first 3 levels (onboarding)
- **eCPM:** $2-4 (Pakistan), $6-12 (USA)

```csharp
bool CanShowInterstitial(){
    if(levelNumber <= 3) return false;
    if(Time.realtimeSinceStartup - lastInterstitial < 180f) return false;
    if(sessionInterstitialCount >= 4) return false;
    return true;
}
```

### Banner Ads (Sirf Hub/Shop — Gameplay Par Kabhi Nahi)
- **Where:** Bottom of Hub Park Map and Shop screen only (320x50 adaptive)
- **Why not gameplay:** Blocks puzzle, accidental clicks → policy violation + bad UX
- **eCPM:** $0.5-1
- **Refresh:** 45 sec

---

## 3. IAP (In-App Purchases) — Optional, No Pay-to-Win

| Product ID | Title | Price | What You Get | Why Buy? |
|------------|-------|-------|--------------|----------|
| `remove_ads` | Remove Ads | $2.99 (PKR 499) | No interstitial/banner forever, +500 coins bonus | #1 seller — "ads se tang" players |
| `coins_500` | 500 Coins | $0.99 | 500 coins | Quick hint buy |
| `coins_2500` | 2,500 Coins | $4.99 (+500 bonus) | 3000 coins | Skin shopping |
| `coins_7000` | 7,000 +1k Bonus | $9.99 | 8000 coins | Best value |
| `gems_100` | 100 Gems | $0.99 | 100 gems | Premium skins |
| `gems_550` | 550 Gems | $4.99 (+50 bonus) | 600 gems | Popular |
| `gems_1200` | 1,200 Gems | $9.99 (+200 bonus) | 1400 gems | Whale pack |

**All levels fully free** — IAP only for cosmetics + convenience + time-save. No pay-to-win (har level free hints se solvable).

**Google Play Billing Test:**
1. Play Console → Monetize → Products → In-app products → Create each Product ID
2. License Testing → Add your Gmail → Test with "Test card" (no real charge)
3. In game: `BillingManager.Purchase("remove_ads", onSuccess=> { PlayerPrefs.SetInt("noAds",1); HideAds(); })`

---

## 4. Anti-Irritation Rules (5 Golden Rules)

1. **WIN par kabhi ad nahi** — Sirf FAIL par, aur woh bhi 3 min gap
2. **First 3 levels ad-free** — Player ko hook hone do
3. **Rewarded hamesha optional** — "Watch ad?" with clear reward, Skip allowed
4. **Banner sirf Hub** — Gameplay board clean rakho
5. **Purchased "Remove Ads" ka respect** — Interstitial/banner OFF, rewarded still available (player chahe to bonus ke liye dekh sakta hai)

**Result:** Reviews mein "fair ads" ayega, retention +15% vs ad-spam games.

---

## 5. A/B Test Ideas (Firebase Remote Config)

| Test | A | B | Measure |
|------|---|---|---------|
| Interstitial gap | 3 min | 5 min | Retention vs Revenue |
| Rewarded reward | 20 coins | 50 coins | Daily Rewarded views |
| Remove Ads price | $2.99 | $1.99 | Conversion rate |

Tuning bina update ke kar sakte ho — Remote Config change → app auto update.

---

## 6. Expected Earnings (Realistic)

| DAU | ARPDAU | Daily | Monthly |
|-----|--------|-------|---------|
| 5,000 (soft launch) | $0.07 | $350 (~PKR 97k) | ~PKR 290k |
| 20,000 (organic + TikTok) | $0.09 | $1,800 (~PKR 500k) | ~PKR 1.5M |
| 100,000 (viral) | $0.12 | $12,000 (~PKR 3.3M) | ~PKR 100M |

> Tier 2 average — USA traffic se 3x zyada. Pakistan mein eCPM kam hai lekin volume zyada.

---

## 7. AdMob Setup (10 min)

1. admob.google.com → New App → Android → `com.bolty.puzzlepark`
2. Create Ad Units:
   - Banner: `ca-app-pub-YOUR_ID/1` (Hub)
   - Interstitial: `ca-app-pub-YOUR_ID/2` (Fail)
   - Rewarded: `ca-app-pub-YOUR_ID/3` (Hint/Heart)
3. Copy App ID → `AndroidManifest.xml` → `<meta-data android:name="com.google.android.gms.ads.APPLICATION_ID" android:value="ca-app-pub-YOUR_ID~xxx"/>`
4. Test IDs for dev: `ca-app-pub-3940256099942544/...` (Google test IDs — production se pehle change karo)
5. Mediation: Add Meta Audience Network + Unity Ads for higher fill rate (30% extra)

> Next: STEP 6 Play Store Launch — ASO, Privacy, Publish!
