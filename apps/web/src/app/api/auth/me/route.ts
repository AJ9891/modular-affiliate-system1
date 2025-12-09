import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { checkSupabase } from '@/lib/check-supabase'

export async function GET(request: NextRequest) {
  const check = checkSupabase()
  if (check) return check
  
  try {
    // Try to get the access token from cookies
    const accessToken = request.cookies.get('sb-access-token')?.value
    
    if (!accessToken) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    // Set the session for this request
    const { data: { user }, error } = await supabase!.auth.getUser(accessToken)

    if (error || !user) {
      return NextResponse.json({ error: 'Invalid session' }, { status: 401 })
    }

    return NextResponse.json({ user }, { status: 200 })
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
