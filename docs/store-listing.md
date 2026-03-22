# WinrSwipe — Store Listing Copy

## App Name
`WinrSwipe`

## Subtitle (iOS only — max 30 chars)
`Swipe. Bid. Win.`
(16 chars ✓)

---

## Description — Hebrew

WinrSwipe — מכרזים בסגנון Tinder.

גלול ימינה על מה שאתה אוהב, הגש הצעה, וזכה. קנה ומכור פריטים יחידים עם מערכת נאמנות מובנית — הכסף מוחזק עד שאתה מאשר קבלה.

✓ סווייפ על מכרזים בזמן אמת
✓ הצעות מחיר + קנה עכשיו
✓ Safe Trade — כסף בנאמנות עד קבלת הפריט
✓ צ'אט ישיר עם המוכר לאחר עסקה
✓ חיפוש לפי קטגוריה ומיקום GPS
✓ מצב כהה/בהיר

---

## Description — English

WinrSwipe — Tinder-style auctions.

Swipe right on what you love, place a bid, and win. Buy and sell unique items with built-in escrow — your money is held safely until you confirm receipt.

✓ Swipe through live auctions in real time
✓ Place bids or Buy It Now
✓ Safe Trade — funds held in escrow until delivery confirmed
✓ Direct chat with seller after a deal closes
✓ Search by category and GPS location
✓ Dark / Light mode

---

## Keywords (iOS — 100 chars max)
`auction,bid,swipe,marketplace,escrow,buy,sell,secondhand,deals,winrswipe`
(72 chars ✓ — 28 chars remaining for future additions)

## Google Play Tags
Shopping · Marketplace · Auction

## Category
- iOS: Shopping (APP_SHOPPING)
- Android: Shopping

---

## Privacy Policy URL
Must be a live HTTPS URL before submission.
Suggested: `https://winrswipe.com/privacy` or GitHub Pages.
The content is already in `app/privacy.tsx`.

---

## Age Rating

### iOS (App Store Connect questionnaire)
- Simulated Gambling → **No**
- Real Money Gambling, Lotteries → **No**
- Real Money Gaming → **No**
- All other questions → **No**
→ Result: **4+**

### Android (Google Play)
- Complete Financial Services declaration (app handles real-money transactions)
- No gambling declarations needed
→ Result: **Everyone**

---

## Screenshots Required

### iOS — iPhone 16 Pro Max (1320×2868)
1. Swipe screen — main auction feed
2. Search screen — category filters + GPS grid
3. Listing detail — carousel, timer, bid history
4. Payment screen — Safe Trade escrow breakdown
5. Won screen — active purchases with status badges

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
