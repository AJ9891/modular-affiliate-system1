import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import {
  ATTRIBUTION_CLICK_COOKIE,
  ATTRIBUTION_SESSION_COOKIE,
} from '@/lib/attribution-audit'

interface PublicConversionPayload {
  funnel_id?: string | null
  path?: string | null
}

const TRANSPARENT_GIF = Uint8Array.from([
  71, 73, 70, 56, 57, 97, 1, 0, 1, 0, 128, 0, 0, 255, 255, 255, 0, 0, 0, 33,
  249, 4, 1, 0, 0, 0, 0, 44, 0, 0, 0, 0, 1, 0, 1, 0, 0, 2, 2, 68, 1, 0, 59,
])

const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

function pixelResponse(): NextResponse {
  return new NextResponse(TRANSPARENT_GIF, {
    status: 200,
    headers: {
      'Content-Type': 'image/gif',
      'Cache-Control': 'no-store, max-age=0',
    },
  })
}

async function recordPublicConversionEvent(
  supabase: ReturnType<typeof createRouteHandlerClient>,
  cookieStore: Awaited<ReturnType<typeof cookies>>,
  payload: PublicConversionPayload
): Promise<string | null> {
  if (!payload.funnel_id || !uuidPattern.test(payload.funnel_id)) {
    throw new Error('A valid funnel_id is required')
  }

  const rawClickId = cookieStore.get(ATTRIBUTION_CLICK_COOKIE)?.value
  const clickId = rawClickId && uuidPattern.test(rawClickId) ? rawClickId : null
  const sessionId = cookieStore.get(ATTRIBUTION_SESSION_COOKIE)?.value || null

  const { data, error } = await supabase.rpc('record_public_conversion_event', {
    p_funnel_id: payload.funnel_id,
    p_click_id: clickId,
    p_session_id: sessionId,
    p_path: payload.path || null,
  })

  if (error) {
    throw error
  }

  return typeof data === 'string' ? data : null
}

export async function POST(request: NextRequest) {
  const cookieStore = await cookies()
  const cookieAdapter = (() => cookieStore) as unknown as () => ReturnType<typeof cookies>
  const supabase = createRouteHandlerClient({ cookies: cookieAdapter })

  try {
    const body = await request.json() as PublicConversionPayload
    const eventId = await recordPublicConversionEvent(supabase, cookieStore, body)

    if (!eventId) {
      return NextResponse.json({ error: 'Published funnel or attribution not found' }, { status: 404 })
    }

    return NextResponse.json({ eventId, tracked: true, revenueVerified: false }, { status: 201 })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: error instanceof Error && error.message.includes('valid funnel_id') ? 400 : 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  const cookieStore = await cookies()
  const cookieAdapter = (() => cookieStore) as unknown as () => ReturnType<typeof cookies>
  const supabase = createRouteHandlerClient({ cookies: cookieAdapter })
  const params = request.nextUrl.searchParams

  try {
    await recordPublicConversionEvent(supabase, cookieStore, {
      funnel_id: params.get('funnel_id'),
      path: params.get('path'),
    })
  } catch {
    // Tracking pixels must not break the page rendering the image.
  }

  return pixelResponse()
}
