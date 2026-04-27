import { AI_MODELS, openai } from '@/lib/openai'
import type {
  ABTestSuggestion,
  FunnelOptimizationIdea,
  FunnelPerformanceScore,
  GrowthAlert,
  GrowthInsight,
  GrowthRange,
  GrowthRecommendation,
  PerformanceForecast,
  PlainEnglishInsight,
  Priority,
  Severity,
  WeeklyPerformanceSummary,
} from './types'

export type FunnelForecastSeed = {
  funnelId: string
  funnelName: string
  currentClicks: number
  previousClicks: number
  currentConversions: number
  previousConversions: number
  currentRevenue: number
  previousRevenue: number
  currentConversionRate: number
  previousConversionRate: number
  currentCtr: number
  previousCtr: number
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

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value)
}

function toString(value: unknown, fallback = ''): string {
  if (typeof value !== 'string') return fallback
  const normalized = value.trim()
  return normalized || fallback
}

function toStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return []
  return value
    .map((item) => (typeof item === 'string' ? item.trim() : ''))
    .filter((item) => item.length > 0)
}

function uniqueStrings(values: string[]): string[] {
  return Array.from(new Set(values.filter((value) => value.trim().length > 0)))
}

function makeId(prefix: string, seed: string) {
  const sanitized = seed.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
  return `${prefix}-${sanitized || 'item'}`
}

function getRangeDays(range: GrowthRange): number {
  if (range === '24h') return 1
  if (range === '30d') return 30
  if (range === '90d') return 90
  return 7
}

function projectForward(current: number, previous: number, minRatio: number, maxRatio: number) {
  if (current <= 0 && previous <= 0) return 0
  if (previous <= 0) return current
  const rawRatio = current / Math.max(previous, 1)
  const dampened = 1 + ((rawRatio - 1) * 0.6)
  const bounded = clamp(dampened, minRatio, maxRatio)
  return current * bounded
}

function severityOrder(value: Severity | Priority) {
  const order: Record<Severity | Priority, number> = {
    critical: 4,
    high: 3,
    medium: 2,
    low: 1,
  }
  return order[value]
}

function inferObjective(value: unknown): ABTestSuggestion['objective'] {
  if (value === 'ctr' || value === 'lead_rate' || value === 'bounce_rate') return value
  return 'conversion_rate'
}

function parseABVariant(value: unknown, fallbackName: string, fallbackChanges: string[]): ABTestSuggestion['variantA'] {
  if (!isRecord(value)) {
    return {
      name: fallbackName,
      changes: fallbackChanges,
    }
  }
  return {
    name: toString(value.name, fallbackName),
    changes: toStringArray(value.changes).slice(0, 5).length > 0
      ? toStringArray(value.changes).slice(0, 5)
      : fallbackChanges,
  }
}

