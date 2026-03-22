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
