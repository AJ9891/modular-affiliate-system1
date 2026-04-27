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

export interface ABTestVariantSuggestion {
  name: string
  changes: string[]
}

export interface ABTestSuggestion {
  id: string
  userId: string
  funnelId: string | null
  title: string
  objective: 'ctr' | 'conversion_rate' | 'lead_rate' | 'bounce_rate'
  hypothesis: string
  variantA: ABTestVariantSuggestion
  variantB: ABTestVariantSuggestion
  expectedLiftMin: number | null
  expectedLiftMax: number | null
  confidence: number
  source: 'ai' | 'rule_engine'
  createdAt: string
}

export interface FunnelOptimizationIdea {
  id: string
  userId: string
  funnelId: string | null
  title: string
  description: string
  priority: Priority
  effort: 'low' | 'medium' | 'high'
  expectedLiftMin: number | null
  expectedLiftMax: number | null
  actions: string[]
  source: 'forecast' | 'rule_engine'
  createdAt: string
}

export interface PlainEnglishInsight {
  id: string
  insightId: string | null
  userId: string
  funnelId: string | null
  severity: Severity
  title: string
  explanation: string
  whyItMatters: string
  nextStep: string
  createdAt: string
}

export interface WeeklyPerformanceSummary {
  id: string
  userId: string
  weekStart: string
  weekEnd: string
  sourceRangeDays: number
  projectedFromRange: boolean
  headline: string
  summary: string
  keyWins: string[]
  watchouts: string[]
  recommendedFocus: string[]
  totals: {
    views: number
    clicks: number
    leads: number
    conversions: number
    revenue: number
    conversionRate: number
    ctr: number
    engagementRate: number
    bounceRate: number
  }
  topFunnels: Array<{
    funnelId: string
    funnelName: string
    score: number
    conversionRate: number
    revenue: number
  }>
  createdAt: string
}

export interface PerformanceForecast {
  id: string
  funnelId: string
  funnelName: string
  baselineClicks: number
  baselineConversions: number
  baselineRevenue: number
  baselineConversionRate: number
  baselineCtr: number
  predictedClicks: number
  predictedConversions: number
  predictedRevenue: number
  predictedConversionRate: number
  predictedCtr: number
  horizon: '7d'
  model: 'weighted_trend'
  confidence: number
  assumptions: string[]
  generatedAt: string
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
  abTestSuggestions: ABTestSuggestion[]
  optimizationIdeas: FunnelOptimizationIdea[]
  plainEnglishInsights: PlainEnglishInsight[]
  weeklySummary: WeeklyPerformanceSummary
  forecasts: PerformanceForecast[]
}

export interface GrowthAssistantOptions {
  range?: GrowthRange
  funnelId?: string
  persist?: boolean
}