function buildHeuristicABTests(params: {
  userId: string
  generatedAt: string
  funnelScores: FunnelPerformanceScore[]
}): ABTestSuggestion[] {
  const { userId, generatedAt, funnelScores } = params
  const suggestions: ABTestSuggestion[] = []

  const pushSuggestion = (item: ABTestSuggestion) => {
    const key = `${item.funnelId || 'all'}:${item.title.toLowerCase()}`
    const exists = suggestions.some((entry) => `${entry.funnelId || 'all'}:${entry.title.toLowerCase()}` === key)
    if (!exists) suggestions.push(item)
  }

  for (const score of funnelScores) {
    if (score.totalViews >= 100 && score.ctr < 2.5) {
      pushSuggestion({
        id: makeId('ab', `${score.funnelId}-cta-copy-placement`),
        userId,
        funnelId: score.funnelId,
        title: `CTA messaging test for ${score.funnelName}`,
        objective: 'ctr',
        hypothesis: 'Making the CTA clearer and more benefit-led should increase click-through rate.',
        variantA: {
          name: 'Benefit-First CTA',
          changes: [
            'Use an action + benefit CTA label',
            'Add one line of urgency microcopy under the CTA',
            'Place the CTA in the top section',
          ],
        },
        variantB: {
          name: 'Proof-Led CTA',
          changes: [
            'Keep CTA concise and direct',
            'Add social proof immediately above the CTA',
            'Repeat the CTA at the end of the section',
          ],
        },
        expectedLiftMin: 5,
        expectedLiftMax: 16,
        confidence: 0.77,
        source: 'rule_engine',
        createdAt: generatedAt,
      })
    }

    if (score.totalClicks >= 80 && score.conversionRate < 2) {
      pushSuggestion({
        id: makeId('ab', `${score.funnelId}-headline-offer-angle`),
        userId,
        funnelId: score.funnelId,
        title: `Headline and offer angle test for ${score.funnelName}`,
        objective: 'conversion_rate',
        hypothesis: 'Matching headline language more tightly to audience pain points should improve conversion.',
        variantA: {
          name: 'Pain-Point Lead',
          changes: [
            'Open with the main customer pain',
            'Show the first result visitors can expect',
            'Use a direct and concrete CTA label',
          ],
        },
        variantB: {
          name: 'Outcome-First Lead',
          changes: [
            'Lead with desired outcome in the headline',
            'Add 2 trust bullets above the fold',
            'Use a low-friction CTA (no commitment framing)',
          ],
        },
        expectedLiftMin: 7,
        expectedLiftMax: 20,
        confidence: 0.8,
        source: 'rule_engine',
        createdAt: generatedAt,
      })
    }

    if (score.totalViews >= 100 && score.bounceRate >= 70) {
      pushSuggestion({
        id: makeId('ab', `${score.funnelId}-hero-friction-reduction`),
        userId,
        funnelId: score.funnelId,
        title: `First-screen friction test for ${score.funnelName}`,
        objective: 'bounce_rate',
        hypothesis: 'Reducing first-screen complexity should lower bounce and increase downstream actions.',
        variantA: {
          name: 'Minimal Hero',
          changes: [
            'Use one short headline and one supporting line',
            'Keep a single primary CTA on first view',
            'Remove non-essential visual elements',
          ],
        },
        variantB: {
          name: 'Guided Hero',
          changes: [
            'Add a clear 3-step preview of the process',
            'Use one trust signal near the CTA',
            'Show explicit next-step expectations',
          ],
        },
        expectedLiftMin: 6,
        expectedLiftMax: 18,
        confidence: 0.75,
        source: 'rule_engine',
        createdAt: generatedAt,
      })
    }
  }

  if (suggestions.length === 0) {
    const top = funnelScores[0]
    suggestions.push({
      id: makeId('ab', `${top?.funnelId || 'global'}-baseline-message-test`),
      userId,
      funnelId: top?.funnelId || null,
      title: 'Baseline messaging A/B test',
      objective: 'conversion_rate',
      hypothesis: 'Comparing two distinct messaging angles should reveal the strongest conversion path.',
      variantA: {
        name: 'Clarity Variant',
        changes: [
          'Use plain language focused on one core benefit',
          'Keep CTA text outcome-based',
        ],
      },
      variantB: {
        name: 'Credibility Variant',
        changes: [
          'Lead with social proof before the CTA',
          'Use credibility bullets in the first section',
        ],
      },
      expectedLiftMin: 4,
      expectedLiftMax: 12,
      confidence: 0.7,
      source: 'rule_engine',
      createdAt: generatedAt,
    })
  }

  return suggestions.slice(0, 8)
}

