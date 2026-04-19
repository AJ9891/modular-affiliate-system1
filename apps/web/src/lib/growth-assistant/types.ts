export type GrowthRange = '24h' | '7d' | '30d' | '90d'

export type Severity = 'low' | 'medium' | 'high' | 'critical'
export type Priority = 'low' | 'medium' | 'high' | 'critical'

export interface GrowthInsight {
  id: string
  userId: string
  funnelId: string | null
  insightType: string
  title: string
  description: string
  severity: Severity
  confidence: number
  metrics: Record<string, unknown>
  periodStart: string
  periodEnd: string
  createdAt: string
}

export interface GrowthRecommendation {
  id: string
  userId: string
  funnelId: string | null
  recommendationType: string
  title: string
  description: string
  rationale: string
  priority: Priority
  confidence: number
  expectedLiftMin: number | null
  expectedLiftMax: number | null
  effort: 'low' | 'medium' | 'high'
  metadata: Record<string, unknown>
  status: 'open' | 'applied' | 'dismissed' | 'archived'
  createdAt: string
}

export interface GrowthAlert {
  id: string
  userId: string
  funnelId: string | null
  alertType: string
  title: string
  message: string
  severity: Severity
  state: 'active' | 'resolved' | 'ignored'
  payload: Record<string, unknown>
  triggeredAt: string
}

export interface FunnelPerformanceScore {
  funnelId: string
  funnelName: string
  score: number
  conversionRate: number
  engagementRate: number
  ctr: number
  bounceRate: number
  totalViews: number
  totalClicks: number
  totalLeads: number
  totalConversions: number
  totalRevenue: number
  previousConversionRate: number
  conversionRateDeltaPct: number
}

export interface PagePerformanceDiagnostic {
  funnelId: string
  pageKey: string
  pageId: string | null
  pageSlug: string | null
  pageName: string
  views: number
  leadSubmits: number
  ctaClicks: number
  conversionRate: number
  ctr: number
  bounceRate: number
}

export interface FunnelDropoffPoint {
  funnelId: string
  fromPageKey: string
  toPageKey: string
  fromPageName: string
  toPageName: string
  fromSessions: number
  toSessions: number
  dropoffRate: number
}

export interface GrowthAssistantResult {
  userId: string
  range: GrowthRange
  generatedAt: string
  periodStart: string
  periodEnd: string
  funnelScores: FunnelPerformanceScore[]
  pageDiagnostics: PagePerformanceDiagnostic[]
  dropoffPoints: FunnelDropoffPoint[]
  insights: GrowthInsight[]
  recommendations: GrowthRecommendation[]
  alerts: GrowthAlert[]
}

export interface GrowthAssistantOptions {
  range?: GrowthRange
  funnelId?: string
  persist?: boolean
}
