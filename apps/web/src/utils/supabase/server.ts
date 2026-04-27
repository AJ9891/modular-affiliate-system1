import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

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

export const createClient = (cookieStore: Awaited<ReturnType<typeof cookies>>) => {
  requireSupabaseEnv()

  return createServerClient(supabaseUrl!, supabaseKey!, {
    cookies: {
      getAll() {
        return cookieStore.getAll()
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          )
        } catch {
          // `setAll` can be called from a Server Component where writing cookies is not allowed.
          // Middleware should refresh sessions in that case.
        }
      },
    },
  })
}

export async function createServerSupabaseClient() {
  const cookieStore = await cookies()
  return createClient(cookieStore)
}
