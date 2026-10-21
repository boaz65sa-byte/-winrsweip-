import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const read = (p) => readFileSync(join(root, p), 'utf8');

test('WS-04: feed no longer hard-codes 0 bids / 0 viewers', () => {
  const index = read('app/index.tsx');
  assert.doesNotMatch(index, /bids: 0, watchers: 0/);
  assert.doesNotMatch(index, /product\.watchers \|\| 0/);
  assert.match(index, /select\('\*, bids\(count\)'\)/);
  assert.match(index, /fetchWatcherCounts/);
});

test('WS-04: opening a listing records a view', () => {
  assert.match(read('app/listing.tsx'), /recordListingView\(/);
});

test('WS-04: listing_views migration exists and keeps viewer ids private', () => {
  const sql = read('supabase/migrations/20261021000001_listing_views.sql');
  assert.match(sql, /CREATE TABLE IF NOT EXISTS public\.listing_views/);
  assert.match(sql, /ENABLE ROW LEVEL SECURITY/);
  assert.match(sql, /FUNCTION public\.record_listing_view/);
  assert.match(sql, /FUNCTION public\.listing_view_counts/);
  assert.match(sql, /FROM PUBLIC, anon/);
});
