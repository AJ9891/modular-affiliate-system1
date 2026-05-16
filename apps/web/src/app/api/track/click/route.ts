import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { checkSupabase } from '@/lib/check-supabase'
import {
  appendAttributionAuditEvent,
  ATTRIBUTION_CLICK_COOKIE,
  ATTRIBUTION_COOKIE_MAX_AGE,
  ATTRIBUTION_SESSION_COOKIE,
} from '@/lib/attribution-audit'

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
    const { data: _data, error } = await supabase!
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

    const existingSessionId = request.cookies.get(ATTRIBUTION_SESSION_COOKIE)?.value
    const attributionSessionId = existingSessionId || crypto.randomUUID()
    const isNewSession = !existingSessionId

    response.cookies.set(ATTRIBUTION_CLICK_COOKIE, click_id, {
      maxAge: ATTRIBUTION_COOKIE_MAX_AGE,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
    })

    response.cookies.set(ATTRIBUTION_SESSION_COOKIE, attributionSessionId, {
      maxAge: ATTRIBUTION_COOKIE_MAX_AGE,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
    })

    if (isNewSession) {
      await appendAttributionAuditEvent({
        eventType: 'session_started',
        clickId: click_id,
        attributionSessionId,
        offerId: offer_id || null,
        funnelId: funnel_id || null,
        source: 'api.track.click',
        metadata: {
          utm_source: utm_source || null,
          utm_medium: utm_medium || null,
          utm_campaign: utm_campaign || null,
        },
      })
    }

    await appendAttributionAuditEvent({
      eventType: 'click_tracked',
      clickId: click_id,
      attributionSessionId,
      offerId: offer_id || null,
      funnelId: funnel_id || null,
      source: 'api.track.click',
      metadata: {
        utm_source: utm_source || null,
        utm_medium: utm_medium || null,
        utm_campaign: utm_campaign || null,
      },
    })

    return response
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
