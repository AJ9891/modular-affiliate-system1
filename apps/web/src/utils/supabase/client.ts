import { createBrowserClient } from '@supabase/ssr'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

function requireSupabaseEnv() {
  if (!supabaseUrl || !supabaseKey) {
    throw new Error(
      '[Supabase SSR] Missing NEXT_PUBLIC_SUPABASE_URL and key. ' +
        'Set NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY (preferred) or NEXT_PUBLIC_SUPABASE_ANON_KEY.'
    )
  }
}

export const createClient = () => {
  requireSupabaseEnv()
  return createBrowserClient(supabaseUrl!, supabaseKey!)
}
