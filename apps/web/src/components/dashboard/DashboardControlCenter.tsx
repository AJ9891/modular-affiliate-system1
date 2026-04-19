'use client'

import { useEffect, useMemo, useState } from 'react'
import { RefreshCw } from 'lucide-react'
import { getDashboardData, type DashboardData } from '@/lib/api/dashboard'
import { getAlerts, getGrowthSnapshot, getRecommendations } from '@/lib/api/growth-assistant'
import type { FunnelPerformanceScore, GrowthAlert, GrowthInsight, GrowthRecommendation } from '@/lib/growth-assistant/types'
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
  const [funnelScores, setFunnelScores] = useState<FunnelPerformanceScore[]>([])
  const [insights, setInsights] = useState<GrowthInsight[]>([])
  const [recommendations, setRecommendations] = useState<GrowthRecommendation[]>([])
  const [alerts, setAlerts] = useState<GrowthAlert[]>([])

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

        if (snapshotResult.status === 'fulfilled') {
          setInsights(snapshotResult.value.insights)
          setFunnelScores(snapshotResult.value.funnelScores)
        } else {
          setInsights([])
          setFunnelScores([])
        }

        if (recommendationsResult.status === 'fulfilled') {
          setRecommendations(recommendationsResult.value)
        } else {
          setRecommendations([])
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

    return items
  }, [data, alerts.length])

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

        <section className="grid grid-cols-1 gap-4 lg:grid-cols-4">
          <TrafficChartPanel sources={data?.sourceBreakdown || []} />
          <FunnelPerformancePanel
            funnels={data?.totals.funnels || 0}
            clicks={data?.totals.clicks || 0}
            conversions={data?.totals.conversions || 0}
            conversionRate={data?.totals.conversionRate || 0}
          />
          <PerformanceScorePanel scores={funnelScores} />
          <AffiliateEarningsPanel revenue={data?.totals.revenue || 0} conversionRate={data?.totals.conversionRate || 0} />
        </section>

        <section className="grid grid-cols-1 gap-4 lg:grid-cols-4">
          <RecentActivityPanel items={data?.recentActivity || []} />
          <InsightsPanel insights={insights} />
          <RecommendationsFeedPanel recommendations={recommendations} />
          <AlertsPanel alerts={alerts} />
        </section>

        <section className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <QuickActionsPanel />
          <div className="min-h-[1px]">
            {/* Keep existing notice stream for compatibility while Alerts panel handles critical signals. */}
            <div className="h-full rounded-lg border border-[var(--border-subtle)] p-4">
              <p className="mb-2 text-sm font-semibold text-text-primary">System Notices</p>
              <div className="space-y-2">
                {notifications.map((notification, index) => (
                  <div key={`${notification.message}-${index}`} className="rounded-lg border border-[var(--border-subtle)] px-3 py-2 text-xs text-text-secondary">
                    {notification.message}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  )
}
