import { NextRequest, NextResponse } from 'next/server'
import { checkSupabase } from '@/lib/check-supabase'
import { createSubdomainRouteHandlerClientWithResponse } from '@/lib/subdomain-auth'

export const dynamic = 'force-dynamic'
export const revalidate = 0

function withNoStore(response: NextResponse) {
  response.headers.set('Cache-Control', 'private, no-store, max-age=0, must-revalidate')
  response.headers.set('Pragma', 'no-cache')
  response.headers.set('Expires', '0')
  return response
}

export async function GET(request: NextRequest) {
  const check = checkSupabase()
  if (check) return withNoStore(check)
  
  const { supabase, applyCookies } = createSubdomainRouteHandlerClientWithResponse(request)
  
  try {
    const { data: { user }, error } = await supabase.auth.getUser()

    if (user) {
      return applyCookies(withNoStore(NextResponse.json({ user }, { status: 200 })))
    }

    if (error) {
      console.error('Auth /me error:', error.message)
    }

    return applyCookies(withNoStore(NextResponse.json({ error: 'Not authenticated' }, { status: 401 })))
  } catch (error) {
    console.error('Auth /me unexpected error:', error)
    return applyCookies(withNoStore(NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )))
  }
}
