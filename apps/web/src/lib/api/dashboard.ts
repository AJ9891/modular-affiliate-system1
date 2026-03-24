import { getAnalyticsSummary } from './analytics'
import { listFunnels } from './funnels'

export interface DashboardData {
  totals: {
    funnels: number
    leads: number
    clicks: number
    conversions: number
    revenue: number
    conversionRate: number
  }
  sourceBreakdown: Array<{ source: string; count: number }>
  recentActivity: Array<{ type: string; timestamp: string; source?: string; email?: string; funnel?: string }>
}

export async function getDashboardData(range = '7d'): Promise<DashboardData> {
  const [analytics, funnels] = await Promise.all([getAnalyticsSummary(range), listFunnels()])

  return {
    totals: {
      funnels: funnels.length,
      leads: analytics.stats.totalLeads,
      clicks: analytics.stats.totalClicks,
      conversions: analytics.stats.totalConversions,
      revenue: analytics.stats.totalRevenue,
      conversionRate: analytics.stats.conversionRate,
    },
    sourceBreakdown: analytics.clicksBySource,
    recentActivity: analytics.recentActivity,
  }
}
