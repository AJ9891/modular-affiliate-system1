import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createServerRouteClient } from '@/lib/supabase-server'
import {
  appendAttributionAuditEvent,
  ATTRIBUTION_CLICK_COOKIE,
  ATTRIBUTION_SESSION_COOKIE,
} from '@/lib/attribution-audit'

const conversionPayloadSchema = z.object({
  offer_id: z.string().uuid(),
  amount: z.coerce.number().finite().nonnegative(),
  order_id: z.string().trim().min(1).max(120),
})

async function parsePayload(request: NextRequest) {
  const method = request.method.toUpperCase()
  if (method === 'GET') {
    return conversionPayloadSchema.safeParse({
      offer_id: request.nextUrl.searchParams.get('offer_id'),
      amount: request.nextUrl.searchParams.get('amount'),
      order_id: request.nextUrl.searchParams.get('order_id'),
    })
  }

  const body = await request.json().catch(() => null)
  return conversionPayloadSchema.safeParse(body)
}

async function trackConversion(request: NextRequest) {
  const parsed = await parsePayload(request)
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Invalid conversion payload', issues: parsed.error.flatten() },
      { status: 400 },
    )
  }

  try {
    const supabase = await createServerRouteClient()
    const { offer_id, amount, order_id } = parsed.data
    const conversionId = crypto.randomUUID()
    const click_id = request.cookies.get(ATTRIBUTION_CLICK_COOKIE)?.value
    const attributionSessionId = request.cookies.get(ATTRIBUTION_SESSION_COOKIE)?.value || null

    const { error } = await supabase
      .from('conversions')
      .insert({
        conversion_id: conversionId,
        click_id: click_id || null,
        offer_id,
        amount,
        order_id,
        converted_at: new Date().toISOString(),
      })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    await appendAttributionAuditEvent({
      eventType: 'conversion_tracked',
      clickId: click_id || null,
      conversionId,
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
      conversion: { conversion_id: conversionId, offer_id, amount, order_id },
      tracked: true
    }, { status: 201 })
  } catch {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  return trackConversion(request)
}

export async function GET(request: NextRequest) {
  return trackConversion(request)
}
