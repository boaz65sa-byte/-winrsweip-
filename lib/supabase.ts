import AsyncStorage from '@react-native-async-storage/async-storage'
import { createClient } from '@supabase/supabase-js'

/**
 * Live WinrSwipe backend. These values are the public anon/publishable key
 * (safe to ship in the client). EAS `build.*.env` should match; if a stale
 * dashboard secret still points at a deleted project, we remap below so a
 * production iOS build can actually authenticate.
 */
export const LIVE_SUPABASE_URL = 'https://xkydgfjiofsdqsbozuha.supabase.co'
export const LIVE_SUPABASE_ANON_KEY = 'sb_publishable_k-MWNYGfyK9QzaAZFnF9GQ_fB07Vq5g'

/** Deleted / paused projects previously shipped in eas.json — DNS NXDOMAIN. */
const RETIRED_SUPABASE_HOSTS = [
  'onmcbwieonuazwlsxhor',
  'qxpueymbeawmlroknjwe',
  'msozsfuogkxtnqtidwig',
]

export function resolveSupabaseConfig(
  url = process.env.EXPO_PUBLIC_SUPABASE_URL,
  key = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY,
) {
  const retired = !!url && RETIRED_SUPABASE_HOSTS.some((host) => url.includes(host))
  if (!url || retired) {
    return { url: LIVE_SUPABASE_URL, key: LIVE_SUPABASE_ANON_KEY, remapped: true as const }
  }
  if (!key) {
    return { url: LIVE_SUPABASE_URL, key: LIVE_SUPABASE_ANON_KEY, remapped: true as const }
  }
  return { url, key, remapped: false as const }
}

const { url: supabaseUrl, key: supabaseAnonKey } = resolveSupabaseConfig()

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Missing EXPO_PUBLIC_SUPABASE_URL / EXPO_PUBLIC_SUPABASE_ANON_KEY — set them as EAS environment variables for this build profile.'
  )
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
})
