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

test('iOS explicitly enables Sign in with Apple', () => {
  const app = JSON.parse(readFileSync(join(root, 'app.json'), 'utf8'));
  assert.equal(app.expo.ios.usesAppleSignIn, true);
  assert.ok(app.expo.plugins.includes('expo-apple-authentication'));
});
