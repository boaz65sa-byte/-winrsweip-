#!/usr/bin/env node
'use strict';

const sharp = require('sharp');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const ASSETS = path.join(ROOT, 'assets', 'images');

// ─── SVG building blocks ─────────────────────────────────────────────────────

function cardRect(rotate, fillColor) {
  // Each card is a 620×620 rounded rect centered at 512,512
  return `
    <rect
      x="202" y="202" width="620" height="620" rx="110"
      fill="${fillColor}"
      transform="rotate(${rotate} 512 512)"
    />`;
}

function buildIconSVG({ bgColor = '#0D0D0D' } = {}) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1024" height="1024" viewBox="0 0 1024 1024">
  <defs>
    <linearGradient id="cardGrad" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#FF5A28"/>
      <stop offset="100%" stop-color="#CC3300"/>
    </linearGradient>
    <filter id="shadow" x="-10%" y="-10%" width="120%" height="120%">
      <feDropShadow dx="0" dy="8" stdDeviation="18" flood-color="#000" flood-opacity="0.5"/>
    </filter>
  </defs>

  ${bgColor !== 'transparent'
    ? `<rect width="1024" height="1024" fill="${bgColor}"/>`
    : ''}

  ${cardRect(-12, 'rgba(255,77,28,0.18)')}
  ${cardRect(-5, 'rgba(255,77,28,0.42)')}

  <rect
    x="202" y="202" width="620" height="620" rx="110"
    fill="url(#cardGrad)"
    filter="url(#shadow)"
  />

  <path
    d="M190,230 L340,750 L512,430 L684,750 L834,230"
    stroke="white" stroke-width="68" stroke-linecap="round" stroke-linejoin="round"
    fill="none"
  />

  <circle cx="762" cy="762" r="88" fill="#FF4D1C" stroke="#0D0D0D" stroke-width="10"/>
  <path
    d="M762,808 L762,716 M724,754 L762,716 L800,754"
    stroke="white" stroke-width="20" stroke-linecap="round" stroke-linejoin="round"
    fill="none"
  />
</svg>`;
}

function buildSplashSVG() {
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
  <g transform="translate(309, 832)">
    <rect x="31" y="31" width="558" height="558" rx="99"
      fill="rgba(255,77,28,0.18)"
      transform="rotate(-12 310 310)"/>
    <rect x="31" y="31" width="558" height="558" rx="99"
      fill="rgba(255,77,28,0.42)"
      transform="rotate(-5 310 310)"/>
    <rect x="31" y="31" width="558" height="558" rx="99"
      fill="url(#cardGrad2)" filter="url(#shadow2)"/>
    <path d="M60,80 L190,580 L310,290 L430,580 L560,80"
      stroke="white" stroke-width="58" stroke-linecap="round" stroke-linejoin="round"
      fill="none"/>
    <circle cx="478" cy="478" r="66" fill="#FF4D1C" stroke="#0D0D0D" stroke-width="8"/>
    <path d="M478,510 L478,446 M452,472 L478,446 L504,472"
      stroke="white" stroke-width="16" stroke-linecap="round" stroke-linejoin="round"
      fill="none"/>
  </g>
</svg>`;
}

// ─── Render ───────────────────────────────────────────────────────────────────

async function renderSVGtoPNG(svgString, outputPath) {
  await sharp(Buffer.from(svgString)).png().toFile(outputPath);
  console.log(`✓ ${path.relative(ROOT, outputPath)}`);
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  console.log('\n🎨 Generating WinrSwipe icons...\n');

  await renderSVGtoPNG(
    buildIconSVG({ bgColor: '#0D0D0D' }),
    path.join(ASSETS, 'icon.png')
  );

  await renderSVGtoPNG(
    buildIconSVG({ bgColor: 'transparent' }),
    path.join(ASSETS, 'android-icon-foreground.png')
  );

  await sharp({
    create: { width: 1024, height: 1024, channels: 3, background: '#0D0D0D' }
  }).png().toFile(path.join(ASSETS, 'android-icon-background.png'));
  console.log('✓ assets/images/android-icon-background.png');

  const monoSVG = `<svg xmlns="http://www.w3.org/2000/svg" width="1024" height="1024" viewBox="0 0 1024 1024">
    <path d="M190,230 L340,750 L512,430 L684,750 L834,230"
      stroke="white" stroke-width="68" stroke-linecap="round" stroke-linejoin="round"
      fill="none"/>
  </svg>`;
  await renderSVGtoPNG(monoSVG, path.join(ASSETS, 'android-icon-monochrome.png'));

  await renderSVGtoPNG(
    buildSplashSVG(),
    path.join(ASSETS, 'splash-icon.png')
  );

  console.log('\n✅ All icons generated.\n');
}

main().catch(err => { console.error(err); process.exit(1); });
