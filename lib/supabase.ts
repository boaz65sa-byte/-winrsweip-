import AsyncStorage from '@react-native-async-storage/async-storage'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://xkydgfjiofsdqsbozuha.supabase.co'
const supabaseAnonKey = 'sb_publishable_k-MWNYGfyK9QzaAZFnF9GQ_fB07Vq5g'

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
})