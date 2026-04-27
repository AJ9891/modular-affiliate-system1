import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import { createServiceRoleClient } from '@/lib/supabase-server'
import {
  buildABTestSuggestions,
  buildForecasts,
  buildOptimizationIdeas,
  buildPlainEnglishInsights,
  buildWeeklySummary,
  type FunnelForecastSeed,
} from './enhancements'
import type {
  FunnelDropoffPoint,
  FunnelPerformanceScore,
  GrowthAlert,
  GrowthAssistantOptions,
  GrowthAssistantResult,
  GrowthInsight,
  GrowthRange,
  GrowthRecommendation,
  PagePerformanceDiagnostic,
  Severity,
} from './types'

type FunnelRow = {
  funnel_id: string
  name: string
  slug?: string | null
}

type PageRow = {
  id?: string | null
  funnel_id?: string | null
  slug?: string | null
  name?: string | null
  order_index?: number | null
}

type ClickRow = {
  click_id?: string | null
  funnel_id?: string | null
  clicked_at?: string | null
}

type ConversionRow = {
  conversion_id?: string | null
  click_id?: string | null
  amount?: number | null
  converted_at?: string | null
}

type LeadRow = {
  id?: string | null
  funnel_id?: string | null
  created_at?: string | null
}

type AnalyticsEventRow = {
  event_id?: string | null
  user_id?: string | null
  funnel_id?: string | null
  page_id?: string | null
  session_id?: string | null
  event_type?: string | null
  path?: string | null
  metadata?: Record<string, unknown> | null
  occurred_at?: string | null
}

type PageMetricAccumulator = {
  pageKey: string
  pageId: string | null
  pageSlug: string | null
  pageName: string
  views: number
  leadSubmits: number
  ctaClicks: number
  sessions: Set<string>
}

type FunnelBucket = {
  funnelId: string
  funnelName: string
  current: {
    clicks: number
    conversions: number
    leads: number
    revenue: number
    views: number
    ctaClicks: number
    leadSubmits: number
    sessions: Set<string>
    sessionViewCounts: Map<string, number>
    sessionPages: Map<string, Set<string>>
  }
  previous: {
    clicks: number
    conversions: number
    leads: number
    revenue: number
    views: number
    ctaClicks: number
    leadSubmits: number
  }
  pageMetrics: Map<string, PageMetricAccumulator>
}

type RangeWindow = {
  start: Date
  end: Date
  previousStart: Date
  previousEnd: Date
}

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value))
}

function toNumber(value: unknown): number {
  if (typeof value === 'number') return Number.isFinite(value) ? value : 0
  if (typeof value === 'string') {
    const parsed = Number(value)
    return Number.isFinite(parsed) ? parsed : 0
  }
  return 0
}

function getRangeDays(range: GrowthRange): number {
  if (range === '24h') return 1
  if (range === '30d') return 30
  if (range === '90d') return 90
  return 7
}

function getRangeWindow(range: GrowthRange): RangeWindow {
  const days = getRangeDays(range)
  const end = new Date()
  const start = new Date(end)
  start.setUTCDate(start.getUTCDate() - days)
  const previousEnd = new Date(start)
  const previousStart = new Date(start)
  previousStart.setUTCDate(previousStart.getUTCDate() - days)
  return { start, end, previousStart, previousEnd }
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
    message.includes('column') ||
    message.includes('does not exist')
  )
}

function makeId(prefix: string, seed: string) {
  const sanitized = seed.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
  return `${prefix}-${sanitized || 'item'}`
}

function inCurrentWindow(iso: string, window: RangeWindow) {
  const ts = new Date(iso).getTime()
  return ts >= window.start.getTime() && ts < window.end.getTime()
}

function inPreviousWindow(iso: string, window: RangeWindow) {
  const ts = new Date(iso).getTime()
  return ts >= window.previousStart.getTime() && ts < window.previousEnd.getTime()
}

