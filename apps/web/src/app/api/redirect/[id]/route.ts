import { NextRequest, NextResponse } from 'next/server'
import { createServerRouteClient } from '@/lib/supabase-server'
import { checkSupabase } from '@/lib/check-supabase'
import {
  appendAttributionAuditEvent,
  ATTRIBUTION_CLICK_COOKIE,
  ATTRIBUTION_COOKIE_MAX_AGE,
  ATTRIBUTION_SESSION_COOKIE,
} from '@/lib/attribution-audit'

/**
 * Redirect handler for affiliate links
 * Tracks click and redirects to offer URL
 */
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const check = checkSupabase()
  if (check) return check

  try {
    const supabase = await createServerRouteClient()
    const { id: offerId } = await context.params
    const searchParams = request.nextUrl.searchParams
    
    // Extract tracking parameters
    const funnelId = searchParams.get('aff_funnel')
    const utmSource = searchParams.get('utm_source')
    const utmMedium = searchParams.get('utm_medium')
    const utmCampaign = searchParams.get('utm_campaign')

    // Get offer details
    const { data: offer, error: offerError } = await supabase!
      .from('offers')
      .select('*')
      .eq('id', offerId)
      .single()

    if (offerError || !offer) {
      return NextResponse.json(
        { error: 'Offer not found' },
        { status: 404 }
      )
    }

    // Generate unique click ID
    const clickId = crypto.randomUUID()

    // Track the click
    const { error: clickError } = await supabase!
      .from('clicks')
      .insert({
        click_id: clickId,
        offer_id: offerId,
        funnel_id: funnelId,
        utm_source: utmSource,
        utm_medium: utmMedium,
        utm_campaign: utmCampaign,
        clicked_at: new Date().toISOString(),
      })

    if (clickError) {
      console.error('Failed to track click:', clickError)
    }

    // Build redirect URL with affiliate parameters
    const redirectUrl = new URL(offer.affiliate_link)
    
    // Preserve UTM parameters in redirect
    if (utmSource) redirectUrl.searchParams.set('utm_source', utmSource)
    if (utmMedium) redirectUrl.searchParams.set('utm_medium', utmMedium)
    if (utmCampaign) redirectUrl.searchParams.set('utm_campaign', utmCampaign)

    // Create redirect response with attribution cookie
    const response = NextResponse.redirect(redirectUrl.toString())

    const existingSessionId = request.cookies.get(ATTRIBUTION_SESSION_COOKIE)?.value
    const attributionSessionId = existingSessionId || crypto.randomUUID()
    const isNewSession = !existingSessionId

    response.cookies.set(ATTRIBUTION_CLICK_COOKIE, clickId, {
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
        clickId: clickId,
        attributionSessionId,
        offerId,
        funnelId: funnelId || null,
        source: 'api.redirect',
        metadata: {
          utm_source: utmSource || null,
          utm_medium: utmMedium || null,
          utm_campaign: utmCampaign || null,
        },
      })
    }

    if (!clickError) {
      await appendAttributionAuditEvent({
        eventType: 'click_tracked',
        clickId,
        attributionSessionId,
        offerId,
        funnelId: funnelId || null,
        source: 'api.redirect',
        metadata: {
          utm_source: utmSource || null,
          utm_medium: utmMedium || null,
          utm_campaign: utmCampaign || null,
        },
      })
    }

    return response
  } catch (error) {
    console.error('Redirect error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
