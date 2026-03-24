'use client'

import { useEffect, useMemo, useState } from 'react'
import { RefreshCw } from 'lucide-react'
import { getDashboardData, type DashboardData } from '@/lib/api/dashboard'
import DashboardSkeleton from './DashboardSkeleton'
import {
  VisitorsPanel,
  ConversionsPanel,
  RevenuePanel,
  SubscribersPanel,
  TrafficChartPanel,
  FunnelPerformancePanel,
  AffiliateEarningsPanel,
  RecentActivityPanel,
  NotificationsPanel,
  QuickActionsPanel,
} from './panels'

const ranges = [
  { value: '7d', label: '7 days' },
  { value: '30d', label: '30 days' },
  { value: '90d', label: '90 days' },
] as const

type RangeValue = (typeof ranges)[number]['value']

export default function DashboardControlCenter() {
  const [range, setRange] = useState<RangeValue>('7d')
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [refreshSeed, setRefreshSeed] = useState(0)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)

  useEffect(() => {
    let active = true

    async function loadDashboard() {
      try {
        setLoading(true)
        setError(null)
        const next = await getDashboardData(range)
        if (!active) return
        setData(next)
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

    return items
  }, [data])

  if (loading && !data) {
    return <DashboardSkeleton />
  }

  return (
    <main className="cockpit-shell page-mission-control py-8">
      <div className="cockpit-container max-w-7xl space-y-6">
        <header className="hud-panel">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-xs uppercase tracking-system text-text-secondary">Command Center</p>
              <h1 className="text-3xl font-semibold text-text-primary md:text-4xl">Dashboard Control Panel</h1>
              <p className="mt-2 text-sm text-text-secondary">Monitor traffic, funnels, earnings, and operational signals at a glance.</p>
              {lastUpdated && <p className="mt-2 text-xs text-text-secondary">Last updated {lastUpdated.toLocaleTimeString()}</p>}
            </div>

            <div className="flex flex-wrap gap-2">
              {ranges.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setRange(option.value)}
                  className={`rounded-lg px-3 py-2 text-sm ${
                    range === option.value
                      ? 'bg-rocket-500 text-slate-950'
                      : 'border border-[var(--border-subtle)] text-text-secondary hover:text-text-primary'
                  }`}
                >
                  {option.label}
                </button>
              ))}
              <button type="button" onClick={() => setRefreshSeed((value) => value + 1)} className="hud-button-secondary px-3 py-2 text-sm">
                <RefreshCw size={14} className="mr-1 inline" />
                Refresh
              </button>
            </div>
          </div>
        </header>

        {error && (
          <section className="rounded-lg border border-red-400/35 bg-red-500/12 p-4 text-red-100">
            <p>{error}</p>
          </section>
        )}

        <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <VisitorsPanel visitors={data?.totals.clicks || 0} />
          <ConversionsPanel conversions={data?.totals.conversions || 0} />
          <RevenuePanel revenue={data?.totals.revenue || 0} />
          <SubscribersPanel subscribers={data?.totals.leads || 0} />
        </section>

        <section className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          <TrafficChartPanel sources={data?.sourceBreakdown || []} />
          <FunnelPerformancePanel
            funnels={data?.totals.funnels || 0}
            clicks={data?.totals.clicks || 0}
            conversions={data?.totals.conversions || 0}
            conversionRate={data?.totals.conversionRate || 0}
          />
          <AffiliateEarningsPanel revenue={data?.totals.revenue || 0} conversionRate={data?.totals.conversionRate || 0} />
        </section>

        <section className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          <RecentActivityPanel items={data?.recentActivity || []} />
          <NotificationsPanel notifications={notifications} />
          <QuickActionsPanel />
        </section>
      </div>
    </main>
  )
}
