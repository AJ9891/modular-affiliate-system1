'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { Moon, RefreshCw, SlidersHorizontal, Sun } from 'lucide-react'
import { getDashboardData, type DashboardData } from '@/lib/api/dashboard'
import { getAlerts, getGrowthSnapshot, getRecommendations } from '@/lib/api/growth-assistant'
import type {
  ABTestSuggestion,
  FunnelOptimizationIdea,
  FunnelPerformanceScore,
  GrowthAlert,
  GrowthInsight,
  GrowthRecommendation,
  PerformanceForecast,
  PlainEnglishInsight,
  WeeklyPerformanceSummary,
} from '@/lib/growth-assistant/types'
import DashboardSkeleton from './DashboardSkeleton'
import {
  VisitorsPanel,
  ConversionsPanel,
  RevenuePanel,
  SubscribersPanel,
  TrafficChartPanel,
  FunnelPerformancePanel,
  PerformanceScorePanel,
  AffiliateEarningsPanel,
  RecentActivityPanel,
  InsightsPanel,
  RecommendationsFeedPanel,
  AlertsPanel,
  QuickActionsPanel,
  ABTestSuggestionsPanel,
  OptimizationIdeasPanel,
  PlainEnglishInsightsPanel,
  WeeklySummaryReportPanel,
  PerformanceForecastPanel,
} from './panels'

const DASHBOARD_THEME_STORAGE_KEY = 'lp_dashboard_theme'
const DASHBOARD_WIDGETS_STORAGE_KEY = 'lp_dashboard_widgets'

const ranges = [
  { value: '7d', label: '7d' },
  { value: '30d', label: '30d' },
  { value: '90d', label: '90d' },
] as const

type RangeValue = (typeof ranges)[number]['value']
type DashboardTheme = 'dark' | 'light'
type WidgetGroup = 'Core Metrics' | 'Performance' | 'Signals' | 'Optimization' | 'Planning'
type WidgetId =
  | 'visitors'
  | 'conversions'
  | 'revenue'
  | 'subscribers'
  | 'trafficChart'
  | 'funnelPerformance'
  | 'performanceScore'
  | 'affiliateEarnings'
  | 'recentActivity'
  | 'insights'
  | 'recommendations'
  | 'alerts'
  | 'plainEnglishInsights'
  | 'abTestSuggestions'
  | 'optimizationIdeas'
  | 'weeklySummary'
  | 'performanceForecast'
  | 'quickActions'
  | 'commandBrief'

interface WidgetDefinition {
  id: WidgetId
  label: string
  description: string
  group: WidgetGroup
}

const widgetGroups: WidgetGroup[] = ['Core Metrics', 'Performance', 'Signals', 'Optimization', 'Planning']

const widgetDefinitions: WidgetDefinition[] = [
  { id: 'visitors', label: 'Visitors', description: 'Top-line traffic volume.', group: 'Core Metrics' },
  { id: 'conversions', label: 'Conversions', description: 'Successful tracked actions.', group: 'Core Metrics' },
  { id: 'revenue', label: 'Revenue', description: 'Attributed gross value.', group: 'Core Metrics' },
  { id: 'subscribers', label: 'Subscribers', description: 'Lead captures in range.', group: 'Core Metrics' },
  { id: 'trafficChart', label: 'Traffic Chart', description: 'Source-level traffic mix.', group: 'Performance' },
  { id: 'funnelPerformance', label: 'Funnel Performance', description: 'Core funnel KPI summary.', group: 'Performance' },
  { id: 'performanceScore', label: 'Performance Scores', description: 'Per-funnel scorecard.', group: 'Performance' },
  { id: 'affiliateEarnings', label: 'Affiliate Earnings', description: 'Revenue and payout health.', group: 'Performance' },
  { id: 'recentActivity', label: 'Recent Activity', description: 'Latest events and triggers.', group: 'Signals' },
  { id: 'insights', label: 'Insights', description: 'AI and system findings.', group: 'Signals' },
  { id: 'recommendations', label: 'Recommendations', description: 'Suggested next actions.', group: 'Signals' },
  { id: 'alerts', label: 'Alerts', description: 'Critical growth notices.', group: 'Signals' },
  { id: 'plainEnglishInsights', label: 'Plain English Insights', description: 'Natural-language explanations.', group: 'Optimization' },
  { id: 'abTestSuggestions', label: 'A/B Test Ideas', description: 'AI-generated experiments.', group: 'Optimization' },
  { id: 'optimizationIdeas', label: 'Optimization Ideas', description: 'Automated funnel improvements.', group: 'Optimization' },
  { id: 'weeklySummary', label: 'Weekly Summary', description: 'Weekly performance recap.', group: 'Planning' },
  { id: 'performanceForecast', label: 'Forecasts', description: 'Predicted performance outlook.', group: 'Planning' },
  { id: 'quickActions', label: 'Quick Actions', description: 'Fast operational controls.', group: 'Planning' },
  { id: 'commandBrief', label: 'Command Brief', description: 'Priority actions and notices.', group: 'Planning' },
]

