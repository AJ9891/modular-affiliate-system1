import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'
import { createClient as createSsrServerClient } from '@/utils/supabase/server'

type SupabaseEnv = {
  url: string
  publicKey: string
  serviceKey?: string
}

function loadSupabaseEnv(requireServiceRole = false): SupabaseEnv {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const publicKey =
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!url || !publicKey) {
    throw new Error(
      '[Supabase] NEXT_PUBLIC_SUPABASE_URL/public key missing (set PUBLISHABLE_KEY or ANON_KEY)'
    )
  }

  if (requireServiceRole && !serviceKey) {
    throw new Error('[Supabase] SUPABASE_SERVICE_ROLE_KEY missing')
  }

  return { url, publicKey, serviceKey }
}

// Server-side helper for route handlers (uses Next cookies)
export async function createServerRouteClient() {
  const cookieStore = await cookies()
  return createSsrServerClient(cookieStore)
}

// Service-role client (never exposed to the browser)
export function createServiceRoleClient() {
  const { url, serviceKey } = loadSupabaseEnv(true)

  return createSupabaseClient(url, serviceKey!, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  })
}

// Backward compatible server client that stores session in cookies
export async function createServerClient() {
  return createServerRouteClient()
}

export { loadSupabaseEnv }
