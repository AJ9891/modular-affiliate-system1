import { NextRequest, NextResponse } from 'next/server'
import { logError } from '@/lib/logging'
import { checkSupabase } from '@/lib/check-supabase'
import { createServiceRoleClient, createServerRouteClient } from '@/lib/supabase-server'

const SESSION_COOKIE = 'lp_session_id'

type TelemetryPayload = {
  event?: string
  props?: {
    path?: string
    referrer?: string
    [key: string]: unknown
  }
  ts?: number
}

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

function parseSlug(path: string | undefined, prefix: '/f/' | '/p/') {
  if (!path || !path.startsWith(prefix)) return null
  const raw = path.slice(prefix.length)
  const slug = raw.split(/[/?#]/)[0]?.trim()
  return slug || null
}

export async function POST(req: NextRequest) {
  const check = checkSupabase()
  if (check) return check

  try {
    const payload = (await req.json().catch(() => ({}))) as TelemetryPayload
    const event = (payload.event || '').toLowerCase()
    const props = payload.props || {}
    const path = typeof props.path === 'string' ? props.path : undefined
    const referrer = typeof props.referrer === 'string' ? props.referrer : undefined

    let eventType: 'page_view' | 'cta_click' | null = null
    if (event === 'page_view') eventType = 'page_view'
    if (event === 'cta_click') eventType = 'cta_click'

    const response = NextResponse.json({ ok: true })
    if (!eventType) return response

    let sessionId = req.cookies.get(SESSION_COOKIE)?.value || null
    if (!sessionId) {
      sessionId = crypto.randomUUID()
      response.cookies.set(SESSION_COOKIE, sessionId, {
        maxAge: 7 * 24 * 60 * 60,
        httpOnly: true,
        sameSite: 'lax',
        secure: process.env.NODE_ENV === 'production',
      })
    }

    const routeClient = await createServerRouteClient()
    const { data: { user } } = await routeClient.auth.getUser()
    const reader = process.env.SUPABASE_SERVICE_ROLE_KEY ? createServiceRoleClient() : routeClient

    let userId: string | null = user?.id || null
    let funnelId: string | null = null
    let pageId: string | null = null

    const funnelSlug = parseSlug(path, '/f/')
    if (funnelSlug) {
      const { data: funnel } = await reader
        .from('funnels')
        .select('funnel_id,user_id')
        .eq('slug', funnelSlug)
        .maybeSingle()
      if (funnel) {
        funnelId = funnel.funnel_id || null
        userId = funnel.user_id || userId
      }
    }

    const pageSlug = parseSlug(path, '/p/')
    if (!funnelId && pageSlug) {
      const primary = await reader
        .from('pages')
        .select('id,funnel_id,funnels!inner(user_id)')
        .eq('slug', pageSlug)
        .maybeSingle()

      if (!primary.error && primary.data) {
        const row = primary.data as unknown as { id?: string; funnel_id?: string; funnels?: { user_id?: string } }
        pageId = row.id || null
        funnelId = row.funnel_id || null
        userId = row.funnels?.user_id || userId
      } else if (isRecoverableDbError(primary.error)) {
        const fallback = await reader
          .from('funnel_pages')
          .select('id,funnel_id,funnels!inner(user_id)')
          .eq('slug', pageSlug)
          .maybeSingle()

        if (!fallback.error && fallback.data) {
          const row = fallback.data as unknown as { id?: string; funnel_id?: string; funnels?: { user_id?: string } }
          pageId = row.id || null
          funnelId = row.funnel_id || null
          userId = row.funnels?.user_id || userId
        }
      }
    }

    const { error } = await reader
      .from('analytics_events')
      .insert({
        user_id: userId,
        funnel_id: funnelId,
        page_id: pageId,
        session_id: sessionId,
        event_type: eventType,
        path: path || null,
        referrer: referrer || null,
        metadata: props,
        occurred_at: new Date(payload.ts || Date.now()).toISOString(),
      })

    if (error && !isRecoverableDbError(error)) {
      throw error
    }

    return response
  } catch (error) {
    logError(error, { endpoint: 'telemetry' })
    return NextResponse.json({ ok: false, error: 'telemetry_error' }, { status: 500 })
  }
}
