'use client'

import { useEffect, useMemo, useState } from 'react'
import { Activity, TrendingUp, MousePointerClick, DollarSign } from 'lucide-react'
import { getAnalyticsSummary, getFunnelPerformance, type FunnelPerformance } from '@/lib/api/analytics'
import { listFunnels, type FunnelRecord } from '@/lib/api/funnels'
import { getGrowthSnapshot } from '@/lib/api/growth-assistant'
import DashboardPanel from '@/components/cockpit/DashboardPanel'
import WorkspacePanel from '@/components/cockpit/WorkspacePanel'
import { CockpitEmptyState } from '@/components/ui/CockpitEmptyState'
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
          getGrowthSnapshot({ range, limit: 200 }).catch(() => ({ insights: [], funnelScores: [] })),
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

  if (loading && !summary) {
    return <AnalyticsSkeleton />
  }

  return (
    <main className="cockpit-shell page-telemetry py-8">
      <div className="cockpit-container max-w-7xl space-y-6">
        <section className="hud-panel flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs uppercase tracking-system text-text-secondary">Analytics</p>
            <h1 className="text-3xl font-semibold text-text-primary md:text-4xl">Traffic and Conversion Command</h1>
            <p className="mt-1 text-sm text-text-secondary">Inspect traffic quality, funnel conversion efficiency, and revenue movement.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            {ranges.map((value) => (
              <button
                key={value}
                type="button"
                onClick={() => setRange(value)}
                className={`rounded-lg px-3 py-2 text-sm ${
                  value === range
                    ? 'bg-rocket-500 text-slate-950'
                    : 'border border-[var(--border-subtle)] text-text-secondary hover:text-text-primary'
                }`}
              >
                {value}
              </button>
            ))}
            <button type="button" onClick={() => setRefreshKey((value) => value + 1)} className="hud-button-secondary px-3 py-2 text-sm">
              Refresh
            </button>
          </div>
        </section>

        {error && (
          <section className="rounded-lg border border-red-400/35 bg-red-500/12 p-4 text-red-200">
            {error}
          </section>
        )}

        <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
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
        </section>

        <section className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <WorkspacePanel title="Traffic Sources" description="Source attribution and channel concentration." expandable>
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
                        <div className="h-2 rounded-full bg-gradient-to-r from-sky-500 to-cyan-300" style={{ width: `${width}%` }} />
                      </div>
                    </div>
                  )
                })
              )}
            </div>
          </WorkspacePanel>

          <WorkspacePanel title="Trend Modules" description="Secondary engagement indicators." expandable>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <div className="rounded-lg border border-[var(--border-subtle)] bg-[rgba(10,16,24,0.55)] p-3">
                <p className="text-xs uppercase tracking-system text-text-secondary">Leads</p>
                <p className="mt-2 text-2xl font-semibold text-text-primary">{summary?.stats.totalLeads || 0}</p>
              </div>
              <div className="rounded-lg border border-[var(--border-subtle)] bg-[rgba(10,16,24,0.55)] p-3">
                <p className="text-xs uppercase tracking-system text-text-secondary">Emails</p>
                <p className="mt-2 text-2xl font-semibold text-text-primary">{summary?.stats.emailsSent || 0}</p>
              </div>
              <div className="rounded-lg border border-[var(--border-subtle)] bg-[rgba(10,16,24,0.55)] p-3">
                <p className="text-xs uppercase tracking-system text-text-secondary">Open Rate</p>
                <p className="mt-2 text-2xl font-semibold text-text-primary">{(summary?.stats.emailOpenRate || 0).toFixed(2)}%</p>
              </div>
            </div>
          </WorkspacePanel>
        </section>

        <WorkspacePanel title="Funnel Performance Table" description="Comparative performance by funnel." expandable>
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
