# WinrSwipe — App Store Preparation Design

**Date:** 2026-03-22
**Status:** Approved
**Platforms:** iOS + Android
**App Name:** WinrSwipe
**Bundle ID:** com.winrswipe.app

---

## Overview

Prepare WinrSwipe for submission to both the Apple App Store and Google Play Store. The work covers four areas: icon asset pipeline, configuration updates, store listing content, and screenshot guidance.

---

## 1. Icon Asset Pipeline

### Approach
A Node.js script (`scripts/generate-icons.js`) using the `sharp` library generates all required icon sizes from a single 1024×1024 SVG master.

### Icon Design (B3 — chosen by user)
- **Background:** #0D0D0D (solid black)
- **Shape:** Rounded rectangle (22px radius at 1024px scale)
- **Element:** Three stacked cards in a fan arrangement — background cards in semi-transparent orange (#FF4D1C at 20% and 40% opacity), front card in solid orange gradient (#FF5A28 → #CC3300)
- **Letter:** Bold W in white, centered on front card
- **Badge:** Small circle (bid arrow ↑) in bottom-right corner, solid #FF4D1C with white arrow, dark border

### Required Output Sizes

**iOS (output to `assets/images/ios/`):**
| Filename | Size | Usage |
|---|---|---|
| icon-1024.png | 1024×1024 | App Store |
| icon-87.png | 87×87 | iPhone @3x small |
| icon-80.png | 80×80 | iPhone @2x spotlight |
| icon-60.png | 60×60 | iPhone @2x home |
| icon-40.png | 40×40 | Spotlight |
| icon-29.png | 29×29 | Settings |
| icon-20.png | 20×20 | Notification |

**Android (output to `assets/images/android/`):**
| Filename | Size | Usage |
|---|---|---|
| icon-foreground-1024.png | 1024×1024 | Adaptive foreground |
| icon-192.png | 192×192 | xxxhdpi |
| icon-144.png | 144×144 | xxhdpi |
| icon-96.png | 96×96 | xhdpi |
| icon-72.png | 72×72 | hdpi |
| icon-48.png | 48×48 | mdpi |

**Splash (output to `assets/images/`):**
| Filename | Size |
|---|---|
| splash-icon.png | 1242×2688 — centered W logo on #0D0D0D |

### app.json References
- `expo.icon` → `./assets/images/icon.png` (1024×1024, already set)
- `expo.android.adaptiveIcon.foregroundImage` → `./assets/images/android-icon-foreground.png` (already set)
- The script overwrites these files in place — no app.json changes needed for icons.

---

## 2. Configuration Updates

### app.json additions
```json
{
  "expo": {
    "description": "Tinder-style auctions — swipe, bid, win.",
    "primaryColor": "#FF4D1C",
    "ios": {
      "appStoreUrl": "",
      "category": "APP_SHOPPING"
    },
    "android": {
      "googleServicesFile": "./google-services.json"
    }
  }
}
```

### eas.json — Stripe key placeholders
The file currently contains `"your_stripe_test_key_here"` and `"your_stripe_live_key_here"`. These must be replaced manually by the developer with real Stripe publishable keys before building. They are **not** committed to source control as real values.

### .gitignore additions
```
.superpowers/
google-services.json
.env
```

---

## 3. Store Listing Content

### App Name
`WinrSwipe`

### Subtitle (iOS, max 30 chars)
`Swipe. Bid. Win.`

### Description — Hebrew
```
WinrSwipe — מכרזים בסגנון Tinder.

גלול ימינה על מה שאתה אוהב, הגש הצעה, וזכה. קנה ומכור פריטים יחידים עם מערכת נאמנות מובנית — הכסף מוחזק עד שאתה מאשר קבלה.

✓ סווייפ על מכרזים בזמן אמת
✓ הצעות מחיר + קנה עכשיו
✓ Safe Trade — כסף בנאמנות עד קבלת הפריט
✓ צ'אט ישיר עם המוכר לאחר עסקה
✓ חיפוש לפי קטגוריה ומיקום GPS
✓ מצב כהה/בהיר
```

### Description — English
```
WinrSwipe — Tinder-style auctions.

Swipe right on what you love, place a bid, and win. Buy and sell unique items with built-in escrow — your money is held safely until you confirm receipt.

✓ Swipe through live auctions in real time
✓ Place bids or Buy It Now
✓ Safe Trade — funds held in escrow until delivery confirmed
✓ Direct chat with seller after a deal closes
✓ Search by category and GPS location
✓ Dark / Light mode
```

### Keywords (iOS — 100 chars max)
`auction,bid,swipe,marketplace,escrow,buy,sell,secondhand,deals,winrswipe`

### Google Play Tags
Shopping · Marketplace · Auction

### Privacy Policy URL
Must be a publicly accessible URL. Suggested: add `app/privacy.tsx` content to a hosted page (e.g., `winrswipe.com/privacy` or a GitHub Pages URL). This is **required** before submission.

### Age Rating
4+ (iOS) / Everyone (Android) — no mature content, no gambling (auctions with real money may need review; standard marketplace rating applies).

---

## 4. Screenshots

### Required Sizes
- **iOS:** 1290×2796px (iPhone 15 Pro Max), minimum 3, maximum 10
- **Android:** 1080×1920px minimum, minimum 2

### Recommended 5 Screens (manual capture on simulator/device)
1. **Swipe screen** — main auction feed with swipe animation visible
2. **Search screen** — category filters + GPS nearby listings grid
3. **Listing detail** — product carousel + bid history + timer
4. **Payment screen** — Safe Trade escrow breakdown + pay button
5. **Won screen** — active purchases with escrow status badges

### Process
Run `npx expo start` → open on iPhone 15 Pro Max simulator → take screenshots via `Cmd+S` in simulator or `xcrun simctl io booted screenshot`.

---

## 5. Build & Submit Commands

```bash
# Install sharp for icon generation
npm install --save-dev sharp

# Generate all icons
node scripts/generate-icons.js

# Build for both platforms
eas build --platform all --profile production

# Submit to stores (after build completes)
eas submit --platform ios
eas submit --platform android
```

---

## Out of Scope

- App Store Connect / Google Play Console account setup (manual, one-time)
- Stripe live key configuration (manual, never in source control)
- App Review responses
- Localization beyond Hebrew + English
