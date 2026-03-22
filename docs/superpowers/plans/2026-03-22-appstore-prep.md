# WinrSwipe App Store Preparation — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Generate WinrSwipe branded icon assets, finalize app.json configuration, and produce a store listing reference file ready for App Store Connect and Google Play Console.

**Architecture:** A Node.js script (`scripts/generate-icons.js`) renders the B3 icon design (stacked cards fan + W letter + bid badge) as SVG, then uses `sharp` to produce all required master PNG files. EAS Build auto-derives all other sizes from these masters. Store listing copy is saved as a reference markdown file. Screenshots are taken manually from the iPhone 16 Pro Max simulator.

**Tech Stack:** Node.js, sharp (image processing), SVG, Expo EAS Build

---

## File Map

| File | Action | Purpose |
|------|--------|---------|
| `scripts/generate-icons.js` | Create | Renders SVG icon → PNG masters using sharp |
| `scripts/__tests__/generate-icons.test.js` | Create | Verifies output files exist and have correct dimensions |
| `assets/images/icon.png` | Overwrite | 1024×1024 master iOS icon + App Store icon |
| `assets/images/android-icon-foreground.png` | Overwrite | 1024×1024 Android adaptive foreground (transparent bg) |
| `assets/images/android-icon-background.png` | Overwrite | 1024×1024 solid #0D0D0D background |
| `assets/images/splash-icon.png` | Overwrite | 1242×2688 splash (W logo centered on black) |
| `app.json` | Modify | Add `description` and `ios.category` fields |
| `docs/store-listing.md` | Create | Hebrew + English descriptions, keywords, subtitle |

---

## Task 1: Install sharp and write tests

**Files:**
- Modify: `package.json` (devDependency)
- Create: `scripts/__tests__/generate-icons.test.js`

- [ ] **Step 1: Install sharp**

```bash
npm install --save-dev sharp
```

Expected: `sharp` appears in `devDependencies` in `package.json`.

- [ ] **Step 2: Create test file**

Create `scripts/__tests__/generate-icons.test.js`:

```js
const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

const ROOT = path.resolve(__dirname, '../../');

const expectedFiles = [
  { file: 'assets/images/icon.png', width: 1024, height: 1024 },
  { file: 'assets/images/android-icon-foreground.png', width: 1024, height: 1024 },
  { file: 'assets/images/android-icon-background.png', width: 1024, height: 1024 },
  { file: 'assets/images/splash-icon.png', width: 1242, height: 2688 },
];

describe('generate-icons outputs', () => {
  for (const { file, width, height } of expectedFiles) {
    const fullPath = path.join(ROOT, file);

    test(`${file} exists`, () => {
      expect(fs.existsSync(fullPath)).toBe(true);
    });

    test(`${file} is ${width}x${height}`, async () => {
      const meta = await sharp(fullPath).metadata();
      expect(meta.width).toBe(width);
      expect(meta.height).toBe(height);
    });

    test(`${file} is PNG`, async () => {
      const meta = await sharp(fullPath).metadata();
      expect(meta.format).toBe('png');
    });
  }
});
```

- [ ] **Step 3: Run tests — verify they fail (files don't exist yet)**

```bash
npx jest scripts/__tests__/generate-icons.test.js --no-coverage
```

Expected: All tests FAIL with "exists" errors since the new icon files haven't been generated yet.

---

## Task 2: Write the icon generation script

**Files:**
- Create: `scripts/generate-icons.js`

The script builds the B3 icon concept:
- Three stacked cards in a fan (rotated around center 512,512)
- Bold W letter in white
- Bid badge (↑ arrow) in bottom-right corner
- Solid #0D0D0D background for the main icon; transparent for the Android foreground

- [ ] **Step 1: Create `scripts/generate-icons.js`**

```js
#!/usr/bin/env node
'use strict';

const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

const ROOT = path.resolve(__dirname, '..');
const ASSETS = path.join(ROOT, 'assets', 'images');

// ─── SVG building blocks ─────────────────────────────────────────────────────

function cardRect(rotate, fillColor) {
  // Each card is a 620×620 rounded rect centered at 512,512
  // rotate is in degrees, around center (512,512)
  return `
    <rect
      x="202" y="202" width="620" height="620" rx="110"
      fill="${fillColor}"
      transform="rotate(${rotate} 512 512)"
    />`;
}

function buildIconSVG({ bgColor = '#0D0D0D', size = 1024 } = {}) {
  const scale = size / 1024;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 1024 1024">
  <defs>
    <linearGradient id="cardGrad" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#FF5A28"/>
      <stop offset="100%" stop-color="#CC3300"/>
    </linearGradient>
    <filter id="shadow" x="-10%" y="-10%" width="120%" height="120%">
      <feDropShadow dx="0" dy="8" stdDeviation="18" flood-color="#000" flood-opacity="0.5"/>
    </filter>
  </defs>

  <!-- Background -->
  ${bgColor !== 'transparent'
    ? `<rect width="1024" height="1024" fill="${bgColor}"/>`
    : ''}

  <!-- Back card (darkest, most rotated) -->
  ${cardRect(-12, 'rgba(255,77,28,0.18)')}

  <!-- Middle card -->
  ${cardRect(-5, 'rgba(255,77,28,0.42)')}

  <!-- Front card with gradient + shadow -->
  <rect
    x="202" y="202" width="620" height="620" rx="110"
    fill="url(#cardGrad)"
    filter="url(#shadow)"
  />

  <!-- W letter (bold, centered) -->
  <path
    d="M190,230 L340,750 L512,430 L684,750 L834,230"
    stroke="white" stroke-width="68" stroke-linecap="round" stroke-linejoin="round"
    fill="none"
  />

  <!-- Bid badge circle -->
  <circle cx="762" cy="762" r="88" fill="#FF4D1C" stroke="#0D0D0D" stroke-width="10"/>

  <!-- Bid badge up-arrow -->
  <path
    d="M762,808 L762,716 M724,754 L762,716 L800,754"
    stroke="white" stroke-width="20" stroke-linecap="round" stroke-linejoin="round"
    fill="none"
  />
</svg>`;
}

