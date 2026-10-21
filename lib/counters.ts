import { supabase } from './supabase';

export type Counters = { bids: number; watchers: number | null };

/** Bid count from a PostgREST `bids(count)` embed. */
export function bidCountOf(row: { bids?: { count?: number }[] | null }): number {
  const n = row?.bids?.[0]?.count;
  return typeof n === 'number' ? n : 0;
}

/**
 * Distinct viewers per listing from the `listing_view_counts` RPC
 * (migration 20261021000001_listing_views.sql). Until that migration is applied
 * the RPC is missing and this returns null, so the UI hides the viewers count
 * instead of showing a fake 0.
 */
export async function fetchWatcherCounts(ids: string[]): Promise<Map<string, number> | null> {
  if (ids.length === 0) return new Map();
  const { data, error } = await supabase.rpc('listing_view_counts', { p_listing_ids: ids });
  if (error || !Array.isArray(data)) return null;
  const map = new Map<string, number>();
  for (const id of ids) map.set(id, 0);
  for (const r of data as { listing_id: string; viewers: number }[]) map.set(r.listing_id, Number(r.viewers) || 0);
  return map;
}

/** Records that the signed-in user viewed a listing. Best effort, never throws. */
export async function recordListingView(listingId: string): Promise<void> {
  try {
    await supabase.rpc('record_listing_view', { p_listing_id: listingId });
  } catch {
    // counters are cosmetic; ignore
  }
}

export function formatCounters(c: Counters): string {
  const bids = `${c.bids} הצעות`;
  return c.watchers == null ? bids : `${bids} · ${c.watchers} צופים`;
}
