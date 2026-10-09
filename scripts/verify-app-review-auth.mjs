#!/usr/bin/env node
/**
 * Guards App Review sign-in: production EAS must point at a live Supabase
 * project, email password grant must succeed, and Apple provider status is reported.
 *
 *   APP_REVIEW_PASSWORD='…' node scripts/verify-app-review-auth.mjs
 */
import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const eas = JSON.parse(readFileSync(join(root, 'eas.json'), 'utf8'));
const env = eas.build.production.env;
const url = env.EXPO_PUBLIC_SUPABASE_URL;
const key = env.EXPO_PUBLIC_SUPABASE_ANON_KEY;
const expectedHost = 'xkydgfjiofsdqsbozuha.supabase.co';

const RETIRED = ['onmcbwieonuazwlsxhor', 'qxpueymbeawmlroknjwe', 'msozsfuogkxtnqtidwig'];

function fail(msg) {
  console.error(`FAIL: ${msg}`);
  process.exitCode = 1;
}

function dnsResolves(host) {
  try {
    execFileSync('nslookup', [host, '8.8.8.8'], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] });
    return true;
  } catch {
    return false;
  }
}

if (!url?.includes(expectedHost)) {
  fail(`eas.json production EXPO_PUBLIC_SUPABASE_URL must be https://${expectedHost} (got ${url})`);
}
if (RETIRED.some((h) => url?.includes(h))) {
  fail(`eas.json still points at a deleted Supabase project: ${url}`);
}
if (!key) fail('eas.json production is missing EXPO_PUBLIC_SUPABASE_ANON_KEY');

const host = new URL(url).host;
if (!dnsResolves(host)) {
  fail(`DNS NXDOMAIN for ${host} — reviewers will see a sign-in error after submitting credentials`);
} else {
  console.log(`OK dns ${host}`);
}

const settingsRes = await fetch(`${url}/auth/v1/settings`, {
  headers: { apikey: key, Authorization: `Bearer ${key}` },
});
const settings = await settingsRes.json();
if (!settingsRes.ok) fail(`auth settings HTTP ${settingsRes.status}: ${JSON.stringify(settings)}`);
if (!settings.external?.email) fail('Email provider is disabled in Supabase Auth');
else console.log('OK email provider enabled');
if (!settings.mailer_autoconfirm) {
  console.warn('WARN: mailer_autoconfirm is false — new registrations cannot sign in until they confirm email');
}
if (!settings.external?.apple) {
  console.warn('WARN: Apple provider is DISABLED. Enable it in Supabase → Authentication → Providers → Apple, Client IDs: com.winrswipe.app');
} else {
  console.log('OK Apple provider enabled');
}

const email = process.env.APP_REVIEW_EMAIL || 'appreview@bs-simple.com';
const password = process.env.APP_REVIEW_PASSWORD;
if (!password) {
  console.warn('WARN: APP_REVIEW_PASSWORD not set; skipped password-grant check');
} else {
  const tokenRes = await fetch(`${url}/auth/v1/token?grant_type=password`, {
    method: 'POST',
    headers: {
      apikey: key,
      Authorization: `Bearer ${key}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, password }),
  });
  const tokenBody = await tokenRes.json();
  if (!tokenRes.ok || !tokenBody.access_token) {
    fail(`password grant failed for ${email}: ${JSON.stringify(tokenBody)}`);
  } else {
    console.log(`OK password grant for ${email}`);
  }
}

if (process.exitCode) {
  console.error('App Review auth verification failed.');
  process.exit(process.exitCode);
}
console.log('App Review auth verification passed.');
