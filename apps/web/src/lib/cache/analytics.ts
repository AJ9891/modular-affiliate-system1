import { InMemoryCache } from '@/lib/cache/in-memory'

type AnalyticsPayload = {
  success: boolean
  stats: Record<string, unknown>
  clicksBySource: Record<string, number>
  clicksByOffer: Record<string, number>
  recentClicks: Array<Record<string, unknown>>
  recentActivity: Array<Record<string, unknown>>
}

const analyticsCache = new InMemoryCache<AnalyticsPayload>()
const ANALYTICS_TTL_MS = 30 * 1000

export function getAnalyticsCacheKey(userId: string, range: string, funnelId: string | null) {
  return `analytics:${userId}:${range}:${funnelId || 'all'}`
}

export function getCachedAnalytics(key: string): AnalyticsPayload | null {
  return analyticsCache.get(key)
}

export function setCachedAnalytics(key: string, payload: AnalyticsPayload) {
  analyticsCache.set(key, payload, ANALYTICS_TTL_MS)
}
