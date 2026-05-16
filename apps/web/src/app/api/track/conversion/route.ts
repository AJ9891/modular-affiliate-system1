import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import {
  appendAttributionAuditEvent,
  ATTRIBUTION_CLICK_COOKIE,
  ATTRIBUTION_SESSION_COOKIE,
} from '@/lib/attribution-audit'

export async function POST(request: NextRequest) {
  const cookieStore = await cookies()
  const cookieAdapter = (() => cookieStore) as unknown as () => ReturnType<typeof cookies>
  const supabase = createRouteHandlerClient({ cookies: cookieAdapter })
  
  try {
    if (!supabase) {
      return NextResponse.json(
        { error: 'Database not configured' },
        { status: 503 }
      )
    }

    const body = await request.json()
    const { offer_id, amount, order_id } = body

    // Get click ID from cookie for attribution
    const click_id = cookieStore.get(ATTRIBUTION_CLICK_COOKIE)?.value
    const attributionSessionId = cookieStore.get(ATTRIBUTION_SESSION_COOKIE)?.value || null

    const { data, error } = await supabase
      .from('conversions')
      .insert({
        conversion_id: crypto.randomUUID(),
        click_id: click_id || null,
        offer_id,
        amount,
        order_id,
        converted_at: new Date().toISOString(),
      })
      .select()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    const conversion = data[0]
    await appendAttributionAuditEvent({
      eventType: 'conversion_tracked',
      clickId: click_id || null,
      conversionId: conversion?.conversion_id || null,
      attributionSessionId,
      offerId: offer_id || null,
      amount: typeof amount === 'number' ? amount : null,
      currency: 'usd',
      source: 'api.track.conversion',
      metadata: {
        order_id: order_id || null,
      },
    })

    return NextResponse.json({
      conversion,
      tracked: true
    }, { status: 201 })
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
