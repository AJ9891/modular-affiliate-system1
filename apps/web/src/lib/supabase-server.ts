import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'

type SupabaseEnv = {
  url: string
  anonKey: string
  serviceKey?: string
}

function loadSupabaseEnv(requireServiceRole = false): SupabaseEnv {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!url || !anonKey) {
    throw new Error('[Supabase] NEXT_PUBLIC_SUPABASE_URL/ANON_KEY missing')
  }

  if (requireServiceRole && !serviceKey) {
    throw new Error('[Supabase] SUPABASE_SERVICE_ROLE_KEY missing')
  }

  return { url, anonKey, serviceKey }
}

// Server-side helper for route handlers (uses Next cookies)
export async function createServerRouteClient() {
  const cookieStore = await cookies()
  const cookieAdapter = (() => cookieStore) as unknown as () => ReturnType<typeof cookies>
  return createRouteHandlerClient({ cookies: cookieAdapter })
}

// Service-role client (never exposed to the browser)
export function createServiceRoleClient() {
  const { url, serviceKey } = loadSupabaseEnv(true)

  return createClient(url, serviceKey!, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  })
}

// Backward compatible server client that stores session in cookies
export async function createServerClient() {
  const { url, anonKey } = loadSupabaseEnv()
  const cookieStore = await cookies()

  return createClient(url, anonKey, {
    auth: {
      storage: {
        getItem: (key: string) => cookieStore.get(key)?.value ?? null,
        setItem: (key: string, value: string) => { cookieStore.set(key, value) },
        removeItem: (key: string) => { cookieStore.delete(key) },
      },
    },
  })
}

export { loadSupabaseEnv }
