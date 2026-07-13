import AsyncStorage from '@react-native-async-storage/async-storage'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  // Fail loudly at startup instead of silently passing `undefined` into
  // createClient (which otherwise surfaces as a confusing error deep inside
  // whatever screen happens to touch `supabase` first). eas.json's build.env
  // only defines EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY — these two must be set
  // as EAS environment variables/secrets (`eas env:list`) for every build
  // profile, or builds ship with a broken Supabase client.
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