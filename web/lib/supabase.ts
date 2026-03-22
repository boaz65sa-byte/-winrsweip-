import { createClient } from '@supabase/supabase-js';
import { createBrowserClient } from '@supabase/ssr';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// Browser client with cookie-based auth (used in client components)
export const supabase = createBrowserClient(supabaseUrl, supabaseAnonKey);

// Admin client for server actions (service role — bypasses RLS)
export const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey);

// bs-simple.com | בועז סעדה - פתרונות יצירתיים
