import { NextResponse } from 'next/server'

export function checkSupabase() {
  const publicKey =
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !publicKey) {
    return NextResponse.json(
      {
        error:
          'Database not configured. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY (or NEXT_PUBLIC_SUPABASE_ANON_KEY).',
      },
      { status: 503 }
    )
  }
  return null
}
