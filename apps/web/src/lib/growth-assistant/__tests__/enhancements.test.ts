import {
  buildABTestSuggestions,
  buildForecasts,
  buildOptimizationIdeas,
  buildPlainEnglishInsights,
  buildWeeklySummary,
  type FunnelForecastSeed,
} from '@/lib/growth-assistant/enhancements'
import type {
  FunnelPerformanceScore,
  GrowthAlert,
  GrowthInsight,
  GrowthRecommendation,
} from '@/lib/growth-assistant/types'

function sampleFunnelScore(overrides: Partial<FunnelPerformanceScore> = {}): FunnelPerformanceScore {
  return {
    funnelId: 'funnel-1',
    funnelName: 'Main Funnel',
    score: 41.2,
    conversionRate: 1.4,
    engagementRate: 2.1,
    ctr: 1.8,
    bounceRate: 74.3,
    totalViews: 1200,
    totalClicks: 180,
    totalLeads: 25,
    totalConversions: 3,
    totalRevenue: 245.5,
    previousConversionRate: 2.2,
    conversionRateDeltaPct: -36.36,
    ...overrides,
  }
}

function sampleRecommendation(overrides: Partial<GrowthRecommendation> = {}): GrowthRecommendation {
  return {
    id: 'reco-1',
    userId: 'user-1',
    funnelId: 'funnel-1',
    recommendationType: 'cta_optimization',
    title: 'Improve CTA clarity',
    description: 'Make CTA copy clearer and more specific.',
    rationale: 'CTR is below target.',
    priority: 'high',
    confidence: 0.8,
    expectedLiftMin: 6,
    expectedLiftMax: 16,
    effort: 'low',
    metadata: {},
    status: 'open',
    createdAt: '2026-04-23T00:00:00.000Z',
    ...overrides,
  }
}

describe('growth assistant enhancements', () => {
  it('builds weekly forecasts from recent performance seeds', () => {
    const seeds: FunnelForecastSeed[] = [{
      funnelId: 'funnel-1',
      funnelName: 'Main Funnel',
      currentClicks: 180,
      previousClicks: 220,
      currentConversions: 3,
      previousConversions: 5,
      currentRevenue: 245.5,
      previousRevenue: 320,
      currentConversionRate: 1.4,
      previousConversionRate: 2.2,
      currentCtr: 1.8,
      previousCtr: 2.6,
    }]

    const forecasts = buildForecasts({
      range: '7d',
      generatedAt: '2026-04-23T00:00:00.000Z',
      seeds,
    })

    expect(forecasts).toHaveLength(1)
    expect(forecasts[0].horizon).toBe('7d')
    expect(forecasts[0].model).toBe('weighted_trend')
    expect(forecasts[0].predictedClicks).toBeGreaterThanOrEqual(0)
    expect(forecasts[0].confidence).toBeGreaterThanOrEqual(0.35)
    expect(forecasts[0].confidence).toBeLessThanOrEqual(0.9)
  })

  it('generates projected weekly summaries for non-7d ranges', () => {
    const seeds: FunnelForecastSeed[] = [{
      funnelId: 'funnel-1',
      funnelName: 'Main Funnel',
      currentClicks: 600,
      previousClicks: 500,
      currentConversions: 18,
      previousConversions: 12,
      currentRevenue: 1800,
      previousRevenue: 1300,
      currentConversionRate: 3,
      previousConversionRate: 2.4,
      currentCtr: 3.8,
      previousCtr: 3.1,
    }]

    const summary = buildWeeklySummary({
      userId: 'user-1',
      range: '30d',
      generatedAt: '2026-04-23T00:00:00.000Z',
      funnelScores: [sampleFunnelScore({
        score: 73,
        ctr: 3.8,
        conversionRate: 3,
        totalViews: 4200,
        totalClicks: 600,
        totalConversions: 18,
        totalRevenue: 1800,
      })],
      seeds,
      alerts: [],
      recommendations: [sampleRecommendation()],
    })

    expect(summary.projectedFromRange).toBe(true)
    expect(summary.sourceRangeDays).toBe(30)
    expect(summary.summary.toLowerCase()).toContain('projected weekly summary')
    expect(summary.totals.clicks).toBeGreaterThan(0)
  })

  it('returns deterministic AB test suggestions when AI is disabled', async () => {
    const suggestions = await buildABTestSuggestions({
      userId: 'user-1',
      generatedAt: '2026-04-23T00:00:00.000Z',
      funnelScores: [sampleFunnelScore()],
      insights: [],
      recommendations: [sampleRecommendation()],
      useAi: false,
    })

    expect(suggestions.length).toBeGreaterThan(0)
    expect(suggestions[0].source).toBe('rule_engine')
    expect(suggestions[0].variantA.changes.length).toBeGreaterThan(0)
    expect(suggestions[0].variantB.changes.length).toBeGreaterThan(0)
  })

  it('converts technical insights into plain-English explanations', () => {
    const insights: GrowthInsight[] = [{
      id: 'insight-1',
      userId: 'user-1',
      funnelId: 'funnel-1',
      insightType: 'conversion_drop',
      title: 'Conversion rate dropped',
      description: 'Conversion rate moved from 2.2% to 1.4%.',
      severity: 'high',
      confidence: 0.86,
      metrics: {},
      periodStart: '2026-04-16T00:00:00.000Z',
      periodEnd: '2026-04-23T00:00:00.000Z',
      createdAt: '2026-04-23T00:00:00.000Z',
    }]

    const recommendations: GrowthRecommendation[] = [sampleRecommendation()]
    const alerts: GrowthAlert[] = [{
      id: 'alert-1',
      userId: 'user-1',
      funnelId: 'funnel-1',
      alertType: 'conversion_drop',
      title: 'Conversion decline detected',
      message: 'Main Funnel conversion rate is down.',
      severity: 'high',
      state: 'active',
      payload: {},
      triggeredAt: '2026-04-23T00:00:00.000Z',
    }]

    const plain = buildPlainEnglishInsights({
      userId: 'user-1',
      generatedAt: '2026-04-23T00:00:00.000Z',
      insights,
      recommendations,
      alerts,
    })

    expect(plain).toHaveLength(1)
    expect(plain[0].nextStep).toContain('Improve CTA clarity')
    expect(plain[0].whyItMatters.length).toBeGreaterThan(10)
  })

  it('creates automatic optimization ideas from recommendations and forecasts', () => {
    const recommendations: GrowthRecommendation[] = [sampleRecommendation()]
    const forecasts = buildForecasts({
      range: '7d',
      generatedAt: '2026-04-23T00:00:00.000Z',
      seeds: [{
        funnelId: 'funnel-1',
        funnelName: 'Main Funnel',
        currentClicks: 200,
        previousClicks: 330,
        currentConversions: 4,
        previousConversions: 10,
        currentRevenue: 220,
        previousRevenue: 540,
        currentConversionRate: 2,
        previousConversionRate: 3.03,
        currentCtr: 2.5,
        previousCtr: 4.2,
      }],
    })

    const ideas = buildOptimizationIdeas({
      userId: 'user-1',
      generatedAt: '2026-04-23T00:00:00.000Z',
      recommendations,
      forecasts,
    })

    expect(ideas.length).toBeGreaterThan(0)
    expect(ideas[0].actions.length).toBeGreaterThan(0)
    expect(ideas.some((item) => item.source === 'forecast' || item.source === 'rule_engine')).toBe(true)
  })
})
