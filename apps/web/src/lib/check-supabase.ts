import { NextResponse } from 'next/server'
import { supabase } from './supabase'

export function checkSupabase() {
  if (!supabase) {
    return NextResponse.json(
      { error: 'Database not configured. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY environment variables.' },
      { status: 503 }
    )
  }
  return null
}
