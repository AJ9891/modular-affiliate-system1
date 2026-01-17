import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { checkSupabase } from '@/lib/check-supabase'

export async function POST(request: NextRequest) {
  const check = checkSupabase()
  if (check) return check
  
  try {
    const supabase = createRouteHandlerClient({ cookies })
    
    const body = await request.json()
    const { offer_id, funnel_id, utm_source, utm_medium, utm_campaign } = body

    // Generate unique click ID
    const click_id = crypto.randomUUID()

    // Store click data
    const { data, error } = await supabase!
      .from('clicks')
      .insert({
        click_id,
        offer_id,
        funnel_id,
        utm_source,
        utm_medium,
        utm_campaign,
        clicked_at: new Date().toISOString(),
      })
      .select()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    // Set 30-day attribution cookie
    const response = NextResponse.json({ 
      click_id,
      tracked: true 
    }, { status: 200 })

    const cookieStore = cookies()
    response.cookies.set('aff_click_id', click_id, {
      maxAge: 30 * 24 * 60 * 60, // 30 days
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
    })

    return response
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
