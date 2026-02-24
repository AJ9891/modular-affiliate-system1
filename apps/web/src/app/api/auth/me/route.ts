import { NextRequest, NextResponse } from 'next/server'
import { checkSupabase } from '@/lib/check-supabase'
import { createSubdomainRouteHandlerClient } from '@/lib/subdomain-auth'

export async function GET(request: NextRequest) {
  const check = checkSupabase()
  if (check) return check
  
  const supabase = await createSubdomainRouteHandlerClient(request)
  
  try {
    const { data: { user }, error } = await supabase.auth.getUser()

    if (user) {
      return NextResponse.json({ user }, { status: 200 })
    }

    // Fallback for legacy routes that store/access a direct access token cookie.
    const bearerHeader = request.headers.get('authorization')
    const bearerToken = bearerHeader?.startsWith('Bearer ')
      ? bearerHeader.slice(7)
      : null
    const cookieToken = request.cookies.get('sb-access-token')?.value
    const accessToken = bearerToken || cookieToken

    if (accessToken) {
      const { data, error: tokenError } = await supabase.auth.getUser(accessToken)
      if (!tokenError && data.user) {
        return NextResponse.json({ user: data.user }, { status: 200 })
      }
    }

    if (error) {
      console.error('Auth /me error:', error.message)
    }

    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
  } catch (error) {
    console.error('Auth /me unexpected error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
