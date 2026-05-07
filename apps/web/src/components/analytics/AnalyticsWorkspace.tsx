'use client'

import { useEffect, useMemo, useState } from 'react'
import { Activity, TrendingUp, MousePointerClick, DollarSign } from 'lucide-react'
import { getAnalyticsSummary, getFunnelPerformance, type FunnelPerformance } from '@/lib/api/analytics'
import { listFunnels, type FunnelRecord } from '@/lib/api/funnels'
import { getGrowthSnapshot } from '@/lib/api/growth-assistant'
import DashboardPanel from '@/components/cockpit/DashboardPanel'
import WorkspacePanel from '@/components/cockpit/WorkspacePanel'
import { CockpitEmptyState } from '@/components/ui/CockpitEmptyState'
import SystemExplanationToggle from '@/components/ui/SystemExplanationToggle'
import { PageHeader, StatsGrid } from '@/features/shared/ui'
import AnalyticsSkeleton from './AnalyticsSkeleton'

const ranges = ['7d', '30d', '90d'] as const
type Range = (typeof ranges)[number]

type PerformanceRow = {
  funnel: FunnelRecord
  performance: FunnelPerformance
}

export default function AnalyticsWorkspace() {
  const [range, setRange] = useState<Range>('7d')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [summary, setSummary] = useState<Awaited<ReturnType<typeof getAnalyticsSummary>> | null>(null)
  const [performanceRows, setPerformanceRows] = useState<PerformanceRow[]>([])
  const [scoreByFunnel, setScoreByFunnel] = useState<Record<string, number>>({})
  const [refreshKey, setRefreshKey] = useState(0)

  useEffect(() => {
    let active = true

    async function load() {
      try {
        setLoading(true)
        setError(null)

        const [summaryData, funnels, growthSnapshot] = await Promise.all([
          getAnalyticsSummary(range),
          listFunnels(),
          getGrowthSnapshot({ range, limit: 200 }).catch(() => ({
            insights: [],
            plainEnglishInsights: [],
            funnelScores: [],
            abTestSuggestions: [],
            optimizationIdeas: [],
            weeklySummary: null,
            forecasts: [],
          })),
        ])
        const candidates = funnels.slice(0, 8)

        const performance = await Promise.all(
          candidates.map(async (funnel) => {
            try {
              const details = await getFunnelPerformance(funnel.funnel_id)
              return { funnel, performance: details }
            } catch {
              return null
            }
          })
        )

        if (active) {
          setSummary(summaryData)
          setPerformanceRows((performance.filter(Boolean) as PerformanceRow[]).sort((a, b) => b.performance.totalClicks - a.performance.totalClicks))
          const nextScores: Record<string, number> = {}
          for (const item of growthSnapshot.funnelScores || []) {
            nextScores[item.funnelId] = item.score
          }
          setScoreByFunnel(nextScores)
        }
      } catch (err) {
        if (active) {
          setError(err instanceof Error ? err.message : 'Failed to load analytics')
        }
      } finally {
        if (active) {
          setLoading(false)
        }
      }
    }

    load()

    return () => {
      active = false
    }
  }, [range, refreshKey])

  const topSources = useMemo(() => {
    return [...(summary?.clicksBySource || [])].sort((a, b) => b.count - a.count).slice(0, 6)
  }, [summary?.clicksBySource])

  const plainEnglishSummary = useMemo(() => {
    const entered = summary?.stats.totalClicks || 0
    const converted = summary?.stats.totalConversions || 0
    const left = Math.max(0, entered - converted)
    const topLeakSource = topSources.length > 0 ? topSources[0] : null

    const weakestFunnel = performanceRows
      .filter((row) => row.performance.totalClicks > 0)
      .sort((a, b) => a.performance.conversionRate - b.performance.conversionRate)[0]

    return {
      entered,
      converted,
      left,
      topLeakSource,
      weakestFunnel,
    }
  }, [summary?.stats.totalClicks, summary?.stats.totalConversions, topSources, performanceRows])

  if (loading && !summary) {
    return <AnalyticsSkeleton />
  }

  return (
    <main className="cockpit-shell calm-instruments page-telemetry py-8">
      <div className="cockpit-container max-w-7xl space-y-6">
        <PageHeader
          eyebrow="Analytics"
          title="Traffic and Conversion Instruments"
          description="Inspect traffic quality, funnel efficiency, and revenue movement."
          actions={
            <>
              {ranges.map((value) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setRange(value)}
                  className={`rounded-lg px-3 py-2 text-sm ${
                    value === range
                      ? 'instrument-segment-active'
                      : 'instrument-segment border text-text-secondary hover:text-text-primary'
                  }`}
                >
                  {value}
                </button>
              ))}
              <button type="button" onClick={() => setRefreshKey((value) => value + 1)} className="hud-button-secondary px-3 py-2 text-sm">
                Refresh
              </button>
            </>
          }
        />

        {error && (
          <section className="rounded-lg border border-red-400/35 bg-red-500/12 p-4 text-red-200">
            {error}
          </section>
        )}

        <StatsGrid>
          <DashboardPanel
            title="Total Clicks"
            icon={<MousePointerClick size={16} />}
            value={summary?.stats.totalClicks.toLocaleString() || 0}
            tone="info"
          >
            <p className="text-xs text-text-secondary">Tracked sessions in selected range.</p>
          </DashboardPanel>
          <DashboardPanel title="Conversions" icon={<TrendingUp size={16} />} value={summary?.stats.totalConversions.toLocaleString() || 0} tone="success">
            <p className="text-xs text-text-secondary">Completed conversion events.</p>
          </DashboardPanel>
          <DashboardPanel
            title="Conversion Rate"
            icon={<Activity size={16} />}
            value={`${(summary?.stats.conversionRate || 0).toFixed(2)}%`}
            tone="warning"
          >
            <p className="text-xs text-text-secondary">Click-to-conversion ratio.</p>
          </DashboardPanel>
          <DashboardPanel title="Revenue" icon={<DollarSign size={16} />} value={`$${(summary?.stats.totalRevenue || 0).toLocaleString()}`} tone="success">
            <p className="text-xs text-text-secondary">Estimated tracked revenue.</p>
          </DashboardPanel>
        </StatsGrid>

        <WorkspacePanel
          title="Plain-English Analytics"
          description="No vanity metrics. Just movement, drop-off, and where to act."
          titleAccessory={
            <SystemExplanationToggle explanation="This panel translates metrics into one readable flow so teams can decide what to fix next without dashboard interpretation overhead." />
          }
          expandable
        >
          <div className="rounded-lg border border-[var(--border-subtle)] bg-[color:var(--hud-tight-bg)] p-4">
            <p className="text-sm text-text-primary">
              {plainEnglishSummary.entered.toLocaleString()} people entered. {plainEnglishSummary.left.toLocaleString()} left. Here is where.
            </p>
            <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-3">
              <div className="rounded-lg border border-[var(--border-subtle)] bg-[color:var(--bg-surface)] p-3">
                <p className="text-xs uppercase tracking-system text-text-secondary">Entered</p>
                <p className="mt-1 text-xl font-semibold text-text-primary">{plainEnglishSummary.entered.toLocaleString()}</p>
              </div>
              <div className="rounded-lg border border-[var(--border-subtle)] bg-[color:var(--bg-surface)] p-3">
                <p className="text-xs uppercase tracking-system text-text-secondary">Converted</p>
                <p className="mt-1 text-xl font-semibold text-text-primary">{plainEnglishSummary.converted.toLocaleString()}</p>
              </div>
              <div className="rounded-lg border border-[var(--border-subtle)] bg-[color:var(--bg-surface)] p-3">
                <p className="text-xs uppercase tracking-system text-text-secondary">Left</p>
                <p className="mt-1 text-xl font-semibold text-text-primary">{plainEnglishSummary.left.toLocaleString()}</p>
              </div>
            </div>
            <div className="mt-4 space-y-2 text-sm text-text-secondary">
              <p>
                Main traffic source: <span className="text-text-primary">{plainEnglishSummary.topLeakSource?.source || 'No source data yet'}</span>
                {plainEnglishSummary.topLeakSource ? ` (${plainEnglishSummary.topLeakSource.count.toLocaleString()} entries)` : ''}
              </p>
              <p>
                Weakest funnel in this range: <span className="text-text-primary">{plainEnglishSummary.weakestFunnel?.funnel.name || 'Not enough funnel data'}</span>
                {plainEnglishSummary.weakestFunnel
                  ? ` (${plainEnglishSummary.weakestFunnel.performance.conversionRate.toFixed(2)}% conversion rate)`
                  : ''}
              </p>
            </div>
          </div>
        </WorkspacePanel>

        <section className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <WorkspacePanel
            title="Traffic Sources"
            description="Source attribution and channel concentration."
            titleAccessory={
              <SystemExplanationToggle explanation="Traffic-source concentration shows channel risk. If one source dominates and underperforms, your funnel volatility increases." />
            }
            expandable
          >
            <div className="space-y-3">
              {topSources.length === 0 ? (
                <CockpitEmptyState
                  compact
                  title="No source data yet"
                  description="Source attribution appears here after tracked visits."
                  primaryAction={{ label: 'Open Funnels', href: '/funnels' }}
                />
              ) : (
                topSources.map((source) => {
                  const width = Math.min(100, source.count * 4)
                  return (
                    <div key={source.source}>
                      <div className="mb-1 flex items-center justify-between text-sm">
                        <span className="text-text-primary">{source.source}</span>
                        <span className="text-text-secondary">{source.count}</span>
                      </div>
                      <div className="h-2 rounded-full bg-[rgba(10,16,24,0.65)]">
                        <div className="h-2 rounded-full bg-[color:var(--status-info-border)]" style={{ width: `${width}%` }} />
                      </div>
                    </div>
                  )
                })
              )}
            </div>
          </WorkspacePanel>

          <WorkspacePanel
            title="Trend Modules"
            description="Secondary engagement indicators."
            titleAccessory={
              <SystemExplanationToggle explanation="These support metrics tell you if pipeline quality is improving before revenue changes become visible." />
            }
            expandable
          >
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <div className="rounded-lg border border-[var(--border-subtle)] bg-[color:var(--hud-tight-bg)] p-3">
                <p className="text-xs uppercase tracking-system text-text-secondary">Leads</p>
                <p className="mt-2 text-2xl font-semibold text-text-primary">{summary?.stats.totalLeads || 0}</p>
              </div>
              <div className="rounded-lg border border-[var(--border-subtle)] bg-[color:var(--hud-tight-bg)] p-3">
                <p className="text-xs uppercase tracking-system text-text-secondary">Emails</p>
                <p className="mt-2 text-2xl font-semibold text-text-primary">{summary?.stats.emailsSent || 0}</p>
              </div>
              <div className="rounded-lg border border-[var(--border-subtle)] bg-[color:var(--hud-tight-bg)] p-3">
                <p className="text-xs uppercase tracking-system text-text-secondary">Open Rate</p>
                <p className="mt-2 text-2xl font-semibold text-text-primary">{(summary?.stats.emailOpenRate || 0).toFixed(2)}%</p>
              </div>
            </div>
          </WorkspacePanel>
        </section>

        <WorkspacePanel
          title="Funnel Performance Table"
          description="Comparative performance by funnel."
          titleAccessory={
            <SystemExplanationToggle explanation="This table ranks outcomes, not aesthetics. Use it to identify the funnel with the largest avoidable loss." />
          }
          expandable
        >
          {performanceRows.length === 0 ? (
            <CockpitEmptyState
              compact
              title="No funnel performance data"
              description="Create traffic to at least one funnel and performance rows will appear here."
              primaryAction={{ label: 'Go to Funnels', href: '/funnels' }}
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="border-b border-[var(--border-subtle)] text-left text-text-secondary">
                    <th className="px-3 py-2">Funnel</th>
                    <th className="px-3 py-2">Clicks</th>
                    <th className="px-3 py-2">Conversions</th>
                    <th className="px-3 py-2">Rate</th>
                    <th className="px-3 py-2">Revenue</th>
                    <th className="px-3 py-2">Score</th>
                  </tr>
                </thead>
                <tbody>
                  {performanceRows.map((row) => (
                    <tr key={row.funnel.funnel_id} className="border-b border-[var(--border-subtle)] text-text-primary">
                      <td className="px-3 py-3 font-medium">{row.funnel.name}</td>
                      <td className="px-3 py-3">{row.performance.totalClicks.toLocaleString()}</td>
                      <td className="px-3 py-3">{row.performance.totalConversions.toLocaleString()}</td>
                      <td className="px-3 py-3">{Number(row.performance.conversionRate).toFixed(2)}%</td>
                      <td className="px-3 py-3">${row.performance.totalRevenue.toLocaleString()}</td>
                      <td className="px-3 py-3">{scoreByFunnel[row.funnel.funnel_id]?.toFixed(1) ?? '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </WorkspacePanel>
      </div>
    </main>
  )
}
