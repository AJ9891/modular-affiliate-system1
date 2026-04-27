import { NextRequest, NextResponse } from 'next/server'
import { emailService } from '@/lib/email/service'
import { createSubdomainRouteHandlerClient } from '@/lib/subdomain-auth'
import { resolveEmailErrorStatus } from '@/lib/email/route-utils'

/**
 * Email Reports API Endpoint
 * POST /api/email/reports - Send report for a funnel and date range
 * GET /api/email/reports?campaignId=... - Get campaign stats
 */
function isRecoverableDbError(issue: unknown): boolean {
  if (!issue || typeof issue !== 'object') return false
  const candidate = issue as { code?: string; message?: string }
  const code = candidate.code || ''
  const message = (candidate.message || '').toLowerCase()
  return (
    code === '42P01' ||
    code === 'PGRST205' ||
    code === '42703' ||
    code === 'PGRST200' ||
    message.includes('relation') ||
    message.includes('schema cache') ||
    message.includes('column')
  )
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createSubdomainRouteHandlerClient(request)
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ success: false, error: 'Authentication required' }, { status: 401 })
    }

    const { recipientEmail, funnelId, dateRange } = await request.json()

    if (!recipientEmail || typeof recipientEmail !== 'string' || !recipientEmail.includes('@')) {
      return NextResponse.json(
        { success: false, error: 'Valid recipientEmail is required' },
        { status: 400 }
      )
    }

    if (!funnelId || typeof funnelId !== 'string') {
      return NextResponse.json(
        { success: false, error: 'funnelId is required' },
        { status: 400 }
      )
    }

    if (!dateRange?.start || !dateRange?.end) {
      return NextResponse.json(
        { success: false, error: 'dateRange.start and dateRange.end are required' },
        { status: 400 }
      )
    }

    // Get funnel analytics from database
    const startDate = new Date(dateRange.start)
    const endDate = new Date(dateRange.end)
    if (Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime())) {
      return NextResponse.json(
        { success: false, error: 'Invalid dateRange values' },
        { status: 400 }
      )
    }
    if (endDate < startDate) {
      return NextResponse.json(
        { success: false, error: 'dateRange.end must be on or after dateRange.start' },
        { status: 400 }
      )
    }
    const startIso = startDate.toISOString()
    const endIso = endDate.toISOString()

    // Resolve user-owned funnel scope. Supports "all" for aggregate reporting.
    let targetFunnelIds: string[] = []
    if (funnelId === 'all') {
      const { data: funnels, error: funnelsError } = await supabase
        .from('funnels')
        .select('funnel_id')
        .eq('user_id', user.id)

      if (funnelsError) throw funnelsError
      targetFunnelIds = (funnels || [])
        .map((funnel) => funnel.funnel_id)
        .filter((id): id is string => typeof id === 'string')
    } else {
      const { data: ownedFunnel, error: funnelError } = await supabase
        .from('funnels')
        .select('funnel_id')
        .eq('funnel_id', funnelId)
        .eq('user_id', user.id)
        .maybeSingle()

      if (funnelError) throw funnelError
      if (!ownedFunnel?.funnel_id) {
        return NextResponse.json(
          { success: false, error: 'Funnel not found or inaccessible' },
          { status: 404 }
        )
      }

      targetFunnelIds = [ownedFunnel.funnel_id]
    }

    if (targetFunnelIds.length === 0) {
      const emptyStats = {
        views: 0,
        clicks: 0,
        conversions: 0,
        revenue: 0,
        clickRate: 0,
        conversionRate: 0,
      }

      const result = await emailService.sendAnalyticsReport({
        recipientEmail,
        funnelId,
        stats: emptyStats,
        dateRange: { start: startDate, end: endDate },
      })

      return NextResponse.json({
        success: true,
        messageId: result.id,
        stats: emptyStats,
        message: 'Report sent successfully',
      })
    }

    // Clicks for this funnel in requested window.
    const { count: clickCount, error: clicksError } = await supabase
      .from('clicks')
      .select('click_id', { count: 'exact', head: true })
      .in('funnel_id', targetFunnelIds)
      .gte('clicked_at', startIso)
      .lte('clicked_at', endIso)

    if (clicksError) throw clicksError

    // Conversions tied to clicks from this funnel.
    const { data: conversions, error: conversionsError } = await supabase
      .from('conversions')
      .select('amount, clicks!inner(funnel_id)')
      .in('clicks.funnel_id', targetFunnelIds)
      .gte('converted_at', startIso)
      .lte('converted_at', endIso)

    if (conversionsError) throw conversionsError

    // Prefer analytics_events for views/clicks. Fall back to click count if events table is unavailable.
    let viewsCount: number | null = null
    let eventClickCount: number | null = null

    const { count: pageViewCount, error: pageViewError } = await supabase
      .from('analytics_events')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .in('funnel_id', targetFunnelIds)
      .eq('event_type', 'page_view')
      .gte('occurred_at', startIso)
      .lte('occurred_at', endIso)

    if (pageViewError && !isRecoverableDbError(pageViewError)) throw pageViewError
    if (!pageViewError) {
      viewsCount = pageViewCount || 0
    }

    const { count: ctaClickCount, error: ctaClickError } = await supabase
      .from('analytics_events')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .in('funnel_id', targetFunnelIds)
      .eq('event_type', 'cta_click')
      .gte('occurred_at', startIso)
      .lte('occurred_at', endIso)

    if (ctaClickError && !isRecoverableDbError(ctaClickError)) throw ctaClickError
    if (!ctaClickError) {
      eventClickCount = ctaClickCount || 0
    }

    const resolvedClicks = eventClickCount ?? clickCount ?? 0
    const views = viewsCount ?? clickCount ?? 0
    const conversionCount = conversions?.length || 0
    const revenue =
      conversions?.reduce((sum: number, conversion: any) => {
        const amount = Number(conversion?.amount || 0)
        return sum + (Number.isFinite(amount) ? amount : 0)
      }, 0) || 0

    const stats = {
      views,
      clicks: resolvedClicks,
      conversions: conversionCount,
      revenue,
      clickRate: views > 0 ? resolvedClicks / views : 0,
      conversionRate: resolvedClicks > 0 ? conversionCount / resolvedClicks : 0,
    }

    // Send report
    const result = await emailService.sendAnalyticsReport({
      recipientEmail,
      funnelId,
      stats,
      dateRange: { start: startDate, end: endDate },
    })

    return NextResponse.json({ 
      success: true, 
      messageId: result.id,
      stats,
      message: 'Weekly report sent successfully' 
    })
  } catch (err) {
    console.error('Send report error:', err)
    const message = err instanceof Error ? err.message : 'Failed to send report'
    const status = resolveEmailErrorStatus(message)
    return NextResponse.json(
      { 
        success: false, 
        error: message
      },
      { status }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url)
    const campaignId = url.searchParams.get('campaignId')

    if (!campaignId) {
      return NextResponse.json(
        { success: false, error: 'Campaign ID required' },
        { status: 400 }
      )
    }

    const stats = await emailService.getCampaignStats(campaignId)
    
    return NextResponse.json({ success: true, stats })
  } catch (error) {
    console.error('Get campaign stats error:', error)
    const message = error instanceof Error ? error.message : 'Failed to get stats'
    const status = resolveEmailErrorStatus(message)
    return NextResponse.json(
      { 
        success: false, 
        error: message
      },
      { status }
    )
  }
}