async function buildAiABTests(params: {
  userId: string
  generatedAt: string
  funnelScores: FunnelPerformanceScore[]
  insights: GrowthInsight[]
  recommendations: GrowthRecommendation[]
}): Promise<ABTestSuggestion[]> {
  if (!openai || params.funnelScores.length === 0) return []

  const funnelIds = new Set(params.funnelScores.map((item) => item.funnelId))
  const topFunnels = params.funnelScores.slice(0, 5).map((item) => ({
    funnelId: item.funnelId,
    funnelName: item.funnelName,
    score: item.score,
    conversionRate: item.conversionRate,
    ctr: item.ctr,
    bounceRate: item.bounceRate,
    totalViews: item.totalViews,
    totalClicks: item.totalClicks,
  }))

  const keyInsights = params.insights.slice(0, 6).map((item) => ({
    funnelId: item.funnelId,
    insightType: item.insightType,
    title: item.title,
    description: item.description,
    severity: item.severity,
  }))

  const existingRecommendations = params.recommendations.slice(0, 6).map((item) => ({
    funnelId: item.funnelId,
    recommendationType: item.recommendationType,
    title: item.title,
    description: item.description,
    priority: item.priority,
  }))

  const prompt = `Create high-quality funnel A/B test suggestions from the provided performance snapshot.
Return strict JSON in this shape:
{
  "suggestions": [
    {
      "title": "string",
      "funnelId": "string or null",
      "objective": "ctr|conversion_rate|lead_rate|bounce_rate",
      "hypothesis": "string",
      "variantA": { "name": "string", "changes": ["string"] },
      "variantB": { "name": "string", "changes": ["string"] },
      "expectedLiftMin": 1,
      "expectedLiftMax": 30,
      "confidence": 0.0
    }
  ]
}

Rules:
- Maximum 6 suggestions.
- Every suggestion must be specific and testable.
- Keep each variant to 2-4 concrete changes.
- confidence must be between 0.4 and 0.95.
- expectedLiftMax should be >= expectedLiftMin.

Data:
${JSON.stringify({ topFunnels, keyInsights, existingRecommendations })}`

  try {
    const completion = await openai.chat.completions.create({
      model: AI_MODELS.GPT35,
      messages: [
        {
          role: 'system',
          content: 'You are a conversion-rate optimization strategist. Produce practical A/B tests in strict JSON.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.4,
      max_tokens: 1200,
      response_format: { type: 'json_object' },
    })

    const raw = completion.choices[0]?.message?.content
    if (!raw) return []

    const parsed: unknown = JSON.parse(raw)
    if (!isRecord(parsed) || !Array.isArray(parsed.suggestions)) return []

    const suggestions: ABTestSuggestion[] = []
    for (const [index, item] of parsed.suggestions.entries()) {
      if (!isRecord(item)) continue
      const title = toString(item.title)
      const hypothesis = toString(item.hypothesis)
      if (!title || !hypothesis) continue

      const rawFunnelId = toString(item.funnelId)
      const funnelId = rawFunnelId && funnelIds.has(rawFunnelId) ? rawFunnelId : null
      const expectedLiftMin = Math.max(0, Math.round(toNumber(item.expectedLiftMin)))
      const expectedLiftMax = Math.max(expectedLiftMin, Math.round(toNumber(item.expectedLiftMax)))
      const confidence = Number(clamp(toNumber(item.confidence), 0.4, 0.95).toFixed(2))

      suggestions.push({
        id: makeId('ab-ai', `${funnelId || 'all'}-${title}-${index + 1}`),
        userId: params.userId,
        funnelId,
        title,
        objective: inferObjective(item.objective),
        hypothesis,
        variantA: parseABVariant(item.variantA, 'Variant A', ['Rewrite headline for clarity', 'Adjust CTA copy']),
        variantB: parseABVariant(item.variantB, 'Variant B', ['Add social proof near CTA', 'Adjust offer framing']),
        expectedLiftMin: Number.isFinite(expectedLiftMin) ? expectedLiftMin : null,
        expectedLiftMax: Number.isFinite(expectedLiftMax) ? expectedLiftMax : null,
        confidence,
        source: 'ai',
        createdAt: params.generatedAt,
      })
    }

    return suggestions.slice(0, 6)
  } catch (error) {
    console.warn('buildAiABTests failed, using rule-based suggestions:', error)
    return []
  }
}

export async function buildABTestSuggestions(params: {
  userId: string
  generatedAt: string
  funnelScores: FunnelPerformanceScore[]
  insights: GrowthInsight[]
  recommendations: GrowthRecommendation[]
  useAi?: boolean
}): Promise<ABTestSuggestion[]> {
  const heuristic = buildHeuristicABTests(params)
  const aiSuggestions = params.useAi === false ? [] : await buildAiABTests(params)

  const merged: ABTestSuggestion[] = []
  const seen = new Set<string>()
  const push = (item: ABTestSuggestion) => {
    const key = `${item.funnelId || 'all'}:${item.objective}:${item.title.toLowerCase()}`
    if (seen.has(key)) return
    seen.add(key)
    merged.push(item)
  }

  for (const item of aiSuggestions) push(item)
  for (const item of heuristic) push(item)

  return merged.slice(0, 8)
}

function recommendationActions(recommendationType: string): string[] {
  switch (recommendationType) {
    case 'cta_optimization':
      return [
        'Move primary CTA higher in the page',
        'Test two to three CTA copy variants',
        'Add one supporting line below the CTA',
      ]
    case 'headline_offer_test':
      return [
        'Create two headline angles (pain-first and outcome-first)',
        'Align hero copy with traffic source intent',
        'Test proof placement near first CTA',
      ]
    case 'layout_simplification':
      return [
        'Reduce first-screen elements to one core message',
        'Keep one primary action in hero',
        'Remove visual clutter that distracts from CTA',
      ]
    case 'step_dropoff_optimization':
      return [
        'Add a continuity sentence between steps',
        'Clarify the expected next action',
        'Place trust proof close to transition CTA',
      ]
    default:
      return ['Prioritize the highest-friction step', 'Run one focused test per week', 'Track impact against baseline']
  }
}

export function buildOptimizationIdeas(params: {
  userId: string
  generatedAt: string
  recommendations: GrowthRecommendation[]
  forecasts: PerformanceForecast[]
}): FunnelOptimizationIdea[] {
  const ideas: FunnelOptimizationIdea[] = []
  const push = (item: FunnelOptimizationIdea) => {
    const key = `${item.funnelId || 'all'}:${item.title.toLowerCase()}`
    if (!ideas.some((entry) => `${entry.funnelId || 'all'}:${entry.title.toLowerCase()}` === key)) {
      ideas.push(item)
    }
  }

  for (const recommendation of params.recommendations.slice(0, 8)) {
    push({
      id: makeId('opt', `${recommendation.funnelId || 'all'}-${recommendation.recommendationType}`),
      userId: params.userId,
      funnelId: recommendation.funnelId,
      title: recommendation.title,
      description: recommendation.description,
      priority: recommendation.priority,
      effort: recommendation.effort,
      expectedLiftMin: recommendation.expectedLiftMin,
      expectedLiftMax: recommendation.expectedLiftMax,
      actions: recommendationActions(recommendation.recommendationType),
      source: 'rule_engine',
      createdAt: params.generatedAt,
    })
  }

  for (const forecast of params.forecasts) {
    const baseline = forecast.baselineConversionRate
    const predicted = forecast.predictedConversionRate
    if (baseline <= 0) continue
    const deltaPct = ((predicted - baseline) / baseline) * 100
    if (deltaPct > -10) continue

    push({
      id: makeId('opt', `${forecast.funnelId}-forecast-decline`),
      userId: params.userId,
      funnelId: forecast.funnelId,
      title: `Prevent projected conversion decline in ${forecast.funnelName}`,
      description: `Forecast indicates a potential ${Math.abs(deltaPct).toFixed(1)}% conversion-rate decline next week without intervention.`,
      priority: Math.abs(deltaPct) >= 20 ? 'critical' : 'high',
      effort: 'medium',
      expectedLiftMin: Math.round(Math.abs(deltaPct) * 0.4),
      expectedLiftMax: Math.round(Math.abs(deltaPct) * 0.8),
      actions: [
        'Run one high-impact A/B test on first-screen messaging',
        'Audit CTA clarity and visual prominence',
        'Review traffic-source to offer alignment',
      ],
      source: 'forecast',
      createdAt: params.generatedAt,
    })
  }

  ideas.sort((a, b) => {
    const byPriority = severityOrder(b.priority) - severityOrder(a.priority)
    if (byPriority !== 0) return byPriority
    return toNumber(b.expectedLiftMax) - toNumber(a.expectedLiftMax)
  })

  return ideas.slice(0, 10)
}

function plainEnglishWhyItMatters(insight: GrowthInsight) {
  switch (insight.insightType) {
    case 'conversion_drop':
      return 'When conversion drops, you pay the same for traffic but get fewer results.'
    case 'low_cta_ctr':
      return 'Low CTA clicks usually mean visitors are not motivated to take the next step.'
    case 'high_bounce_rate':
      return 'A high bounce rate means most visitors leave before seeing your full offer.'
    case 'dropoff_point':
      return 'Drop-off between steps means people are interested at first, then lose momentum.'
    case 'high_traffic_low_conversion':
      return 'Traffic is arriving, but the funnel is not turning enough visits into leads or sales.'
    default:
      return 'This signal points to friction that is limiting funnel performance.'
  }
}

export function buildPlainEnglishInsights(params: {
  userId: string
  generatedAt: string
  insights: GrowthInsight[]
  recommendations: GrowthRecommendation[]
  alerts: GrowthAlert[]
}): PlainEnglishInsight[] {
  const results: PlainEnglishInsight[] = []
  const highAlert = params.alerts.find((alert) => alert.severity === 'critical' || alert.severity === 'high')

  for (const insight of params.insights.slice(0, 8)) {
    const matchingRecommendation = params.recommendations.find(
      (item) => item.funnelId === insight.funnelId
    ) || params.recommendations[0]

    const nextStep = matchingRecommendation
      ? matchingRecommendation.title
      : 'Run one targeted A/B test on headline and CTA copy this week.'

    const emphasis = highAlert && highAlert.funnelId === insight.funnelId
      ? 'This is urgent because a high-severity alert is active for the same funnel.'
      : `Severity is ${insight.severity}, so it should be addressed ${insight.severity === 'low' ? 'after higher-priority items' : 'soon'}.`

    results.push({
      id: makeId('plain', `${insight.id}`),
      insightId: insight.id,
      userId: params.userId,
      funnelId: insight.funnelId,
      severity: insight.severity,
      title: insight.title,
      explanation: `${insight.description} ${emphasis}`,
      whyItMatters: plainEnglishWhyItMatters(insight),
      nextStep,
      createdAt: params.generatedAt,
    })
  }

  return results
}

export function buildForecasts(params: {
  range: GrowthRange
  generatedAt: string
  seeds: FunnelForecastSeed[]
}): PerformanceForecast[] {
  const rangeDays = getRangeDays(params.range)
  const scaleToWeek = 7 / Math.max(rangeDays, 1)
  const forecasts: PerformanceForecast[] = []

  for (const seed of params.seeds) {
    const baselineClicks = Math.max(0, Math.round(seed.currentClicks * scaleToWeek))
    const baselineConversions = Math.max(0, Math.round(seed.currentConversions * scaleToWeek))
    const baselineRevenue = Math.max(0, Number((seed.currentRevenue * scaleToWeek).toFixed(2)))

    const previousClicks = Math.max(0, seed.previousClicks * scaleToWeek)
    const previousConversions = Math.max(0, seed.previousConversions * scaleToWeek)
    const previousRevenue = Math.max(0, seed.previousRevenue * scaleToWeek)

    const predictedClicks = Math.max(0, Math.round(projectForward(baselineClicks, previousClicks, 0.65, 1.55)))
    const projectedConversionsRaw = projectForward(baselineConversions, previousConversions, 0.6, 1.7)
    const predictedConversions = Math.max(0, Math.min(predictedClicks, Math.round(projectedConversionsRaw)))
    const predictedRevenue = Number(projectForward(baselineRevenue, previousRevenue, 0.65, 1.7).toFixed(2))

    const baselineConversionRate = baselineClicks > 0 ? (baselineConversions / baselineClicks) * 100 : seed.currentConversionRate
    const baselineCtr = seed.currentCtr
    const predictedConversionRate = predictedClicks > 0
      ? (predictedConversions / predictedClicks) * 100
      : baselineConversionRate
    const predictedCtr = clamp(projectForward(seed.currentCtr, seed.previousCtr, 0.7, 1.35), 0, 100)

    const volumeSignal = clamp((baselineClicks + previousClicks) / 300, 0, 1)
    const volatility = clamp(
      Math.abs(seed.currentClicks - seed.previousClicks) / Math.max(seed.currentClicks, seed.previousClicks, 1),
      0,
      1
    )
    const confidence = Number(clamp(0.45 + (volumeSignal * 0.35) + ((1 - volatility) * 0.2), 0.35, 0.9).toFixed(2))

    forecasts.push({
      id: makeId('forecast', seed.funnelId),
      funnelId: seed.funnelId,
      funnelName: seed.funnelName,
      baselineClicks,
      baselineConversions,
      baselineRevenue,
      baselineConversionRate: Number(clamp(baselineConversionRate, 0, 100).toFixed(2)),
      baselineCtr: Number(clamp(baselineCtr, 0, 100).toFixed(2)),
      predictedClicks,
      predictedConversions,
      predictedRevenue,
      predictedConversionRate: Number(clamp(predictedConversionRate, 0, 100).toFixed(2)),
      predictedCtr: Number(clamp(predictedCtr, 0, 100).toFixed(2)),
      horizon: '7d',
      model: 'weighted_trend',
      confidence,
      assumptions: [
        'Traffic mix remains close to recent patterns.',
        'Offer and pricing stay stable during the forecast horizon.',
        'No major tracking disruptions occur.',
      ],
      generatedAt: params.generatedAt,
    })
  }

  forecasts.sort((a, b) => b.predictedRevenue - a.predictedRevenue)
  return forecasts
}

export function buildWeeklySummary(params: {
  userId: string
  range: GrowthRange
  generatedAt: string
  funnelScores: FunnelPerformanceScore[]
  seeds: FunnelForecastSeed[]
  alerts: GrowthAlert[]
  recommendations: GrowthRecommendation[]
}): WeeklyPerformanceSummary {
  const rangeDays = getRangeDays(params.range)
  const scaleToWeek = 7 / Math.max(rangeDays, 1)
  const projectedFromRange = rangeDays !== 7

  const totalViewsRaw = params.funnelScores.reduce((sum, item) => sum + item.totalViews, 0)
  const totalLeadsRaw = params.funnelScores.reduce((sum, item) => sum + item.totalLeads, 0)
  const totalClicksRaw = params.seeds.reduce((sum, item) => sum + item.currentClicks, 0)
  const totalConversionsRaw = params.seeds.reduce((sum, item) => sum + item.currentConversions, 0)
  const totalRevenueRaw = params.seeds.reduce((sum, item) => sum + item.currentRevenue, 0)
  const previousClicksRaw = params.seeds.reduce((sum, item) => sum + item.previousClicks, 0)
  const previousConversionsRaw = params.seeds.reduce((sum, item) => sum + item.previousConversions, 0)

  const weightedBounce = totalViewsRaw > 0
    ? params.funnelScores.reduce((sum, item) => sum + (item.bounceRate * item.totalViews), 0) / totalViewsRaw
    : 0

  const views = Math.round(totalViewsRaw * scaleToWeek)
  const leads = Math.round(totalLeadsRaw * scaleToWeek)
  const clicks = Math.round(totalClicksRaw * scaleToWeek)
  const conversions = Math.round(totalConversionsRaw * scaleToWeek)
  const revenue = Number((totalRevenueRaw * scaleToWeek).toFixed(2))
  const conversionRate = clicks > 0 ? (conversions / clicks) * 100 : 0
  const ctr = views > 0 ? (clicks / views) * 100 : 0
  const engagementRate = views > 0 ? (leads / views) * 100 : 0
  const previousConversionRate = previousClicksRaw > 0 ? (previousConversionsRaw / previousClicksRaw) * 100 : 0
  const conversionTrendPct = previousConversionRate > 0
    ? ((conversionRate - previousConversionRate) / previousConversionRate) * 100
    : 0

  const topFunnels = [...params.funnelScores]
    .sort((a, b) => b.score - a.score)
    .slice(0, 3)
    .map((item) => ({
      funnelId: item.funnelId,
      funnelName: item.funnelName,
      score: item.score,
      conversionRate: item.conversionRate,
      revenue: Number((item.totalRevenue * scaleToWeek).toFixed(2)),
    }))

  const keyWins: string[] = []
  if (conversionTrendPct >= 5) keyWins.push(`Conversion rate improved ${conversionTrendPct.toFixed(1)}% versus the prior period.`)
  if (revenue > 0) keyWins.push(`Estimated weekly revenue is ${new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(revenue)}.`)
  if (topFunnels[0]?.score >= 70) keyWins.push(`${topFunnels[0].funnelName} is performing strongly with a score of ${topFunnels[0].score.toFixed(1)}.`)
  if (keyWins.length === 0) keyWins.push('Baseline performance data is now available for optimization planning.')

  const watchouts: string[] = []
  for (const alert of params.alerts.slice(0, 3)) {
    watchouts.push(alert.message)
  }
  const weakest = [...params.funnelScores].sort((a, b) => a.score - b.score)[0]
  if (weakest && weakest.score < 45) {
    watchouts.push(`${weakest.funnelName} is below healthy score threshold (${weakest.score.toFixed(1)}).`)
  }
  if (watchouts.length === 0) watchouts.push('No critical warnings detected in the current weekly snapshot.')

  const recommendedFocus = uniqueStrings(
    params.recommendations.slice(0, 3).map((item) => item.title)
  )
  if (recommendedFocus.length === 0) {
    recommendedFocus.push('Run one A/B test on headline and CTA copy.', 'Review top drop-off step and remove friction.')
  }

  const headline = params.funnelScores.length === 0
    ? 'No funnel performance data available yet.'
    : conversionTrendPct >= 5
      ? 'Weekly momentum is positive.'
      : conversionTrendPct <= -5
        ? 'Weekly performance needs intervention.'
        : 'Weekly performance is stable with optimization headroom.'

  const summary = params.funnelScores.length === 0
    ? 'Publish at least one funnel and send traffic to generate a weekly performance report.'
    : projectedFromRange
      ? `Projected weekly summary based on the last ${rangeDays} day${rangeDays === 1 ? '' : 's'}: ${clicks.toLocaleString()} clicks, ${conversions.toLocaleString()} conversions, and ${new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(revenue)} revenue.`
      : `This week produced ${clicks.toLocaleString()} clicks, ${conversions.toLocaleString()} conversions, and ${new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(revenue)} revenue.`

  const weekEnd = new Date(params.generatedAt)
  const weekStart = new Date(weekEnd)
  weekStart.setUTCDate(weekStart.getUTCDate() - 7)

  return {
    id: makeId('weekly', `${params.userId}-${weekEnd.toISOString().slice(0, 10)}`),
    userId: params.userId,
    weekStart: weekStart.toISOString(),
    weekEnd: weekEnd.toISOString(),
    sourceRangeDays: rangeDays,
    projectedFromRange,
    headline,
    summary,
    keyWins: keyWins.slice(0, 4),
    watchouts: watchouts.slice(0, 4),
    recommendedFocus: recommendedFocus.slice(0, 4),
    totals: {
      views,
      clicks,
      leads,
      conversions,
      revenue,
      conversionRate: Number(conversionRate.toFixed(2)),
      ctr: Number(ctr.toFixed(2)),
      engagementRate: Number(engagementRate.toFixed(2)),
      bounceRate: Number(weightedBounce.toFixed(2)),
    },
    topFunnels,
    createdAt: params.generatedAt,
  }
}
