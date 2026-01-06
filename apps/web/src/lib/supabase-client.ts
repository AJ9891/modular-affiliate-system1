// SEALED CLIENT BOUNDARY
// ✅ This file is ONLY imported in client components ('use client')
// ❌ Server routes NEVER import this - use supabase-server.ts instead

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// Fail fast: throw BEFORE React tries to render
if (!supabaseUrl) {
  throw new Error(
    '[CLIENT INIT FAILED] NEXT_PUBLIC_SUPABASE_URL not set.\n' +
    'Check: .env.local exists and has NEXT_PUBLIC_SUPABASE_URL=...\n' +
    'This is NOT a browser/server issue - your config is missing.'
  )
}

if (!supabaseAnonKey) {
  throw new Error(
    '[CLIENT INIT FAILED] NEXT_PUBLIC_SUPABASE_ANON_KEY not set.\n' +
    'Check: .env.local exists and has NEXT_PUBLIC_SUPABASE_ANON_KEY=...\n' +
    'This is NOT a browser/server issue - your config is missing.'
  )
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
