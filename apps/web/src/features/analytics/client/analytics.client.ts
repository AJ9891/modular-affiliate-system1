import { api } from '@/lib/api/client'

const toNumber = (value: unknown): number => {
  if (typeof value === 'number') return Number.isFinite(value) ? value : 0
  if (typeof value === 'string') {
    const parsed = Number(value)
    return Number.isFinite(parsed) ? parsed : 0
  }
  return 0
}

export interface AnalyticsStats {
  totalLeads: number
  totalClicks: number
  totalConversions: number
  totalRevenue: number
  conversionRate: number
  avgRevenuePerLead: number
  emailsSent: number
  emailOpenRate: number
}

export interface AnalyticsSummary {
  stats: AnalyticsStats
  clicksBySource: Array<{ source: string; count: number }>
  clicksByOffer: Array<{ offerKey: string; clicks: number }>
  recentActivity: Array<{ type: string; timestamp: string; source?: string; email?: string; funnel?: string }>
}

export interface FunnelPerformance {
  totalClicks: number
  totalConversions: number
  conversionRate: number
  totalRevenue: number
  clicksByDay: Record<string, number>
  conversionsByDay: Record<string, number>
}

interface AnalyticsApiResponse {
  stats?: Record<string, unknown>
  clicksBySource?: Record<string, number> | Array<{ source?: string; count?: number }>
  clicksByOffer?: Record<string, number> | Array<{ offer_name?: string; clicks?: number }>
  recentActivity?: Array<Record<string, unknown>>
}

export async function getAnalyticsSummary(range = '7d'): Promise<AnalyticsSummary> {
  const payload = await api.get<AnalyticsApiResponse>(`/api/analytics?range=${range}`)

  const stats = payload.stats || {}

  const clicksBySource = Array.isArray(payload.clicksBySource)
    ? payload.clicksBySource.map((item) => ({
        source: item.source || 'direct',
        count: toNumber(item.count),
      }))
    : Object.entries(payload.clicksBySource || {}).map(([source, count]) => ({ source, count: toNumber(count) }))

  const clicksByOffer = Array.isArray(payload.clicksByOffer)
    ? payload.clicksByOffer.map((item) => ({
        offerKey: item.offer_name || 'unknown',
        clicks: toNumber(item.clicks),
      }))
    : Object.entries(payload.clicksByOffer || {}).map(([offerKey, clicks]) => ({
        offerKey,
        clicks: toNumber(clicks),
      }))

  const recentActivity = (payload.recentActivity || []).map((item) => ({
    type: typeof item.type === 'string' ? item.type : 'event',
    timestamp:
      item.timestamp instanceof Date
        ? item.timestamp.toISOString()
        : typeof item.timestamp === 'string'
          ? item.timestamp
          : new Date().toISOString(),
    source: typeof item.source === 'string' ? item.source : undefined,
    email: typeof item.email === 'string' ? item.email : undefined,
    funnel: typeof item.funnel === 'string' ? item.funnel : undefined,
  }))

  return {
    stats: {
      totalLeads: toNumber(stats.totalLeads),
      totalClicks: toNumber(stats.totalClicks),
      totalConversions: toNumber(stats.totalConversions),
      totalRevenue: toNumber(stats.totalRevenue),
      conversionRate: toNumber(stats.conversionRate),
      avgRevenuePerLead: toNumber(stats.avgRevenuePerLead),
      emailsSent: toNumber(stats.emailsSent),
      emailOpenRate: toNumber(stats.emailOpenRate),
    },
    clicksBySource,
    clicksByOffer,
    recentActivity,
  }
}

interface FunnelPerformanceResponse {
  analytics?: {
    total_clicks?: number | string
    total_conversions?: number | string
    conversion_rate?: number | string
    total_revenue?: number | string
    clicks_by_day?: Record<string, number>
    conversions_by_day?: Record<string, number>
  }
}

export async function getFunnelPerformance(funnelId: string): Promise<FunnelPerformance> {
  const payload = await api.get<FunnelPerformanceResponse>(`/api/analytics/${funnelId}`)
  const analytics = payload.analytics || {}

  return {
    totalClicks: toNumber(analytics.total_clicks),
    totalConversions: toNumber(analytics.total_conversions),
    conversionRate: toNumber(analytics.conversion_rate),
    totalRevenue: toNumber(analytics.total_revenue),
    clicksByDay: analytics.clicks_by_day || {},
    conversionsByDay: analytics.conversions_by_day || {},
  }
}
