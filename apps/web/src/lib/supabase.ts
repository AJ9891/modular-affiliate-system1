// BOUNDARY: Server API routes should use createRouteHandlerClient
// BOUNDARY: Client components MUST use supabase-client.ts
// BOUNDARY: This exports ONLY the runtime-safe lazy client for backward compatibility

import { createClient } from '@supabase/supabase-js'

// Get env vars
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// Only throw if called, not at module load
let cachedClient: ReturnType<typeof createClient> | null = null

function getClient() {
  if (cachedClient) return cachedClient

  if (!supabaseUrl) {
    const msg = 
      '[CLIENT ERROR] NEXT_PUBLIC_SUPABASE_URL is not set.\n' +
      'Fix: Check .env.local has NEXT_PUBLIC_SUPABASE_URL=...'
    console.error(msg)
    throw new Error(msg)
  }

  if (!supabaseAnonKey) {
    const msg = 
      '[CLIENT ERROR] NEXT_PUBLIC_SUPABASE_ANON_KEY is not set.\n' +
      'Fix: Check .env.local has NEXT_PUBLIC_SUPABASE_ANON_KEY=...'
    console.error(msg)
    throw new Error(msg)
  }

  cachedClient = createClient(supabaseUrl, supabaseAnonKey)
  return cachedClient
}

// Lazy export - only throws when actually used, not at import
export const supabase = new Proxy({} as any, {
  get: (_target, prop) => {
    const client = getClient()
    return (client as any)[prop]
  }
})