function getDefaultWidgetVisibility(): Record<WidgetId, boolean> {
  return widgetDefinitions.reduce<Record<WidgetId, boolean>>((visibility, widget) => {
    visibility[widget.id] = true
    return visibility
  }, {} as Record<WidgetId, boolean>)
}

function parseStoredWidgetVisibility(rawValue: string | null): Record<WidgetId, boolean> | null {
  if (!rawValue) return null

  try {
    const parsed = JSON.parse(rawValue) as Partial<Record<WidgetId, unknown>>
    const merged = getDefaultWidgetVisibility()

    for (const widget of widgetDefinitions) {
      const maybeVisible = parsed[widget.id]
      if (typeof maybeVisible === 'boolean') {
        merged[widget.id] = maybeVisible
      }
    }

    return merged
  } catch {
    return null
  }
}

export default function DashboardControlCenter() {
  const [range, setRange] = useState<RangeValue>('7d')
  const [theme, setTheme] = useState<DashboardTheme>('dark')
  const [customizeOpen, setCustomizeOpen] = useState(false)
  const [preferencesReady, setPreferencesReady] = useState(false)
  const [widgetVisibility, setWidgetVisibility] = useState<Record<WidgetId, boolean>>(() => getDefaultWidgetVisibility())
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [refreshSeed, setRefreshSeed] = useState(0)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)
  const [funnelScores, setFunnelScores] = useState<FunnelPerformanceScore[]>([])
  const [insights, setInsights] = useState<GrowthInsight[]>([])
  const [recommendations, setRecommendations] = useState<GrowthRecommendation[]>([])
  const [alerts, setAlerts] = useState<GrowthAlert[]>([])
  const [plainEnglishInsights, setPlainEnglishInsights] = useState<PlainEnglishInsight[]>([])
  const [weeklySummary, setWeeklySummary] = useState<WeeklyPerformanceSummary | null>(null)
  const [forecasts, setForecasts] = useState<PerformanceForecast[]>([])
  const [abTestSuggestions, setAbTestSuggestions] = useState<ABTestSuggestion[]>([])
  const [optimizationIdeas, setOptimizationIdeas] = useState<FunnelOptimizationIdea[]>([])

  useEffect(() => {
    if (typeof window === 'undefined') return

    const storedTheme = window.localStorage.getItem(DASHBOARD_THEME_STORAGE_KEY)
    if (storedTheme === 'dark' || storedTheme === 'light') {
      setTheme(storedTheme)
    }

    const parsedWidgetState = parseStoredWidgetVisibility(window.localStorage.getItem(DASHBOARD_WIDGETS_STORAGE_KEY))
    if (parsedWidgetState) {
      setWidgetVisibility(parsedWidgetState)
    }

    setPreferencesReady(true)
  }, [])

  useEffect(() => {
    if (!preferencesReady || typeof window === 'undefined') return
    window.localStorage.setItem(DASHBOARD_THEME_STORAGE_KEY, theme)
  }, [preferencesReady, theme])

  useEffect(() => {
    if (!preferencesReady || typeof window === 'undefined') return
    window.localStorage.setItem(DASHBOARD_WIDGETS_STORAGE_KEY, JSON.stringify(widgetVisibility))
  }, [preferencesReady, widgetVisibility])

  useEffect(() => {
    let active = true

    async function loadDashboard() {
      try {
        setLoading(true)
        setError(null)
        const [dashboardResult, snapshotResult, recommendationsResult, alertsResult] = await Promise.allSettled([
          getDashboardData(range),
          getGrowthSnapshot({ range, limit: 30 }),
          getRecommendations({ range, limit: 30, status: 'open' }),
          getAlerts({ range, limit: 30, state: 'active' }),
        ])

        if (!active) return

        if (dashboardResult.status === 'rejected') {
          throw dashboardResult.reason
        }

        setData(dashboardResult.value)

        const snapshotPayload = snapshotResult.status === 'fulfilled' ? snapshotResult.value : null

        if (snapshotPayload) {
          setInsights(snapshotPayload.insights)
          setPlainEnglishInsights(snapshotPayload.plainEnglishInsights)
          setFunnelScores(snapshotPayload.funnelScores)
          setWeeklySummary(snapshotPayload.weeklySummary)
          setForecasts(snapshotPayload.forecasts)
          setAbTestSuggestions(snapshotPayload.abTestSuggestions)
          setOptimizationIdeas(snapshotPayload.optimizationIdeas)
        } else {
          setInsights([])
          setPlainEnglishInsights([])
          setFunnelScores([])
          setWeeklySummary(null)
          setForecasts([])
          setAbTestSuggestions([])
          setOptimizationIdeas([])
        }

        const snapshotRecommendations: GrowthRecommendation[] = [
          ...(snapshotPayload?.optimizationIdeas || []).map((item) => ({
            id: item.id,
            userId: item.userId,
            funnelId: item.funnelId,
            recommendationType: 'auto_funnel_optimization',
            title: item.title,
            description: item.description,
            rationale: item.actions.join(' • '),
            priority: item.priority,
            confidence: 0.76,
            expectedLiftMin: item.expectedLiftMin,
            expectedLiftMax: item.expectedLiftMax,
            effort: item.effort,
            metadata: { source: item.source, actions: item.actions },
            status: 'open' as const,
            createdAt: item.createdAt,
          })),
          ...(snapshotPayload?.abTestSuggestions || []).map((item) => ({
            id: item.id,
            userId: item.userId,
            funnelId: item.funnelId,
            recommendationType: 'ab_test_suggestion',
            title: item.title,
            description: item.hypothesis,
            rationale: `${item.variantA.name} vs ${item.variantB.name}`,
            priority: 'high' as const,
            confidence: item.confidence,
            expectedLiftMin: item.expectedLiftMin,
            expectedLiftMax: item.expectedLiftMax,
            effort: 'medium' as const,
            metadata: {
              source: item.source,
              objective: item.objective,
              variantA: item.variantA,
              variantB: item.variantB,
            },
            status: 'open' as const,
            createdAt: item.createdAt,
          })),
        ]

        if (recommendationsResult.status === 'fulfilled') {
          setRecommendations([...recommendationsResult.value, ...snapshotRecommendations].slice(0, 30))
        } else {
          setRecommendations(snapshotRecommendations)
        }

        if (alertsResult.status === 'fulfilled') {
          setAlerts(alertsResult.value)
        } else {
          setAlerts([])
        }

        setLastUpdated(new Date())
      } catch (err) {
        if (!active) return
        setError(err instanceof Error ? err.message : 'Failed to load dashboard data')
      } finally {
        if (active) setLoading(false)
      }
    }

    loadDashboard()
    return () => {
      active = false
    }
  }, [range, refreshSeed])

  const notifications = useMemo(() => {
    if (!data) {
      return [{ level: 'info' as const, message: 'Dashboard telemetry initializing.' }]
    }

    const items: Array<{ level: 'info' | 'warning' | 'success'; message: string }> = []

    if (data.totals.funnels === 0) {
      items.push({ level: 'warning', message: 'No active funnels detected. Create one to start collecting data.' })
    } else {
      items.push({ level: 'success', message: `${data.totals.funnels} funnel(s) currently active.` })
    }

    if (data.totals.conversionRate < 1) {
      items.push({ level: 'warning', message: 'Conversion rate below 1%. Consider refining CTA and offer targeting.' })
    } else {
      items.push({ level: 'info', message: `Conversion rate currently at ${data.totals.conversionRate.toFixed(2)}%.` })
    }

    if (data.recentActivity.length === 0) {
      items.push({ level: 'info', message: 'No recent events. Verify traffic sources and funnel publishing status.' })
    }

    if (alerts.length > 0) {
      items.push({ level: 'warning', message: `${alerts.length} active growth alert(s) need review.` })
    }

    if (weeklySummary?.headline) {
      items.push({ level: 'info', message: weeklySummary.headline })
    }

    if (forecasts.length > 0) {
      const atRisk = forecasts.find((item) => item.predictedConversionRate < item.baselineConversionRate * 0.9)
      if (atRisk) {
        items.push({
          level: 'warning',
          message: `Forecast risk: ${atRisk.funnelName} may decline from ${atRisk.baselineConversionRate.toFixed(2)}% to ${atRisk.predictedConversionRate.toFixed(2)}% conversion.`,
        })
      }
    }

    if (abTestSuggestions.length > 0) {
      items.push({ level: 'info', message: `${abTestSuggestions.length} new A/B test idea(s) generated.` })
    }

    if (optimizationIdeas.length > 0) {
      items.push({ level: 'info', message: `${optimizationIdeas.length} automatic optimization idea(s) queued.` })
    }

    return items
  }, [data, alerts.length, weeklySummary, forecasts, abTestSuggestions.length, optimizationIdeas.length])

  const atRiskForecastCount = useMemo(
    () => forecasts.filter((item) => item.predictedConversionRate < item.baselineConversionRate * 0.9).length,
    [forecasts]
  )

  const priorityActions = useMemo(() => {
    const items: Array<{ title: string; detail: string; tone: 'warning' | 'info' | 'success' }> = []

    if (alerts.length > 0) {
      const topAlert = alerts[0]
      items.push({
        title: 'Resolve highest-severity alert',
        detail: `${topAlert.title}: ${topAlert.message}`,
        tone: 'warning',
      })
    }

    if (optimizationIdeas.length > 0) {
      const topIdea = optimizationIdeas[0]
      items.push({
        title: 'Apply top optimization idea',
        detail: `${topIdea.title} (${topIdea.effort} effort, ${topIdea.priority} priority)`,
        tone: 'info',
      })
    }

    if (abTestSuggestions.length > 0) {
      const topAB = abTestSuggestions[0]
      items.push({
        title: 'Launch next A/B test',
        detail: `${topAB.title} targeting ${topAB.objective.replace('_', ' ')}`,
        tone: 'info',
      })
    }

    if (weeklySummary?.recommendedFocus.length) {
      items.push({
        title: 'Weekly focus',
        detail: weeklySummary.recommendedFocus[0],
        tone: 'success',
      })
    }

    return items.slice(0, 4)
  }, [alerts, optimizationIdeas, abTestSuggestions, weeklySummary])

  const visibleWidgetCount = useMemo(
    () => widgetDefinitions.filter((widget) => widgetVisibility[widget.id]).length,
    [widgetVisibility]
  )

  const sectionVisibility = useMemo(
    () => ({
      metrics: ['visitors', 'conversions', 'revenue', 'subscribers'].some((id) => widgetVisibility[id as WidgetId]),
      performance: ['trafficChart', 'funnelPerformance', 'performanceScore', 'affiliateEarnings'].some(
        (id) => widgetVisibility[id as WidgetId]
      ),
      signals: ['recentActivity', 'insights', 'recommendations', 'alerts'].some((id) => widgetVisibility[id as WidgetId]),
      optimization: ['plainEnglishInsights', 'abTestSuggestions', 'optimizationIdeas'].some(
        (id) => widgetVisibility[id as WidgetId]
      ),
      planning: ['weeklySummary', 'performanceForecast'].some((id) => widgetVisibility[id as WidgetId]),
      operations: ['quickActions', 'commandBrief'].some((id) => widgetVisibility[id as WidgetId]),
    }),
    [widgetVisibility]
  )

  const toggleWidgetVisibility = (widgetId: WidgetId) => {
    setWidgetVisibility((current) => ({ ...current, [widgetId]: !current[widgetId] }))
  }

  const themeClass = theme === 'light' ? 'theme-light' : 'theme-dark'

  if (loading && !data) {
    return <DashboardSkeleton />
  }

  return (
    <main className={`${themeClass} cockpit-shell page-mission-control py-8`}>
      <div className="cockpit-container max-w-7xl space-y-6">
        <header className="hud-panel">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
            <div>
              <p className="text-xs uppercase tracking-system text-text-secondary">Command Center</p>
              <h1 className="text-3xl font-semibold text-text-primary md:text-4xl">Dashboard Control Panel</h1>
              <p className="mt-2 text-sm text-text-secondary">Monitor traffic, funnels, earnings, and operational signals at a glance.</p>
              {lastUpdated && <p className="mt-2 text-xs text-text-secondary">Last updated {lastUpdated.toLocaleTimeString()}</p>}
              <div className="mt-3 flex flex-wrap gap-2 text-xs">
                <span className="rounded-full border border-[var(--border-subtle)] px-2 py-1 text-text-secondary">
                  Conv Rate {(data?.totals.conversionRate || 0).toFixed(2)}%
                </span>
                <span className="rounded-full border border-amber-400/30 px-2 py-1 text-amber-100">{alerts.length} active alerts</span>
                <span className="rounded-full border border-cyan-400/30 px-2 py-1 text-cyan-100">
                  {atRiskForecastCount} at-risk forecasts
                </span>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-start gap-2 xl:justify-end">
              <Link href="/offers?new=1" className="hud-button-primary px-3 py-2 text-sm">
                Create Offer
              </Link>
              <Link href="/offers" className="hud-button-secondary px-3 py-2 text-sm">
                Manage Offers
              </Link>

              <div className="inline-flex rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface-elevated)] p-1">
                {ranges.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setRange(option.value)}
                    className={`min-h-[40px] min-w-[52px] rounded-lg px-3 py-2 text-sm font-medium transition ${
                      range === option.value
                        ? 'bg-rocket-500 text-slate-950'
                        : 'text-text-secondary hover:text-text-primary'
                    }`}
                    aria-label={`Set range to ${option.value}`}
                    aria-pressed={range === option.value}
                  >
                    {option.label}
                  </button>
                ))}
              </div>

              <button type="button" onClick={() => setRefreshSeed((value) => value + 1)} className="hud-button-secondary px-3 py-2 text-sm">
                <RefreshCw size={14} className="mr-1 inline" />
                Refresh
              </button>

              <button
                type="button"
                onClick={() => setTheme((current) => (current === 'dark' ? 'light' : 'dark'))}
                className="hud-button-secondary px-3 py-2 text-sm"
                aria-label="Toggle dashboard color theme"
              >
                {theme === 'dark' ? <Sun size={14} className="mr-1 inline" /> : <Moon size={14} className="mr-1 inline" />}
                {theme === 'dark' ? 'Light mode' : 'Dark mode'}
              </button>

              <button
                type="button"
                onClick={() => setCustomizeOpen((current) => !current)}
                className="hud-button-secondary px-3 py-2 text-sm"
                aria-expanded={customizeOpen}
                aria-controls="widget-customization-panel"
              >
                <SlidersHorizontal size={14} className="mr-1 inline" />
                Customize widgets
              </button>
            </div>
          </div>
        </header>

        {customizeOpen && (
          <section id="widget-customization-panel" className="hud-panel">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-xs uppercase tracking-system text-text-secondary">Widget Controls</p>
                <p className="mt-1 text-sm text-text-secondary">
                  {visibleWidgetCount} of {widgetDefinitions.length} widgets visible.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setWidgetVisibility(getDefaultWidgetVisibility())}
                className="hud-button-secondary px-3 py-2 text-sm"
              >
                Reset layout
              </button>
            </div>

            <div className="mt-4 grid grid-cols-1 gap-4 xl:grid-cols-2">
              {widgetGroups.map((group) => (
                <div key={group} className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface-elevated)] p-3">
                  <p className="text-xs uppercase tracking-system text-text-secondary">{group}</p>
                  <div className="mt-3 space-y-2">
                    {widgetDefinitions
                      .filter((widget) => widget.group === group)
                      .map((widget) => {
                        const visible = widgetVisibility[widget.id]
                        return (
                          <button
                            key={widget.id}
                            type="button"
                            onClick={() => toggleWidgetVisibility(widget.id)}
                            className={`w-full rounded-lg border px-3 py-2 text-left transition ${
                              visible
                                ? 'border-emerald-400/40 bg-emerald-500/10'
                                : 'border-[var(--border-subtle)] hover:border-[var(--border-elevated)]'
                            }`}
                          >
                            <div className="flex items-start justify-between gap-3">
                              <div>
                                <p className="text-sm font-semibold text-text-primary">{widget.label}</p>
                                <p className="mt-1 text-xs text-text-secondary">{widget.description}</p>
                              </div>
                              <span
                                className={`rounded-full border px-2 py-0.5 text-[11px] uppercase tracking-system ${
                                  visible
                                    ? 'border-emerald-400/30 text-emerald-100'
                                    : 'border-[var(--border-subtle)] text-text-secondary'
                                }`}
                              >
                                {visible ? 'Visible' : 'Hidden'}
                              </span>
                            </div>
                          </button>
                        )
                      })}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {error && (
          <section className="rounded-lg border border-red-400/35 bg-red-500/12 p-4 text-red-100">
            <p>{error}</p>
          </section>
        )}

        {visibleWidgetCount === 0 && (
          <section className="rounded-lg border border-amber-400/35 bg-amber-500/10 p-4">
            <p className="text-sm text-amber-100">All widgets are hidden. Enable widgets from Customize widgets to continue.</p>
          </section>
        )}

        {sectionVisibility.metrics && (
          <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {widgetVisibility.visitors && <VisitorsPanel visitors={data?.totals.clicks || 0} />}
            {widgetVisibility.conversions && <ConversionsPanel conversions={data?.totals.conversions || 0} />}
            {widgetVisibility.revenue && <RevenuePanel revenue={data?.totals.revenue || 0} />}
            {widgetVisibility.subscribers && <SubscribersPanel subscribers={data?.totals.leads || 0} />}
          </section>
        )}

        {sectionVisibility.performance && (
          <section className="grid grid-cols-1 gap-4 lg:grid-cols-4">
            {widgetVisibility.trafficChart && <TrafficChartPanel sources={data?.sourceBreakdown || []} />}
            {widgetVisibility.funnelPerformance && (
              <FunnelPerformancePanel
                funnels={data?.totals.funnels || 0}
                clicks={data?.totals.clicks || 0}
                conversions={data?.totals.conversions || 0}
                conversionRate={data?.totals.conversionRate || 0}
              />
            )}
            {widgetVisibility.performanceScore && <PerformanceScorePanel scores={funnelScores} />}
            {widgetVisibility.affiliateEarnings && (
              <AffiliateEarningsPanel revenue={data?.totals.revenue || 0} conversionRate={data?.totals.conversionRate || 0} />
            )}
          </section>
        )}

        {sectionVisibility.signals && (
          <section className="grid grid-cols-1 gap-4 lg:grid-cols-4">
            {widgetVisibility.recentActivity && <RecentActivityPanel items={data?.recentActivity || []} />}
            {widgetVisibility.insights && <InsightsPanel insights={insights} />}
            {widgetVisibility.recommendations && <RecommendationsFeedPanel recommendations={recommendations} />}
            {widgetVisibility.alerts && <AlertsPanel alerts={alerts} />}
          </section>
        )}

        {sectionVisibility.optimization && (
          <section className="grid grid-cols-1 gap-4 lg:grid-cols-3">
            {widgetVisibility.plainEnglishInsights && <PlainEnglishInsightsPanel insights={plainEnglishInsights} />}
            {widgetVisibility.abTestSuggestions && <ABTestSuggestionsPanel suggestions={abTestSuggestions} />}
            {widgetVisibility.optimizationIdeas && <OptimizationIdeasPanel ideas={optimizationIdeas} />}
          </section>
        )}

        {sectionVisibility.planning && (
          <section className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            {widgetVisibility.weeklySummary && <WeeklySummaryReportPanel summary={weeklySummary} />}
            {widgetVisibility.performanceForecast && <PerformanceForecastPanel forecasts={forecasts} />}
          </section>
        )}

        {sectionVisibility.operations && (
          <section
            className={`grid grid-cols-1 gap-4 ${
              widgetVisibility.quickActions && widgetVisibility.commandBrief ? 'lg:grid-cols-2' : ''
            }`}
          >
            {widgetVisibility.quickActions && <QuickActionsPanel />}
            {widgetVisibility.commandBrief && (
              <div className="min-h-[1px]">
                <div className="h-full rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-surface-elevated)] p-4">
                  <p className="mb-2 text-sm font-semibold text-text-primary">Command Brief</p>
                  {weeklySummary && <p className="mb-2 text-xs text-text-secondary">{weeklySummary.summary}</p>}
                  {priorityActions.length > 0 && (
                    <div className="mb-3 space-y-2">
                      {priorityActions.map((item, index) => (
                        <div
                          key={`${item.title}-${index}`}
                          className={`rounded-lg border px-3 py-2 text-xs ${
                            item.tone === 'warning'
                              ? 'border-amber-400/35'
                              : item.tone === 'success'
                                ? 'border-emerald-400/35'
                                : 'border-cyan-400/35'
                          }`}
                        >
                          <p className="font-semibold text-text-primary">{item.title}</p>
                          <p className="mt-1 text-text-secondary">{item.detail}</p>
                        </div>
                      ))}
                    </div>
                  )}
                  <div className="space-y-2 border-t border-[var(--border-subtle)] pt-3">
                    <p className="text-xs uppercase tracking-system text-text-secondary">System Notices</p>
                    {notifications.map((notification, index) => (
                      <div key={`${notification.message}-${index}`} className="rounded-lg border border-[var(--border-subtle)] px-3 py-2 text-xs text-text-secondary">
                        {notification.message}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </section>
        )}
      </div>
    </main>
  )
}
