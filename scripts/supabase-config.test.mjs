import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');

test('production EAS profile points at the live Supabase project', () => {
  const eas = JSON.parse(readFileSync(join(root, 'eas.json'), 'utf8'));
  for (const profile of ['development', 'preview', 'production']) {
    const url = eas.build[profile].env.EXPO_PUBLIC_SUPABASE_URL;
    assert.equal(
      url,
      'https://xkydgfjiofsdqsbozuha.supabase.co',
      `${profile} must not ship a deleted Supabase host`,
    );
    assert.match(eas.build[profile].env.EXPO_PUBLIC_SUPABASE_ANON_KEY, /^sb_publishable_/);
  }
});

test('registration copy marks phone as optional in English', () => {
  const login = readFileSync(join(root, 'app/login.tsx'), 'utf8');
  assert.match(login, /Phone \(optional\)/);
  assert.match(login, /Not required to create an account/);
  assert.doesNotMatch(login, /if \(!email \|\| !password \|\| !phone\)/);
});

test('iOS explicitly enables Sign in with Apple', () => {
  const app = JSON.parse(readFileSync(join(root, 'app.json'), 'utf8'));
  assert.equal(app.expo.ios.usesAppleSignIn, true);
  assert.ok(app.expo.plugins.includes('expo-apple-authentication'));
  assert.ok(Number(app.expo.ios.buildNumber) >= 25);
});

test('free launch does not ship a Stripe publishable key', () => {
  const eas = JSON.parse(readFileSync(join(root, 'eas.json'), 'utf8'));
  const features = readFileSync(join(root, 'lib/features.ts'), 'utf8');
  assert.match(features, /export const PAYMENTS_ENABLED = false/);
  for (const profile of ['development', 'preview', 'production']) {
    assert.equal(eas.build[profile].env.EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY, undefined);
  }
  const listing = readFileSync(join(root, 'app-store-listing.txt'), 'utf8');
  assert.doesNotMatch(listing, /Tinder|eBay|SwipeBid/);
  assert.match(listing, /WinrSwipe/);
  assert.match(listing, /appreview@bs-simple.com/);
  assert.match(listing, /App Store Connect only/);
});

test('reviewer password is not written in the repo', () => {
  const status = readFileSync(join(root, 'STATUS.md'), 'utf8');
  assert.match(status, /not stored in this repo/i);
  assert.doesNotMatch(status, /appreview@bs-simple\.com` \/ `/);
  assert.match(readFileSync(join(root, 'app/profile.tsx'), 'utf8'), /delete-account/);
  assert.ok(readFileSync(join(root, 'supabase/functions/delete-account/index.ts'), 'utf8').includes('deleteUser'));
});
