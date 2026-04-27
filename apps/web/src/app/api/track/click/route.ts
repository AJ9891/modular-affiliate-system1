import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClientCompat } from '@/lib/subdomain-auth'
import { checkSupabase } from '@/lib/check-supabase'

function isRecoverableDbError(issue: unknown): boolean {
  if (!issue || typeof issue !== 'object') return false
  const candidate = issue as { code?: string; message?: string }
  const code = candidate.code || ''
  const message = (candidate.message || '').toLowerCase()
  return (
    code === '42P01' ||
    code === 'PGRST205' ||
    code === '42703' ||
    message.includes('could not find the table') ||
    message.includes('schema cache') ||
    message.includes('column')
  )
}

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

    const pagePath = typeof body?.path === 'string' ? body.path : null
    const sessionId = request.cookies.get('lp_session_id')?.value || null
    const { error: analyticsError } = await supabase
      .from('analytics_events')
      .insert({
        user_id: ownerUserId,
        funnel_id,
        session_id: sessionId,
        event_type: 'cta_click',
        path: pagePath,
        metadata: {
          offer_id,
          utm_source: utm_source || null,
          utm_medium: utm_medium || null,
          utm_campaign: utm_campaign || null,
          generation_id: generation_id || null,
          variant_id: variant_id || null,
          click_id,
        },
        occurred_at: new Date().toISOString(),
      })

    if (analyticsError && !isRecoverableDbError(analyticsError)) {
      console.warn('Failed to log analytics event for click:', analyticsError)
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
