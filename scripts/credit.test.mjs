import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const read = (p) => readFileSync(join(root, p), 'utf8');
const CREDIT = 'bs-simple.com · פתרונות יצירתיים · בועז סעדה';

test('WS-09: app shows the bs-simple logo and exact credit linking to bs-simple.com', () => {
  const c = read('components/BsSimpleCredit.tsx');
  assert.ok(c.includes(`'${CREDIT}'`));
  assert.match(c, /'https:\/\/bs-simple\.com'/);
  assert.match(c, /bs-simple-monogram\.png/);
  assert.ok(existsSync(join(root, 'assets/images/bs-simple-monogram.png')));
  assert.match(read('app/profile.tsx'), /<BsSimpleCredit/);
});

test('WS-09: support and privacy pages show the logo and exact credit', () => {
  const c = read('web/components/BsSimpleCredit.tsx');
  assert.ok(c.includes(`'${CREDIT}'`));
  assert.match(c, /href="https:\/\/bs-simple\.com"/);
  assert.ok(existsSync(join(root, 'web/public/bs-simple-monogram.png')));
  for (const p of ['web/app/support/page.tsx', 'web/app/privacy/page.tsx']) {
    const page = read(p);
    assert.match(page, /<BsSimpleCredit \/>/);
    assert.doesNotMatch(page, /בועז סעדה - פתרונות יצירתיים/);
  }
});
