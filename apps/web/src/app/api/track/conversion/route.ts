import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import {
  appendAttributionAuditEvent,
  ATTRIBUTION_CLICK_COOKIE,
  ATTRIBUTION_SESSION_COOKIE,
} from '@/lib/attribution-audit'

interface ConversionPayload {
  offer_id?: string | null
  amount?: number | null
  order_id?: string | null
  funnel_id?: string | null
  generation_id?: string | null
  variant_id?: string | null
}

const TRANSPARENT_GIF = Uint8Array.from([
  71, 73, 70, 56, 57, 97, 1, 0, 1, 0, 128, 0, 0, 255, 255, 255, 0, 0, 0, 33,
  249, 4, 1, 0, 0, 0, 0, 44, 0, 0, 0, 0, 1, 0, 1, 0, 0, 2, 2, 68, 1, 0, 59,
])

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

function pixelResponse(): NextResponse {
  return new NextResponse(TRANSPARENT_GIF, {
    status: 200,
    headers: {
      'Content-Type': 'image/gif',
      'Cache-Control': 'no-store, max-age=0',
    },
  })
}

async function recordConversion(
  supabase: ReturnType<typeof createRouteHandlerClient>,
  cookieStore: Awaited<ReturnType<typeof cookies>>,
  payload: ConversionPayload
) {
  const { offer_id, amount, order_id, funnel_id, generation_id, variant_id } = payload

  // Get click ID from cookie for attribution
  const click_id = cookieStore.get(ATTRIBUTION_CLICK_COOKIE)?.value
  const attributionSessionId = cookieStore.get(ATTRIBUTION_SESSION_COOKIE)?.value || null

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

  const ownerFunnelId: string | null = typeof funnel_id === 'string' ? funnel_id : null
  const ownerGenerationId: string | null = typeof generation_id === 'string' ? generation_id : null
  const ownerVariantId: string | null = typeof variant_id === 'string' ? variant_id : null
  const conversionAmount = typeof amount === 'number' && Number.isFinite(amount) ? amount : null

  const { data, error } = await supabase
    .from('conversions')
    .insert({
      conversion_id: crypto.randomUUID(),
      user_id: ownerUserId,
      click_id: click_id || null,
      offer_id,
      funnel_id: ownerFunnelId,
      generation_id: ownerGenerationId,
      variant_id: ownerVariantId,
      amount: conversionAmount,
      order_id,
      converted_at: new Date().toISOString(),
    })
    .select()

  if (error) {
    throw error
  }

  const conversion = data[0]
  await appendAttributionAuditEvent({
    eventType: 'conversion_tracked',
    clickId: click_id || null,
    conversionId: conversion?.conversion_id || null,
    attributionSessionId,
    offerId: offer_id || null,
    amount: conversionAmount,
    currency: 'usd',
    source: 'api.track.conversion',
    metadata: {
      order_id: order_id || null,
    },
  })

  return conversion
}

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
    const conversion = await recordConversion(supabase, cookieStore, body)

    return NextResponse.json({
      conversion,
      tracked: true
    }, { status: 201 })
  } catch (error) {
    if (!isRecoverableDbError(error)) {
      console.error('Conversion tracking error:', error)
    }
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: isRecoverableDbError(error) ? 400 : 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  const cookieStore = await cookies()
  const cookieAdapter = (() => cookieStore) as unknown as () => ReturnType<typeof cookies>
  const supabase = createRouteHandlerClient({ cookies: cookieAdapter })

  try {
    if (!supabase) {
      return pixelResponse()
    }

    const params = request.nextUrl.searchParams
    const amountParam = params.get('amount')
    await recordConversion(supabase, cookieStore, {
      offer_id: params.get('offer_id'),
      amount: amountParam ? Number(amountParam) : null,
      order_id: params.get('order_id'),
      funnel_id: params.get('funnel_id'),
      generation_id: params.get('generation_id'),
      variant_id: params.get('variant_id'),
    })
  } catch (error) {
    if (!isRecoverableDbError(error)) {
      console.error('Conversion pixel tracking error:', error)
    }
  }

  return pixelResponse()
}
