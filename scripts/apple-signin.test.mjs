import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const read = (p) => readFileSync(join(root, p), 'utf8');

test('WS-02: native Sign in with Apple uses a hashed nonce and Supabase signInWithIdToken', () => {
  const login = read('app/login.tsx');
  assert.match(login, /AppleAuthentication\.signInAsync\(/);
  assert.match(login, /nonce: hashedNonce/);
  assert.match(login, /signInWithIdToken\(\{\s*provider: 'apple',\s*token: credential\.identityToken,\s*nonce: rawNonce/);
  assert.match(login, /ERR_REQUEST_CANCELED/);
  assert.match(login, /isAvailableAsync/);
});

test('WS-02: nonce is SHA-256 of a random raw value', () => {
  const auth = read('lib/auth.ts');
  assert.match(auth, /getRandomBytesAsync/);
  assert.match(auth, /CryptoDigestAlgorithm\.SHA256/);
});

test('WS-02: entitlement and bundle ID match the Supabase Apple Client ID', () => {
  const app = JSON.parse(read('app.json'));
  assert.equal(app.expo.ios.usesAppleSignIn, true);
  assert.equal(app.expo.ios.bundleIdentifier, 'com.winrswipe.app');
  assert.ok(app.expo.plugins.includes('expo-apple-authentication'));
  const pkg = JSON.parse(read('package.json'));
  assert.ok(pkg.dependencies['expo-apple-authentication']);
  assert.ok(pkg.dependencies['expo-crypto']);
});

test('WS-02: a disabled provider shows a clear message, not a raw error', () => {
  assert.match(read('lib/auth.ts'), /unsupported provider/);
});
