import { NextRequest, NextResponse } from 'next/server'
import { checkSupabase } from '@/lib/check-supabase'
import { createSubdomainRouteHandlerClientWithResponse } from '@/lib/subdomain-auth'

export async function GET(request: NextRequest) {
  const check = checkSupabase()
  if (check) return check
  
  const { supabase, applyCookies } = createSubdomainRouteHandlerClientWithResponse(request)
  
  try {
    const { data: { user }, error } = await supabase.auth.getUser()

    if (user) {
      return applyCookies(NextResponse.json({ user }, { status: 200 }))
    }

    if (error) {
      console.error('Auth /me error:', error.message)
    }

    return applyCookies(NextResponse.json({ error: 'Not authenticated' }, { status: 401 }))
  } catch (error) {
    console.error('Auth /me unexpected error:', error)
    return applyCookies(NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    ))
  }
}
