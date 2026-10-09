# WinrSwipe — Store Listing Copy

## App Name
`WinrSwipe`

## Subtitle (iOS only — max 30 chars)
`Swipe through local deals`
(25 chars ✓)

---

The text to paste into App Store Connect is `app-store-listing.txt`. This file is the short internal copy of the same free-launch listing.

## Description — Hebrew

WinrSwipe הוא שוק מקומי. גוללים בין מודעות, מגישים הצעה, ומתאמים את המסירה עם המוכר בצ'אט.

✓ סוויפ בין מודעות
✓ הגשת הצעה
✓ צ'אט עם המוכר
✓ פרסום פריט
✓ מחיקת חשבון ממסך הפרופיל

---

## Description — English

WinrSwipe is a local marketplace. Swipe through listings, place a bid, and message the seller to arrange the handoff.

✓ Swipe through listings
✓ Place a bid
✓ Chat with the seller
✓ Publish an item
✓ Delete your account from the profile screen

---

## Keywords (iOS — 100 chars max)
`auction,bid,swipe,marketplace,buy,sell,secondhand,local,israel,winrswipe`
(72 chars ✓ — 28 chars remaining for future additions)

## Google Play Tags
Shopping · Marketplace · Auction

## Category
- iOS: Shopping (APP_SHOPPING)
- Android: Shopping

---

## Privacy Policy URL
https://winrsweip-boaz-s-projects-6bda35e8.vercel.app/privacy

## Support URL
https://winrsweip-boaz-s-projects-6bda35e8.vercel.app/support

---

## Age Rating

### iOS (App Store Connect questionnaire)
- Simulated Gambling → **No**
- Real Money Gambling, Lotteries → **No**
- Real Money Gaming → **No**
- All other questions → **No**
→ Result: **4+**

### Android (Google Play)
- This version does not process payments. Do not declare in-app financial transactions.
- No gambling declarations needed
→ Result: **Everyone**

---

## Screenshots Required

### iOS — iPhone 16 Pro Max (1320×2868)
1. Home swipe card with a real listing
2. Bid sheet (no fee line)
3. Search grid
4. Listing detail with a contact button
5. Chat with a seller
6. Profile, including Delete account

### Android — 1080×1920 minimum
Same 5 screens, captured on Android emulator or device.

### How to capture (iOS Simulator)
1. `npx expo start`
2. Open iPhone 16 Pro Max simulator
3. Navigate to each screen
4. Press `Cmd+S` in simulator OR run: `xcrun simctl io booted screenshot screenshot-name.png`

---

## First-time Google Play Upload
⚠️ The **first** APK/AAB must be uploaded **manually** via Google Play Console.
`eas submit --platform android` only works for subsequent releases.

Steps:
1. Build: `eas build --platform android --profile production`
2. Download the .aab from EAS dashboard
3. Upload manually in Play Console → Production → Create new release

---

## Build & Submit Commands

```bash
# Generate icons (if design changes)
node scripts/generate-icons.js

# Production build — both platforms
eas build --platform all --profile production

# Submit iOS (after build)
eas submit --platform ios

# Submit Android (subsequent releases only — first must be manual)
eas submit --platform android
```