function parsePathSlug(path: string | null | undefined, prefix: '/f/' | '/p/') {
  if (!path || !path.startsWith(prefix)) return null
  const raw = path.slice(prefix.length)
  const slug = raw.split(/[/?#]/)[0]?.trim()
  return slug || null
}

function normalizeSeverity(value: number): Severity {
  if (value >= 80) return 'critical'
  if (value >= 60) return 'high'
  if (value >= 35) return 'medium'
  return 'low'
}

async function fetchFunnels(
  reader: SupabaseClient,
  userId: string,
  funnelId?: string
): Promise<FunnelRow[]> {
  let query = reader.from('funnels').select('funnel_id,name,slug').eq('user_id', userId)
  if (funnelId) query = query.eq('funnel_id', funnelId)
  const { data, error } = await query
  if (error) {
    if (isRecoverableDbError(error)) return []
    throw error
  }
  return (data || []) as FunnelRow[]
}

async function fetchPagesForFunnels(reader: SupabaseClient, funnelIds: string[]): Promise<PageRow[]> {
  if (funnelIds.length === 0) return []

  const primary = await reader
    .from('pages')
    .select('id,funnel_id,slug,name,order_index')
    .in('funnel_id', funnelIds)

  if (!primary.error) return (primary.data || []) as PageRow[]
  if (!isRecoverableDbError(primary.error)) throw primary.error

  const fallback = await reader
    .from('funnel_pages')
    .select('id,funnel_id,slug,name,order_index')
    .in('funnel_id', funnelIds)

  if (fallback.error) {
    if (isRecoverableDbError(fallback.error)) return []
    throw fallback.error
  }

  return (fallback.data || []) as PageRow[]
}

async function fetchClicks(
  reader: SupabaseClient,
  funnelIds: string[],
  startIso: string,
  endIso: string
): Promise<ClickRow[]> {
  if (funnelIds.length === 0) return []
  const { data, error } = await reader
    .from('clicks')
    .select('click_id,funnel_id,clicked_at')
    .in('funnel_id', funnelIds)
    .gte('clicked_at', startIso)
    .lt('clicked_at', endIso)

  if (error) {
    if (isRecoverableDbError(error)) return []
    throw error
  }
  return (data || []) as ClickRow[]
}

async function fetchLeads(
  reader: SupabaseClient,
  funnelIds: string[],
  startIso: string,
  endIso: string
): Promise<LeadRow[]> {
  if (funnelIds.length === 0) return []
  const { data, error } = await reader
    .from('leads')
    .select('id,funnel_id,created_at')
    .in('funnel_id', funnelIds)
    .gte('created_at', startIso)
    .lt('created_at', endIso)

  if (error) {
    if (isRecoverableDbError(error)) return []
    throw error
  }
  return (data || []) as LeadRow[]
}

async function fetchConversions(
  reader: SupabaseClient,
  clickIds: string[],
  startIso: string,
  endIso: string
): Promise<ConversionRow[]> {
  if (clickIds.length === 0) return []
  const { data, error } = await reader
    .from('conversions')
    .select('conversion_id,click_id,amount,converted_at')
    .in('click_id', clickIds)
    .gte('converted_at', startIso)
    .lt('converted_at', endIso)

  if (error) {
    if (isRecoverableDbError(error)) return []
    throw error
  }
  return (data || []) as ConversionRow[]
}

async function fetchAnalyticsEvents(
  reader: SupabaseClient,
  userId: string,
  startIso: string,
  endIso: string,
  funnelId?: string
): Promise<AnalyticsEventRow[]> {
  let query = reader
    .from('analytics_events')
    .select('event_id,user_id,funnel_id,page_id,session_id,event_type,path,metadata,occurred_at')
    .eq('user_id', userId)
    .gte('occurred_at', startIso)
    .lt('occurred_at', endIso)

  if (funnelId) query = query.eq('funnel_id', funnelId)

  const { data, error } = await query
  if (error) {
    if (isRecoverableDbError(error)) return []
    throw error
  }
  return (data || []) as AnalyticsEventRow[]
}

function ensurePageMetric(
  map: Map<string, PageMetricAccumulator>,
  pageKey: string,
  pageId: string | null,
  pageSlug: string | null,
  pageName: string
) {
  const existing = map.get(pageKey)
  if (existing) return existing
  const next: PageMetricAccumulator = {
    pageKey,
    pageId,
    pageSlug,
    pageName,
    views: 0,
    leadSubmits: 0,
    ctaClicks: 0,
    sessions: new Set(),
  }
  map.set(pageKey, next)
  return next
}

async function persistDerivedData(
  reader: SupabaseClient,
  result: GrowthAssistantResult,
  pageDiagnostics: PagePerformanceDiagnostic[]
) {
  const metricDate = new Date().toISOString().split('T')[0]

  const funnelMetricsRows = result.funnelScores.map((score) => ({
    user_id: result.userId,
    funnel_id: score.funnelId,
    metric_date: metricDate,
    total_views: score.totalViews,
    total_clicks: score.totalClicks,
    total_leads: score.totalLeads,
    total_conversions: score.totalConversions,
    total_revenue: Number(score.totalRevenue.toFixed(2)),
    conversion_rate: Number(score.conversionRate.toFixed(4)),
    engagement_rate: Number(score.engagementRate.toFixed(4)),
    ctr: Number(score.ctr.toFixed(4)),
    bounce_rate: Number(score.bounceRate.toFixed(4)),
    updated_at: new Date().toISOString(),
  }))

  const scoreRows = result.funnelScores.map((score) => ({
    user_id: result.userId,
    funnel_id: score.funnelId,
    score_date: metricDate,
    score: Number(score.score.toFixed(2)),
    conversion_rate: Number(score.conversionRate.toFixed(4)),
    engagement_rate: Number(score.engagementRate.toFixed(4)),
    ctr: Number(score.ctr.toFixed(4)),
    total_views: score.totalViews,
    total_clicks: score.totalClicks,
    total_conversions: score.totalConversions,
    updated_at: new Date().toISOString(),
  }))

  const pageRows = pageDiagnostics.map((page) => ({
    user_id: result.userId,
    funnel_id: page.funnelId,
    page_key: page.pageKey,
    page_id: page.pageId,
    page_slug: page.pageSlug,
    metric_date: metricDate,
    total_views: page.views,
    total_lead_submits: page.leadSubmits,
    total_cta_clicks: page.ctaClicks,
    conversion_rate: Number(page.conversionRate.toFixed(4)),
    ctr: Number(page.ctr.toFixed(4)),
    bounce_rate: Number(page.bounceRate.toFixed(4)),
    updated_at: new Date().toISOString(),
  }))

  const insightsRows = result.insights.map((insight) => ({
    user_id: insight.userId,
    funnel_id: insight.funnelId,
    insight_type: insight.insightType,
    title: insight.title,
    description: insight.description,
    severity: insight.severity,
    confidence: Number(insight.confidence.toFixed(3)),
    metrics: insight.metrics,
    period_start: insight.periodStart,
    period_end: insight.periodEnd,
    status: 'active',
    source: 'rule_engine',
    updated_at: new Date().toISOString(),
  }))

  const recommendationRows = result.recommendations.map((item) => ({
    user_id: item.userId,
    funnel_id: item.funnelId,
    recommendation_type: item.recommendationType,
    title: item.title,
    description: item.description,
    rationale: item.rationale,
    priority: item.priority,
    confidence: Number(item.confidence.toFixed(3)),
    expected_lift_min: item.expectedLiftMin,
    expected_lift_max: item.expectedLiftMax,
    effort: item.effort,
    metadata: item.metadata,
    status: item.status,
    source: 'rule_engine',
    updated_at: new Date().toISOString(),
  }))

  const alertRows = result.alerts.map((alert) => ({
    user_id: alert.userId,
    funnel_id: alert.funnelId,
    alert_type: alert.alertType,
    title: alert.title,
    message: alert.message,
    severity: alert.severity,
    state: alert.state,
    payload: alert.payload,
    triggered_at: alert.triggeredAt,
    updated_at: new Date().toISOString(),
  }))

  const operations: Array<PromiseLike<unknown>> = []

  if (funnelMetricsRows.length > 0) {
    operations.push(
      reader.from('funnel_metrics_daily').upsert(funnelMetricsRows, { onConflict: 'funnel_id,metric_date' }).then(({ error }) => {
        if (error && !isRecoverableDbError(error)) throw error
      })
    )
  }

  if (scoreRows.length > 0) {
    operations.push(
      reader.from('funnel_scores_daily').upsert(scoreRows, { onConflict: 'funnel_id,score_date' }).then(({ error }) => {
        if (error && !isRecoverableDbError(error)) throw error
      })
    )
  }

  if (pageRows.length > 0) {
    operations.push(
      reader.from('page_metrics_daily').upsert(pageRows, { onConflict: 'funnel_id,page_key,metric_date' }).then(({ error }) => {
        if (error && !isRecoverableDbError(error)) throw error
      })
    )
  }

  if (insightsRows.length > 0) {
    operations.push(
      reader.from('growth_insights').insert(insightsRows).then(({ error }) => {
        if (error && !isRecoverableDbError(error)) throw error
      })
    )
  }

  if (recommendationRows.length > 0) {
    operations.push(
      reader.from('growth_recommendations').insert(recommendationRows).then(({ error }) => {
        if (error && !isRecoverableDbError(error)) throw error
      })
    )
  }

  if (alertRows.length > 0) {
    operations.push(
      reader.from('growth_alerts').insert(alertRows).then(({ error }) => {
        if (error && !isRecoverableDbError(error)) throw error
      })
    )
  }

  await Promise.all(operations)
}

export async function generateGrowthAssistantResult(
  userId: string,
  options: GrowthAssistantOptions = {},
  readerClient?: SupabaseClient
): Promise<GrowthAssistantResult> {
  const range: GrowthRange = options.range || '7d'
  const window = getRangeWindow(range)
  const startIso = window.start.toISOString()
  const endIso = window.end.toISOString()
  const previousStartIso = window.previousStart.toISOString()

  let reader: SupabaseClient
  if (readerClient) {
    reader = readerClient
  } else {
    try {
      reader = createServiceRoleClient()
    } catch {
      const url = process.env.NEXT_PUBLIC_SUPABASE_URL
      const publicKey =
        process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
      if (!url || !publicKey) {
        throw new Error('Supabase credentials not configured')
      }
      reader = createClient(url, publicKey, {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      })
    }
  }

  const funnels = await fetchFunnels(reader, userId, options.funnelId)
  const funnelIds = funnels.map((f) => f.funnel_id)
  const funnelById = new Map(funnels.map((f) => [f.funnel_id, f]))
  const funnelSlugToId = new Map(
    funnels
      .filter((f) => typeof f.slug === 'string' && f.slug.length > 0)
      .map((f) => [f.slug as string, f.funnel_id])
  )

  const buckets = new Map<string, FunnelBucket>()
  for (const funnel of funnels) {
    buckets.set(funnel.funnel_id, {
      funnelId: funnel.funnel_id,
      funnelName: funnel.name || 'Untitled Funnel',
      current: {
        clicks: 0,
        conversions: 0,
        leads: 0,
        revenue: 0,
        views: 0,
        ctaClicks: 0,
        leadSubmits: 0,
        sessions: new Set(),
        sessionViewCounts: new Map(),
        sessionPages: new Map(),
      },
      previous: {
        clicks: 0,
        conversions: 0,
        leads: 0,
        revenue: 0,
        views: 0,
        ctaClicks: 0,
        leadSubmits: 0,
      },
      pageMetrics: new Map(),
    })
  }

  if (funnelIds.length === 0) {
    const generatedAt = new Date().toISOString()
    return {
      userId,
      range,
      generatedAt,
      periodStart: startIso,
      periodEnd: endIso,
      funnelScores: [],
      pageDiagnostics: [],
      dropoffPoints: [],
      insights: [],
      recommendations: [],
      alerts: [],
      abTestSuggestions: [],
      optimizationIdeas: [],
      plainEnglishInsights: [],
      weeklySummary: buildWeeklySummary({
        userId,
        range,
        generatedAt,
        funnelScores: [],
        seeds: [],
        alerts: [],
        recommendations: [],
      }),
      forecasts: [],
    }
  }

  const [pages, clicks, leads, events] = await Promise.all([
    fetchPagesForFunnels(reader, funnelIds),
    fetchClicks(reader, funnelIds, previousStartIso, endIso),
    fetchLeads(reader, funnelIds, previousStartIso, endIso),
    fetchAnalyticsEvents(reader, userId, previousStartIso, endIso, options.funnelId),
  ])

  const pageById = new Map<string, PageRow>()
  const pageSlugToRow = new Map<string, PageRow>()
  const pagesByFunnel = new Map<string, PageRow[]>()
  for (const page of pages) {
    if (!page.funnel_id) continue
    if (page.id) pageById.set(page.id, page)
    if (page.slug) pageSlugToRow.set(page.slug, page)
    const list = pagesByFunnel.get(page.funnel_id) || []
    list.push(page)
    pagesByFunnel.set(page.funnel_id, list)
  }
  for (const list of pagesByFunnel.values()) {
    list.sort((a, b) => toNumber(a.order_index) - toNumber(b.order_index))
  }

  const clickToFunnel = new Map<string, string>()
  for (const click of clicks) {
    if (click.click_id && click.funnel_id) clickToFunnel.set(click.click_id, click.funnel_id)
    const iso = click.clicked_at
    if (!iso || !click.funnel_id) continue
    const bucket = buckets.get(click.funnel_id)
    if (!bucket) continue
    if (inCurrentWindow(iso, window)) {
      bucket.current.clicks += 1
    } else if (inPreviousWindow(iso, window)) {
      bucket.previous.clicks += 1
    }
  }

  const clickIds = Array.from(clickToFunnel.keys())
  const conversions = await fetchConversions(reader, clickIds, previousStartIso, endIso)
  for (const conversion of conversions) {
    const iso = conversion.converted_at
    if (!iso || !conversion.click_id) continue
    const funnelId = clickToFunnel.get(conversion.click_id)
    if (!funnelId) continue
    const bucket = buckets.get(funnelId)
    if (!bucket) continue
    const amount = toNumber(conversion.amount)
    if (inCurrentWindow(iso, window)) {
      bucket.current.conversions += 1
      bucket.current.revenue += amount
    } else if (inPreviousWindow(iso, window)) {
      bucket.previous.conversions += 1
      bucket.previous.revenue += amount
    }
  }

  for (const lead of leads) {
    const iso = lead.created_at
    if (!iso || !lead.funnel_id) continue
    const bucket = buckets.get(lead.funnel_id)
    if (!bucket) continue
    if (inCurrentWindow(iso, window)) {
      bucket.current.leads += 1
    } else if (inPreviousWindow(iso, window)) {
      bucket.previous.leads += 1
    }
  }

  for (const event of events) {
    const iso = event.occurred_at
    if (!iso) continue

    let funnelId = event.funnel_id || null
    const path = event.path || ''
    if (!funnelId && path) {
      const funnelSlug = parsePathSlug(path, '/f/')
      if (funnelSlug) funnelId = funnelSlugToId.get(funnelSlug) || null
      if (!funnelId) {
        const pageSlug = parsePathSlug(path, '/p/')
        const page = pageSlug ? pageSlugToRow.get(pageSlug) : null
        if (page?.funnel_id) funnelId = page.funnel_id
      }
    }

    if (!funnelId) continue
    const bucket = buckets.get(funnelId)
    if (!bucket) continue

    const isCurrent = inCurrentWindow(iso, window)
    const isPrevious = inPreviousWindow(iso, window)
    if (!isCurrent && !isPrevious) continue

    const eventType = (event.event_type || '').toLowerCase()
    const sessionId = event.session_id || null

    const pageFromId = event.page_id ? pageById.get(event.page_id) : null
    const pageSlug = pageFromId?.slug || parsePathSlug(path, '/p/') || parsePathSlug(path, '/f/')
    const pageName = pageFromId?.name || (pageSlug ? `/${pageSlug}` : 'Landing')
    const pageId = pageFromId?.id || event.page_id || null
    const pageKey = pageId || pageSlug || 'landing'
    const pageMetric = ensurePageMetric(bucket.pageMetrics, pageKey, pageId, pageSlug || null, pageName)

    if (eventType === 'page_view') {
      if (isCurrent) {
        bucket.current.views += 1
        pageMetric.views += 1
        if (sessionId) {
          bucket.current.sessions.add(sessionId)
          bucket.current.sessionViewCounts.set(sessionId, (bucket.current.sessionViewCounts.get(sessionId) || 0) + 1)
          const visited = bucket.current.sessionPages.get(sessionId) || new Set<string>()
          visited.add(pageKey)
          bucket.current.sessionPages.set(sessionId, visited)
          pageMetric.sessions.add(sessionId)
        }
      } else if (isPrevious) {
        bucket.previous.views += 1
      }
      continue
    }

    if (eventType === 'cta_click') {
      if (isCurrent) {
        bucket.current.ctaClicks += 1
        pageMetric.ctaClicks += 1
      } else if (isPrevious) {
        bucket.previous.ctaClicks += 1
      }
      continue
    }

    if (eventType === 'lead_submit') {
      if (isCurrent) {
        bucket.current.leadSubmits += 1
        pageMetric.leadSubmits += 1
      } else if (isPrevious) {
        bucket.previous.leadSubmits += 1
      }
    }
  }

  const dropoffPoints: FunnelDropoffPoint[] = []
  const pageDiagnostics: PagePerformanceDiagnostic[] = []
  const funnelScores: FunnelPerformanceScore[] = []
  const insights: GrowthInsight[] = []
  const recommendations: GrowthRecommendation[] = []
  const alerts: GrowthAlert[] = []
  const forecastSeeds: FunnelForecastSeed[] = []
  const recommendationKeys = new Set<string>()

  const nowIso = new Date().toISOString()

  const pushRecommendation = (item: GrowthRecommendation) => {
    const key = `${item.funnelId || 'all'}:${item.recommendationType}:${item.title}`
    if (recommendationKeys.has(key)) return
    recommendationKeys.add(key)
    recommendations.push(item)
  }

  for (const [funnelId, bucket] of buckets) {
    const views = bucket.current.views > 0 ? bucket.current.views : Math.round(bucket.current.clicks * 1.2)
    const ctaClicks = bucket.current.ctaClicks > 0 ? bucket.current.ctaClicks : bucket.current.clicks
    const leadSubmits = bucket.current.leadSubmits > 0 ? bucket.current.leadSubmits : bucket.current.leads
    const totalSessions = bucket.current.sessions.size

    let bounceRate = 0
    if (totalSessions > 0) {
      let bouncedSessions = 0
      for (const [sessionId, pagesVisited] of bucket.current.sessionPages.entries()) {
        if (pagesVisited.size <= 1) bouncedSessions += 1
        const sessionViews = bucket.current.sessionViewCounts.get(sessionId) || 0
        if (sessionViews <= 1 && pagesVisited.size <= 1) continue
      }
      bounceRate = (bouncedSessions / totalSessions) * 100
    }

    const conversionRate = bucket.current.clicks > 0 ? (bucket.current.conversions / bucket.current.clicks) * 100 : 0
    const previousConversionRate = bucket.previous.clicks > 0 ? (bucket.previous.conversions / bucket.previous.clicks) * 100 : 0
    const previousCtr = bucket.previous.views > 0 ? (bucket.previous.ctaClicks / bucket.previous.views) * 100 : 0
    const conversionRateDeltaPct =
      previousConversionRate > 0
        ? ((conversionRate - previousConversionRate) / previousConversionRate) * 100
        : conversionRate > 0
          ? 100
          : 0
    const engagementRate = views > 0 ? (leadSubmits / views) * 100 : 0
    const ctr = views > 0 ? (ctaClicks / views) * 100 : 0

    const conversionNorm = clamp(conversionRate * 20, 0, 100)
    const engagementNorm = clamp(engagementRate * 10, 0, 100)
    const ctrNorm = clamp(ctr * 20, 0, 100)
    const bouncePenalty = clamp(bounceRate * 0.4, 0, 40)
    const score = clamp((conversionNorm * 0.5) + (engagementNorm * 0.25) + (ctrNorm * 0.25) - bouncePenalty, 0, 100)

    const funnelScore: FunnelPerformanceScore = {
      funnelId,
      funnelName: bucket.funnelName,
      score: Number(score.toFixed(2)),
      conversionRate: Number(conversionRate.toFixed(2)),
      engagementRate: Number(engagementRate.toFixed(2)),
      ctr: Number(ctr.toFixed(2)),
      bounceRate: Number(bounceRate.toFixed(2)),
      totalViews: views,
      totalClicks: bucket.current.clicks,
      totalLeads: bucket.current.leads,
      totalConversions: bucket.current.conversions,
      totalRevenue: Number(bucket.current.revenue.toFixed(2)),
      previousConversionRate: Number(previousConversionRate.toFixed(2)),
      conversionRateDeltaPct: Number(conversionRateDeltaPct.toFixed(2)),
    }
    funnelScores.push(funnelScore)
    forecastSeeds.push({
      funnelId,
      funnelName: bucket.funnelName,
      currentClicks: bucket.current.clicks,
      previousClicks: bucket.previous.clicks,
      currentConversions: bucket.current.conversions,
      previousConversions: bucket.previous.conversions,
      currentRevenue: bucket.current.revenue,
      previousRevenue: bucket.previous.revenue,
      currentConversionRate: conversionRate,
      previousConversionRate,
      currentCtr: ctr,
      previousCtr,
    })

    if (bucket.previous.clicks >= 20 && conversionRateDeltaPct <= -15) {
      const severity = normalizeSeverity(Math.abs(conversionRateDeltaPct))
      insights.push({
        id: makeId('insight', `${funnelId}-conv-drop-${Math.round(Math.abs(conversionRateDeltaPct))}`),
        userId,
        funnelId,
        insightType: 'conversion_drop',
        title: `Conversion rate dropped ${Math.abs(conversionRateDeltaPct).toFixed(1)}%`,
        description: `${bucket.funnelName} conversion rate fell from ${previousConversionRate.toFixed(2)}% to ${conversionRate.toFixed(2)}% in the selected range.`,
        severity,
        confidence: 0.86,
        metrics: {
          previousConversionRate: Number(previousConversionRate.toFixed(2)),
          currentConversionRate: Number(conversionRate.toFixed(2)),
          deltaPct: Number(conversionRateDeltaPct.toFixed(2)),
          clicksCurrent: bucket.current.clicks,
          clicksPrevious: bucket.previous.clicks,
        },
        periodStart: startIso,
        periodEnd: endIso,
        createdAt: nowIso,
      })

      alerts.push({
        id: makeId('alert', `${funnelId}-conversion-drop-${Math.round(Math.abs(conversionRateDeltaPct))}`),
        userId,
        funnelId,
        alertType: 'conversion_drop',
        title: 'Sudden conversion decline detected',
        message: `${bucket.funnelName} conversion rate decreased by ${Math.abs(conversionRateDeltaPct).toFixed(1)}%.`,
        severity,
        state: 'active',
        payload: {
          previousConversionRate: Number(previousConversionRate.toFixed(2)),
          currentConversionRate: Number(conversionRate.toFixed(2)),
          deltaPct: Number(conversionRateDeltaPct.toFixed(2)),
        },
        triggeredAt: nowIso,
      })
    }

    if (bucket.current.clicks >= 100 && conversionRate < 1.5) {
      insights.push({
        id: makeId('insight', `${funnelId}-traffic-low-conv`),
        userId,
        funnelId,
        insightType: 'high_traffic_low_conversion',
        title: `${bucket.funnelName} has high traffic but low conversions`,
        description: `${bucket.current.clicks.toLocaleString()} clicks generated only ${bucket.current.conversions.toLocaleString()} conversions (${conversionRate.toFixed(2)}%).`,
        severity: 'high',
        confidence: 0.82,
        metrics: {
          clicks: bucket.current.clicks,
          conversions: bucket.current.conversions,
          conversionRate: Number(conversionRate.toFixed(2)),
        },
        periodStart: startIso,
        periodEnd: endIso,
        createdAt: nowIso,
      })

      pushRecommendation({
        id: makeId('reco', `${funnelId}-headline-offer-test`),
        userId,
        funnelId,
        recommendationType: 'headline_offer_test',
        title: 'Improve headline and test a stronger offer angle',
        description: 'Traffic is reaching the funnel but too few visitors convert. Tighten message-to-offer fit on the first screen.',
        rationale: 'High traffic with weak conversion usually indicates value proposition mismatch or weak offer framing.',
        priority: 'high',
        confidence: 0.83,
        expectedLiftMin: 8,
        expectedLiftMax: 20,
        effort: 'medium',
        metadata: { trigger: 'high_traffic_low_conversion' },
        status: 'open',
        createdAt: nowIso,
      })
    }

    if (views >= 100 && ctr < 2) {
      insights.push({
        id: makeId('insight', `${funnelId}-low-cta-ctr`),
        userId,
        funnelId,
        insightType: 'low_cta_ctr',
        title: 'CTA click-through rate is low',
        description: `${bucket.funnelName} has ${views.toLocaleString()} views but only ${ctr.toFixed(2)}% CTA CTR.`,
        severity: 'medium',
        confidence: 0.78,
        metrics: {
          views,
          ctaClicks,
          ctr: Number(ctr.toFixed(2)),
        },
        periodStart: startIso,
        periodEnd: endIso,
        createdAt: nowIso,
      })

      pushRecommendation({
        id: makeId('reco', `${funnelId}-cta-position-copy`),
        userId,
        funnelId,
        recommendationType: 'cta_optimization',
        title: 'Move primary CTA higher and test copy variants',
        description: 'Place a stronger CTA above the fold and run A/B tests on button copy.',
        rationale: 'Low CTR with adequate traffic indicates CTA visibility or motivation issues.',
        priority: 'high',
        confidence: 0.81,
        expectedLiftMin: 6,
        expectedLiftMax: 18,
        effort: 'low',
        metadata: { trigger: 'low_cta_ctr' },
        status: 'open',
        createdAt: nowIso,
      })
    }

    if (totalSessions >= 20 && bounceRate >= 70) {
      insights.push({
        id: makeId('insight', `${funnelId}-high-bounce`),
        userId,
        funnelId,
        insightType: 'high_bounce_rate',
        title: `High bounce rate detected (${bounceRate.toFixed(1)}%)`,
        description: `${bucket.funnelName} visitors are leaving early with minimal interaction.`,
        severity: 'high',
        confidence: 0.76,
        metrics: {
          bounceRate: Number(bounceRate.toFixed(2)),
          sessions: totalSessions,
        },
        periodStart: startIso,
        periodEnd: endIso,
        createdAt: nowIso,
      })

      pushRecommendation({
        id: makeId('reco', `${funnelId}-simplify-layout`),
        userId,
        funnelId,
        recommendationType: 'layout_simplification',
        title: 'Simplify the first section layout and sharpen message match',
        description: 'Reduce visual clutter, tighten headline clarity, and align first-screen copy with traffic source intent.',
        rationale: 'High bounce is often caused by weak first-impression clarity or mismatched visitor intent.',
        priority: 'high',
        confidence: 0.79,
        expectedLiftMin: 5,
        expectedLiftMax: 16,
        effort: 'medium',
        metadata: { trigger: 'high_bounce_rate' },
        status: 'open',
        createdAt: nowIso,
      })
    }

    if (bucket.current.clicks >= 40 && bucket.current.conversions === 0) {
      alerts.push({
        id: makeId('alert', `${funnelId}-funnel-break`),
        userId,
        funnelId,
        alertType: 'funnel_break',
        title: 'Funnel break suspected',
        message: `${bucket.funnelName} has ${bucket.current.clicks} clicks but zero conversions.`,
        severity: 'critical',
        state: 'active',
        payload: {
          clicks: bucket.current.clicks,
          conversions: bucket.current.conversions,
        },
        triggeredAt: nowIso,
      })
    }

    if (bucket.previous.clicks > 0 && bucket.current.clicks >= Math.max(50, bucket.previous.clicks * 1.8)) {
      alerts.push({
        id: makeId('alert', `${funnelId}-traffic-spike`),
        userId,
        funnelId,
        alertType: 'traffic_spike',
        title: 'Traffic spike detected',
        message: `${bucket.funnelName} traffic spiked from ${bucket.previous.clicks} to ${bucket.current.clicks} clicks.`,
        severity: 'medium',
        state: 'active',
        payload: {
          previousClicks: bucket.previous.clicks,
          currentClicks: bucket.current.clicks,
        },
        triggeredAt: nowIso,
      })
    }

    const pageRowsForFunnel = (pagesByFunnel.get(funnelId) || []).filter((page) => !!(page.id || page.slug))
    for (const pageMetric of bucket.pageMetrics.values()) {
      const pageSessions = pageMetric.sessions.size
      let bounced = 0
      if (pageSessions > 0) {
        for (const sessionId of pageMetric.sessions.values()) {
          const pagesVisited = bucket.current.sessionPages.get(sessionId)
          if (pagesVisited && pagesVisited.size <= 1) bounced += 1
        }
      }
      const pageBounceRate = pageSessions > 0 ? (bounced / pageSessions) * 100 : 0
      const pageConversionRate = pageMetric.views > 0 ? (pageMetric.leadSubmits / pageMetric.views) * 100 : 0
      const pageCtr = pageMetric.views > 0 ? (pageMetric.ctaClicks / pageMetric.views) * 100 : 0

      const diagnostic: PagePerformanceDiagnostic = {
        funnelId,
        pageKey: pageMetric.pageKey,
        pageId: pageMetric.pageId,
        pageSlug: pageMetric.pageSlug,
        pageName: pageMetric.pageName,
        views: pageMetric.views,
        leadSubmits: pageMetric.leadSubmits,
        ctaClicks: pageMetric.ctaClicks,
        conversionRate: Number(pageConversionRate.toFixed(2)),
        ctr: Number(pageCtr.toFixed(2)),
        bounceRate: Number(pageBounceRate.toFixed(2)),
      }
      pageDiagnostics.push(diagnostic)

      if (pageMetric.views >= 80 && pageConversionRate < 1) {
        insights.push({
          id: makeId('insight', `${funnelId}-${pageMetric.pageKey}-low-page-conv`),
          userId,
          funnelId,
          insightType: 'low_conversion_page',
          title: `${pageMetric.pageName} has low conversion efficiency`,
          description: `${pageMetric.pageName} has ${pageMetric.views.toLocaleString()} views with ${pageConversionRate.toFixed(2)}% lead conversion.`,
          severity: 'medium',
          confidence: 0.74,
          metrics: {
            pageKey: pageMetric.pageKey,
            views: pageMetric.views,
            conversionRate: Number(pageConversionRate.toFixed(2)),
          },
          periodStart: startIso,
          periodEnd: endIso,
          createdAt: nowIso,
        })
      }

      if (pageMetric.views >= 80 && pageBounceRate >= 75) {
        insights.push({
          id: makeId('insight', `${funnelId}-${pageMetric.pageKey}-high-page-bounce`),
          userId,
          funnelId,
          insightType: 'high_bounce_page',
          title: `${pageMetric.pageName} shows high bounce`,
          description: `${pageBounceRate.toFixed(1)}% of sessions viewing ${pageMetric.pageName} exit without moving deeper.`,
          severity: 'high',
          confidence: 0.72,
          metrics: {
            pageKey: pageMetric.pageKey,
            views: pageMetric.views,
            bounceRate: Number(pageBounceRate.toFixed(2)),
          },
          periodStart: startIso,
          periodEnd: endIso,
          createdAt: nowIso,
        })
      }
    }

    if (pageRowsForFunnel.length >= 2) {
      const orderedKeys = pageRowsForFunnel.map((page) => page.id || page.slug).filter((value): value is string => !!value)
      for (let i = 0; i < orderedKeys.length - 1; i += 1) {
        const fromKey = orderedKeys[i]
        const toKey = orderedKeys[i + 1]
        const fromMetric = bucket.pageMetrics.get(fromKey)
        const toMetric = bucket.pageMetrics.get(toKey)
        const fromSessions = fromMetric?.sessions.size || 0
        const toSessions = toMetric?.sessions.size || 0
        if (fromSessions < 20) continue
        const dropoffRate = ((fromSessions - toSessions) / fromSessions) * 100
        if (dropoffRate < 35) continue

        const point: FunnelDropoffPoint = {
          funnelId,
          fromPageKey: fromKey,
          toPageKey: toKey,
          fromPageName: fromMetric?.pageName || fromKey,
          toPageName: toMetric?.pageName || toKey,
          fromSessions,
          toSessions,
          dropoffRate: Number(dropoffRate.toFixed(2)),
        }
        dropoffPoints.push(point)

        insights.push({
          id: makeId('insight', `${funnelId}-${fromKey}-${toKey}-dropoff`),
          userId,
          funnelId,
          insightType: 'dropoff_point',
          title: `Major drop-off between ${point.fromPageName} and ${point.toPageName}`,
          description: `${dropoffRate.toFixed(1)}% of sessions drop between these steps.`,
          severity: dropoffRate >= 60 ? 'critical' : 'high',
          confidence: 0.8,
          metrics: point as unknown as Record<string, unknown>,
          periodStart: startIso,
          periodEnd: endIso,
          createdAt: nowIso,
        })

        pushRecommendation({
          id: makeId('reco', `${funnelId}-${fromKey}-${toKey}-step-optimization`),
          userId,
          funnelId,
          recommendationType: 'step_dropoff_optimization',
          title: `Reduce friction between ${point.fromPageName} and ${point.toPageName}`,
          description: 'Simplify transition content, add trust proof, and make next-step CTA more explicit.',
          rationale: 'Large mid-funnel drop-off indicates friction, unclear value, or weak continuation cues.',
          priority: dropoffRate >= 60 ? 'critical' : 'high',
          confidence: 0.8,
          expectedLiftMin: 7,
          expectedLiftMax: 22,
          effort: 'medium',
          metadata: point as unknown as Record<string, unknown>,
          status: 'open',
          createdAt: nowIso,
        })
      }
    }

    if (score < 45) {
      pushRecommendation({
        id: makeId('reco', `${funnelId}-overall-health-plan`),
        userId,
        funnelId,
        recommendationType: 'overall_health_improvement',
        title: 'Launch a focused 2-week optimization sprint',
        description: 'Prioritize first-screen messaging, CTA hierarchy, and trust proof to improve funnel health score.',
        rationale: 'Composite score is below healthy threshold across conversion, engagement, and CTR dimensions.',
        priority: 'high',
        confidence: 0.77,
        expectedLiftMin: 10,
        expectedLiftMax: 30,
        effort: 'high',
        metadata: { score: Number(score.toFixed(2)) },
        status: 'open',
        createdAt: nowIso,
      })
    }
  }

  funnelScores.sort((a, b) => b.score - a.score)
  pageDiagnostics.sort((a, b) => b.views - a.views)
  dropoffPoints.sort((a, b) => b.dropoffRate - a.dropoffRate)
  insights.sort((a, b) => {
    const order: Record<Severity, number> = { critical: 4, high: 3, medium: 2, low: 1 }
    return order[b.severity] - order[a.severity]
  })
  recommendations.sort((a, b) => {
    const order: Record<Severity, number> = { critical: 4, high: 3, medium: 2, low: 1 }
    return order[b.priority] - order[a.priority]
  })
  alerts.sort((a, b) => {
    const order: Record<Severity, number> = { critical: 4, high: 3, medium: 2, low: 1 }
    return order[b.severity] - order[a.severity]
  })

  const forecasts = buildForecasts({
    range,
    generatedAt: nowIso,
    seeds: forecastSeeds,
  })

  const optimizationIdeas = buildOptimizationIdeas({
    userId,
    generatedAt: nowIso,
    recommendations,
    forecasts,
  })

  const plainEnglishInsights = buildPlainEnglishInsights({
    userId,
    generatedAt: nowIso,
    insights,
    recommendations,
    alerts,
  })

  const weeklySummary = buildWeeklySummary({
    userId,
    range,
    generatedAt: nowIso,
    funnelScores,
    seeds: forecastSeeds,
    alerts,
    recommendations,
  })

  const abTestSuggestions = await buildABTestSuggestions({
    userId,
    generatedAt: nowIso,
    funnelScores,
    insights,
    recommendations,
  })

  const result: GrowthAssistantResult = {
    userId,
    range,
    generatedAt: nowIso,
    periodStart: startIso,
    periodEnd: endIso,
    funnelScores,
    pageDiagnostics,
    dropoffPoints,
    insights,
    recommendations,
    alerts,
    abTestSuggestions,
    optimizationIdeas,
    plainEnglishInsights,
    weeklySummary,
    forecasts,
  }

  if (options.persist) {
    await persistDerivedData(reader, result, pageDiagnostics)
  }

  return result
}
