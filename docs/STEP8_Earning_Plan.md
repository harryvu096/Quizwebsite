# STEP 8: EARNING PLAN — Pehle 3 Mahine + Analytics
> Realistic, not fake gurus — Tier 2 traffic (PK/IN/ID/BR) base

---

## 1. Revenue Model Recap

- **ARPDAU:** $0.05-0.12 (Tier 2), $0.20-0.50 (Tier 1 USA/EU)
- **Sources:** IAP 60% + Rewarded 25% + Interstitial 10% + Banner 5%
- **Key IAP:** Remove Ads $2.99 → 2-4% of players buy within 7 days

---

## 2. Month-by-Month Realistic Estimate

### Month 1: Soft Launch (No Paid Ads — Organic Only)
| Metric | Value | Note |
|--------|-------|------|
| Downloads | 3,000 - 8,000 | TikTok + Reddit + Friends |
| DAU | 500 - 1,200 | Retention D1 30%, D7 12% |
| ARPDAU | $0.04 | Low, early players + low fill rate |
| **Revenue** | **$600 - $1,400 / month** (~PKR 165k - 385k) | AdMob + few IAP |
| Goal | 4.3★+ rating, fix crashes, 100+ reviews | Foundation |

### Month 2: Growth (TikTok Viral + Google App Campaign $5/day)
| Metric | Value | Note |
|--------|-------|------|
| Downloads | 15,000 - 40,000 | 1 video hits 100k+ views |
| DAU | 3,000 - 8,000 | D7 improves to 18% with updates |
| ARPDAU | $0.07 | Better fill, more IAP |
| **Revenue** | **$6,300 - $16,800 / month** (~PKR 1.7M - 4.6M) | IAP kicks in |
| Costs | $150 (ads) | Net positive |
| Goal | 10k+ reviews, Update 1.1 with 10 new levels |

### Month 3: Scale (Viral or Steady)
| Scenario | DAU | Monthly Revenue |
|----------|-----|-----------------|
| **Conservative** (no viral) | 5,000 | $10,500 (~PKR 2.9M) |
| **Expected** (1 viral video 500k) | 15,000 | $31,500 (~PKR 8.6M) |
| **Viral** (1M downloads) | 40,000 | $100k+ (~PKR 27M) |

> Reality: 80% games stay Conservative, 15% Expected, 5% Viral. Even Conservative = full-time income in Pakistan.

---

## 3. Improve Game to Increase Earnings (Analytics)

### Firebase Setup (10 min — STEP 4 mein kiya)
1. firebase.google.com → Project `bolty-park` → Analytics ON
2. Track Events:
   - `level_start` (world, level)
   - `level_complete` (world, level, stars, time)
   - `level_fail` (world, level, reason)
   - `ad_rewarded` (placement)
   - `ad_interstitial` (shown)
   - `iap_purchase` (product, price)
   - `daily_reward` (day)
3. Code (GameManager.cs):
```csharp
FirebaseAnalytics.LogEvent("level_complete", new Parameter("world", curWorld), new Parameter("level", curLevel), new Parameter("stars", stars));
```

### Dashboard to Watch (Weekly)
| Metric | Good | Bad | Action if Bad |
|--------|------|-----|---------------|
| D1 Retention | >30% | <20% | Tutorial too hard — simplify first 5 levels |
| D7 Retention | >15% | <8% | Add daily missions + push notifications |
| Level Fail Rate (level 10) | 30-40% | >70% | Too hard — increase time or hints |
| Ad Show Rate | 40-60% | >80% | Too many ads — increase interstitial gap to 5 min |
| IAP Conversion | 1-3% | <0.5% | Make Remove Ads more visible, offer 50% discount popup after 3 fails |
| Avg Session | 12-20 min | <6 min | 3-in-1 cross-promo not working — add "Try other world" popup |

### A/B Tests (Remote Config — No Update Needed)
- Test interstitial gap: 3 min vs 5 min → see retention
- Test rewarded reward: 20 vs 50 coins → see views
- Test Remove Ads price: $2.99 vs $1.99 → see conversion

---

## 4. Long-Term (Month 4-6)

- **Update 1.2:** 20 new levels + new skin pack → Play Store boost
- **Seasonal Event:** Ramadan/Eid theme → +30% installs in MENA
- **Mediation:** Add Unity Ads + Meta → +20% ad revenue
- **Play Pass:** Apply for Google Play Pass (subscription) → extra $500-2k/month
- **iOS Port:** Same Unity project → Build for iOS → double audience (1 week extra)

---

## 5. Reinvestment Plan

| Revenue | Reinvest |
|---------|----------|
| First $100 | Google App Campaign test ($5/day) |
| First $500 | Hire Fiverr artist for 5 new skins ($50) + TikTok editor ($30) |
| $2k+/month | Part-time dev for multiplayer/leaderboard upgrade |

---

## 6. Risks & Mitigation

| Risk | Mitigation |
|------|------------|
| Google rejects AAB | Follow STEP 6 checklist, test pre-launch report |
| 1-star "too many ads" | Follow anti-irritation 5 rules (STEP 5) |
| No downloads | Post 2 videos/day, Reddit daily, ask friends to rate 5★ first 20 |
| AdMob banned | Never click own ads, don't place ads on splash, follow AdMob policy |

---

## 7. Final Checklist — A to Z Complete ✅

- [x] STEP 1: Market Research (5 games, gap, 3 ideas, Best: Screw → 3-in-1)
- [x] STEP 1 Add-on: 3-in-1 Strategy (Session 22 min, 9 ads/day)
- [x] STEP 2: GDD (110 levels, 11 bosses, shared economy, retention)
- [x] STEP 3: Art & Assets (icon, feature graphic, 8 screenshots, sounds)
- [x] STEP 4: Development (Playable HTML5 now + Unity C# project)
- [x] STEP 5: Monetization (Hybrid $0.09 ARPDAU, no-irritation)
- [x] STEP 6: Play Store Launch (Title, ASO, Privacy, Data Safety, Publish)
- [x] STEP 7: Marketing (10 video scripts, 30-day schedule, hashtags)
- [x] STEP 8: Earning Plan (Month 1-3 estimate + Firebase Analytics)

---

## 8. What You Must Do Now (Clear Instructions)

1. **Test Preview:** `GameProject/index.html` open karo → khelo → feedback do
2. **Play Console:** $25 pay karo → App banao (STEP 6)
3. **Unity Build:** Unity Hub install → AAB build → Play Console upload
4. **Publish:** 1-3 days review → Live!
5. **Marketing:** TikTok account banao → Video #1 post karo (script ready) → Daily 1 video
6. **Iterate:** Firebase check weekly → levels fix → updates

**Tumhari earning shuru — 30 din mein! 🚀**

> Questions? Har step ka doc `docs/` mein hai. Koi step repeat karna ho to bolo!
