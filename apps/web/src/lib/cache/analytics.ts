import { InMemoryCache } from '@/lib/cache/in-memory'
import type { AnalyticsSummary } from '@/features/analytics/types'

const analyticsCache = new InMemoryCache<AnalyticsSummary>()
const ANALYTICS_TTL_MS = 30 * 1000

export function getAnalyticsCacheKey(userId: string, range: string, funnelId: string | null) {
  return `analytics:${userId}:${range}:${funnelId || 'all'}`
}

export function getCachedAnalytics(key: string): AnalyticsSummary | null {
  return analyticsCache.get(key)
}

export function setCachedAnalytics(key: string, payload: AnalyticsSummary) {
  analyticsCache.set(key, payload, ANALYTICS_TTL_MS)
}
