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
  success: boolean
  stats: AnalyticsStats
  clicksBySource: Record<string, number>
  clicksByOffer: Record<string, number>
  recentClicks: AnalyticsEvent[]
  recentActivity: AnalyticsEvent[]
}

export type AnalyticsEvent = {
  type: 'click' | 'lead' | 'conversion'
  timestamp: string
  source?: string
  email?: string
  funnel?: string
  amount?: number
}

export type GetAnalyticsSummaryInput = {
  userId: string
  range: string
  funnelId: string | null
}
