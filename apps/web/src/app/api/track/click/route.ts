import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClientCompat } from '@/lib/subdomain-auth'
import { checkSupabase } from '@/lib/check-supabase'

export async function POST(request: NextRequest) {
  const check = checkSupabase()
  if (check) return check
  
  try {
    const supabase = await createRouteHandlerClientCompat()

    const body = await request.json()
    const { offer_id, funnel_id, utm_source, utm_medium, utm_campaign, generation_id, variant_id } = body

    const {
      data: { user: sessionUser },
    } = await supabase.auth.getUser()

    let ownerUserId: string | null = sessionUser?.id || null
    if (!ownerUserId && funnel_id) {
      const { data: funnelOwner } = await supabase
        .from('funnels')
        .select('user_id')
        .eq('funnel_id', funnel_id)
        .maybeSingle()
      ownerUserId = funnelOwner?.user_id || null
    }

    // Generate unique click ID
    const click_id = crypto.randomUUID()
    const forwarded = request.headers.get('x-forwarded-for')
    const ipAddress = forwarded ? forwarded.split(',')[0]?.trim() : request.headers.get('x-real-ip')

    // Store click data
    const { data: _data, error } = await supabase!
      .from('clicks')
      .insert({
        click_id,
        user_id: ownerUserId,
        offer_id,
        funnel_id,
        generation_id: generation_id || null,
        variant_id: variant_id || null,
        utm_source,
        utm_medium,
        utm_campaign,
        user_agent: request.headers.get('user-agent') || null,
        ip_address: ipAddress || null,
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
