'use client'

import { useEffect, useMemo, useState } from 'react'
import { getAnalyticsSummary, getFunnelPerformance, type FunnelPerformance } from '@/lib/api/analytics'
import { listFunnels, type FunnelRecord } from '@/lib/api/funnels'
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

  useEffect(() => {
    let active = true

    async function load() {
      try {
        setLoading(true)
        setError(null)

        const [summaryData, funnels] = await Promise.all([getAnalyticsSummary(range), listFunnels()])

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
  }, [range])

  const topSources = useMemo(() => {
    return [...(summary?.clicksBySource || [])].sort((a, b) => b.count - a.count).slice(0, 6)
  }, [summary?.clicksBySource])

  if (loading && !summary) {
    return <AnalyticsSkeleton />
  }

  return (
    <main className="cockpit-shell page-telemetry py-8">
      <div className="cockpit-container max-w-6xl space-y-6">
        <section className="hud-panel flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs uppercase tracking-system text-text-secondary">Analytics</p>
            <h1 className="text-3xl font-semibold text-text-primary md:text-4xl">Traffic and Conversion Intelligence</h1>
            <p className="mt-1 text-sm text-text-secondary">Traffic metrics, conversion charts, and funnel performance.</p>
          </div>
          <div className="flex gap-2">
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
          </div>
        </section>

        {error && (
          <section className="rounded-lg border border-red-400/35 bg-red-500/12 p-4 text-red-200">
            {error}
          </section>
        )}

        <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <article className="hud-card">
            <p className="text-xs uppercase tracking-system text-text-secondary">Total Clicks</p>
            <p className="mt-3 text-3xl font-semibold text-text-primary">{summary?.stats.totalClicks.toLocaleString() || 0}</p>
          </article>
          <article className="hud-card">
            <p className="text-xs uppercase tracking-system text-text-secondary">Conversions</p>
            <p className="mt-3 text-3xl font-semibold text-text-primary">{summary?.stats.totalConversions.toLocaleString() || 0}</p>
          </article>
          <article className="hud-card">
            <p className="text-xs uppercase tracking-system text-text-secondary">Conversion Rate</p>
            <p className="mt-3 text-3xl font-semibold text-text-primary">{(summary?.stats.conversionRate || 0).toFixed(2)}%</p>
          </article>
          <article className="hud-card">
            <p className="text-xs uppercase tracking-system text-text-secondary">Revenue</p>
            <p className="mt-3 text-3xl font-semibold text-text-primary">${(summary?.stats.totalRevenue || 0).toLocaleString()}</p>
          </article>
        </section>

        <section className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <article className="hud-card">
            <h2 className="text-xl font-semibold text-text-primary">Traffic Sources</h2>
            <div className="mt-4 space-y-3">
              {topSources.length === 0 && <p className="text-sm text-text-secondary">No traffic source data.</p>}
              {topSources.map((source) => {
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
              })}
            </div>
          </article>

          <article className="hud-card">
            <h2 className="text-xl font-semibold text-text-primary">Conversion Trend</h2>
            <div className="mt-4 grid grid-cols-3 gap-3">
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
          </article>
        </section>

        <section className="hud-card">
          <h2 className="mb-4 text-xl font-semibold text-text-primary">Funnel Performance</h2>
          {performanceRows.length === 0 ? (
            <p className="text-sm text-text-secondary">No funnel performance data yet.</p>
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
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </main>
  )
}