function buildSplashSVG() {
  // 1242×2688 — small icon centered on black
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1242" height="2688" viewBox="0 0 1242 2688">
  <rect width="1242" height="2688" fill="#0D0D0D"/>
  <defs>
    <linearGradient id="cardGrad2" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#FF5A28"/>
      <stop offset="100%" stop-color="#CC3300"/>
    </linearGradient>
    <filter id="shadow2" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="6" stdDeviation="14" flood-color="#000" flood-opacity="0.5"/>
    </filter>
  </defs>
  <!-- Translate to center of splash -->
  <g transform="translate(309, 832)">
    <!-- Back card -->
    <rect x="31" y="31" width="558" height="558" rx="99"
      fill="rgba(255,77,28,0.18)"
      transform="rotate(-12 310 310)"/>
    <!-- Middle card -->
    <rect x="31" y="31" width="558" height="558" rx="99"
      fill="rgba(255,77,28,0.42)"
      transform="rotate(-5 310 310)"/>
    <!-- Front card -->
    <rect x="31" y="31" width="558" height="558" rx="99"
      fill="url(#cardGrad2)" filter="url(#shadow2)"/>
    <!-- W -->
    <path d="M60,80 L190,580 L310,290 L430,580 L560,80"
      stroke="white" stroke-width="58" stroke-linecap="round" stroke-linejoin="round"
      fill="none"/>
    <!-- Badge -->
    <circle cx="478" cy="478" r="66" fill="#FF4D1C" stroke="#0D0D0D" stroke-width="8"/>
    <path d="M478,510 L478,446 M452,472 L478,446 L504,472"
      stroke="white" stroke-width="16" stroke-linecap="round" stroke-linejoin="round"
      fill="none"/>
  </g>
</svg>`;
}

// ─── Render functions ─────────────────────────────────────────────────────────

async function renderSVGtoPNG(svgString, outputPath) {
  const buf = Buffer.from(svgString);
  await sharp(buf).png().toFile(outputPath);
  console.log(`✓ ${path.relative(ROOT, outputPath)}`);
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  console.log('\n🎨 Generating WinrSwipe icons...\n');

  // iOS icon + App Store icon (black background)
  await renderSVGtoPNG(
    buildIconSVG({ bgColor: '#0D0D0D' }),
    path.join(ASSETS, 'icon.png')
  );

  // Android adaptive foreground (transparent background)
  await renderSVGtoPNG(
    buildIconSVG({ bgColor: 'transparent' }),
    path.join(ASSETS, 'android-icon-foreground.png')
  );

  // Android adaptive background (solid black)
  await sharp({
    create: { width: 1024, height: 1024, channels: 3, background: '#0D0D0D' }
  }).png().toFile(path.join(ASSETS, 'android-icon-background.png'));
  console.log('✓ assets/images/android-icon-background.png');

  // Monochrome (simple white W on transparent for Android 13 themed icons)
  const monoSVG = `<svg xmlns="http://www.w3.org/2000/svg" width="1024" height="1024" viewBox="0 0 1024 1024">
    <path d="M190,230 L340,750 L512,430 L684,750 L834,230"
      stroke="white" stroke-width="68" stroke-linecap="round" stroke-linejoin="round"
      fill="none"/>
  </svg>`;
  await renderSVGtoPNG(monoSVG, path.join(ASSETS, 'android-icon-monochrome.png'));

  // Splash screen
  await renderSVGtoPNG(
    buildSplashSVG(),
    path.join(ASSETS, 'splash-icon.png')
  );

  console.log('\n✅ All icons generated.\n');
}

main().catch(err => { console.error(err); process.exit(1); });
```

- [ ] **Step 2: Verify script syntax**

```bash
node --check scripts/generate-icons.js
```

Expected: No output (no syntax errors).

---

## Task 3: Run the script and verify outputs

**Files:**
- Overwrite: `assets/images/icon.png`
- Overwrite: `assets/images/android-icon-foreground.png`
- Overwrite: `assets/images/android-icon-background.png`
- Overwrite: `assets/images/android-icon-monochrome.png`
- Overwrite: `assets/images/splash-icon.png`

- [ ] **Step 1: Run the script**

```bash
node scripts/generate-icons.js
```

Expected output:
```
🎨 Generating WinrSwipe icons...

✓ assets/images/icon.png
✓ assets/images/android-icon-foreground.png
✓ assets/images/android-icon-background.png
✓ assets/images/android-icon-monochrome.png
✓ assets/images/splash-icon.png

✅ All icons generated.
```

- [ ] **Step 2: Run tests — verify they pass**

```bash
npx jest scripts/__tests__/generate-icons.test.js --no-coverage
```

Expected: All 12 tests PASS (4 files × 3 assertions each).

- [ ] **Step 3: Visually inspect icon.png**

```bash
open assets/images/icon.png
```

Verify: Three stacked orange cards visible, W in white, badge arrow in bottom-right, black background.

- [ ] **Step 4: Commit**

```bash
git add scripts/generate-icons.js scripts/__tests__/generate-icons.test.js assets/images/icon.png assets/images/android-icon-foreground.png assets/images/android-icon-background.png assets/images/android-icon-monochrome.png assets/images/splash-icon.png package.json package-lock.json
git commit -m "feat: add icon generation script and WinrSwipe branded assets"
```

---

## Task 4: Finalize app.json configuration

**Files:**
- Modify: `app.json`

The permission strings, slug, eas.json Android submit block, and .gitignore entries (google-play-service-account.json, .superpowers/) were already applied in the brainstorming session — no action needed. This task adds the two remaining store metadata fields: `description` and `ios.category`.

- [ ] **Step 1: Add `description` field to app.json**

In `app.json`, inside the `"expo"` object (after `"name"`), add:

```json
"description": "Tinder-style auctions — swipe right, bid, and win unique items with built-in escrow.",
```

- [ ] **Step 2: Add `ios.category` to app.json**

Inside the `"ios"` object, add:

```json
"category": "APP_SHOPPING",
```

- [ ] **Step 3: Verify app.json is valid JSON**

```bash
node -e "require('./app.json'); console.log('valid')"
```

Expected: `valid`

- [ ] **Step 4: Commit**

```bash
git add app.json
git commit -m "chore: add app description and iOS category to app.json"
```

---

## Task 5: Create store listing reference file

**Files:**
- Create: `docs/store-listing.md`

This file is the single source of truth for all text entered into App Store Connect and Google Play Console. It is not used by the build — it's a reference for manual data entry.

- [ ] **Step 1: Create `docs/store-listing.md`**

```markdown
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
```

- [ ] **Step 2: Commit**

```bash
git add docs/store-listing.md
git commit -m "docs: add store listing copy (Hebrew + English, keywords, age rating, screenshot guide)"
```

---

## Task 6: Final build verification

This task ensures the project builds cleanly with the new assets before submitting.

- [ ] **Step 1: Check Expo config is valid**

```bash
npx expo config --type public
```

Expected: JSON output with `"name": "WinrSwipe"`, `"slug": "winrswipe"`, `"icon"` path, and no errors.

- [ ] **Step 2: Verify all permission strings say "WinrSwipe"**

```bash
grep -n "SwipeBid" app.json
```

Expected: No output (zero occurrences).

- [ ] **Step 3: Verify eas.json is valid JSON**

```bash
node -e "require('./eas.json'); console.log('valid')"
```

Expected: `valid`

- [ ] **Step 4: Run full test suite**

```bash
npx jest --no-coverage
```

Expected: All tests pass.

- [ ] **Step 5: Commit any remaining changes**

```bash
git status
# If anything is unstaged:
git add -A
git commit -m "chore: final app store prep — config and asset verification"
```

---

## Out of Scope (Manual Steps After This Plan)

These require developer action outside of code:

1. **Host privacy policy** — Export `app/privacy.tsx` content to a public URL
2. **EAS Build** — `eas build --platform all --profile production`
3. **Screenshots** — Capture manually on iPhone 16 Pro Max simulator (see `docs/store-listing.md`)
4. **App Store Connect** — Create app listing, enter copy from `docs/store-listing.md`, upload screenshots, complete age rating questionnaire
5. **Google Play Console** — First manual AAB upload, enter copy, complete Financial Services declaration
6. **Stripe live keys** — Replace `"your_stripe_live_key_here"` in `eas.json` with real production publishable key before production build
7. **EAS Submit (subsequent releases)** — `eas submit --platform ios` / `eas submit --platform android`
