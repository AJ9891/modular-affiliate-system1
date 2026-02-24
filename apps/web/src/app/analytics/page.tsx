'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

interface AnalyticsData {
  totalClicks: number
  totalConversions: number
  conversionRate: number
  totalRevenue: number
  clicksBySource: Array<{ source: string; count: number }>
  clicksByOffer: Array<{ offer_name: string; clicks: number; conversions: number }>
  recentClicks: Array<{
    clicked_at: string
    offer_id: string
    utm_source?: string
    utm_medium?: string
    utm_campaign?: string
  }>
}

export default function AnalyticsPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null)
  const [timeRange, setTimeRange] = useState('7d') // 7d, 30d, all

  useEffect(() => {
    checkAuth()
    loadAnalytics()
  }, [timeRange])

  async function checkAuth() {
    const res = await fetch('/api/auth/me')
    if (!res.ok) {
      router.push('/login')
    }
  }

  async function loadAnalytics() {
    try {
      setLoading(true)
      const res = await fetch(`/api/analytics?range=${timeRange}`)
      if (res.ok) {
        const data = await res.json()
        setAnalytics(data)
      }
    } catch (error) {
      console.error('Failed to load analytics:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="cockpit-shell page-telemetry flex items-center justify-center">
        <div className="text-xl text-text-secondary">Loading telemetry...</div>
      </div>
    )
  }

  if (!analytics) {
    return (
      <div className="cockpit-shell page-telemetry flex items-center justify-center">
        <div className="text-xl text-text-secondary">Failed to load analytics data</div>
      </div>
    )
  }

  return (
    <div className="cockpit-shell page-telemetry telemetry-grid py-12">
      <div className="cockpit-container relative z-10">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="mb-2 text-4xl font-semibold text-text-primary">
              Flight Telemetry
            </h1>
            <p className="text-text-secondary">Precision tracking across your affiliate systems.</p>
          </div>
          
          {/* Time Range Selector */}
          <div className="flex gap-2">
            {['7d', '30d', 'all'].map((range) => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={`rounded-lg px-4 py-2 text-sm font-semibold tracking-system transition ${
                  timeRange === range
                    ? 'bg-rocket-500 text-slate-950'
                    : 'border border-[var(--border-elevated)] bg-[rgba(14,22,30,0.48)] text-text-secondary hover:text-text-primary'
                }`}
              >
                {range === '7d' ? 'Last 7 Days' : range === '30d' ? 'Last 30 Days' : 'All Time'}
              </button>
            ))}
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="hud-card telemetry-pulse">
            <div className="mb-2 text-sm uppercase tracking-system text-text-secondary">Total Clicks</div>
            <div className="text-4xl font-semibold text-text-primary">{(analytics.totalClicks ?? 0).toLocaleString()}</div>
          </div>

          <div className="hud-card telemetry-pulse">
            <div className="mb-2 text-sm uppercase tracking-system text-text-secondary">Conversions</div>
            <div className="text-4xl font-semibold text-text-primary">{(analytics.totalConversions ?? 0).toLocaleString()}</div>
          </div>

          <div className="hud-card telemetry-pulse">
            <div className="mb-2 text-sm uppercase tracking-system text-text-secondary">Conversion Rate</div>
            <div className="text-4xl font-semibold text-text-primary">{(analytics.conversionRate ?? 0).toFixed(2)}%</div>
          </div>

          <div className="hud-card telemetry-pulse">
            <div className="mb-2 text-sm uppercase tracking-system text-text-secondary">Total Revenue</div>
            <div className="text-4xl font-semibold text-text-primary">${(analytics.totalRevenue ?? 0).toLocaleString()}</div>
          </div>
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Clicks by Source */}
          <div className="hud-card">
            <h2 className="mb-4 text-2xl font-semibold text-text-primary">Clicks by Source</h2>
            <div className="space-y-3">
              {analytics.clicksBySource.length > 0 ? (
                analytics.clicksBySource.map((item) => (
                  <div key={item.source} className="flex items-center justify-between">
                    <div className="font-medium text-text-primary">{item.source || 'Direct'}</div>
                    <div className="text-text-secondary">{item.count} clicks</div>
                  </div>
                ))
              ) : (
                <div className="py-8 text-center text-text-secondary">No data available</div>
              )}
            </div>
          </div>

          {/* Clicks by Offer */}
          <div className="hud-card">
            <h2 className="mb-4 text-2xl font-semibold text-text-primary">Performance by Offer</h2>
            <div className="space-y-3">
              {analytics.clicksByOffer.length > 0 ? (
                analytics.clicksByOffer.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between">
                    <div className="font-medium text-text-primary">{item.offer_name}</div>
                    <div className="text-text-secondary">
                      {item.clicks} clicks / {item.conversions} conversions
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-8 text-center text-text-secondary">No offers tracked yet</div>
              )}
            </div>
          </div>
        </div>

        {/* Recent Clicks Table */}
        <div className="hud-card">
          <h2 className="mb-4 text-2xl font-semibold text-text-primary">Recent Clicks</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[var(--border-subtle)]">
                  <th className="px-4 py-3 text-left font-semibold text-text-secondary">Time</th>
                  <th className="px-4 py-3 text-left font-semibold text-text-secondary">Offer ID</th>
                  <th className="px-4 py-3 text-left font-semibold text-text-secondary">Source</th>
                  <th className="px-4 py-3 text-left font-semibold text-text-secondary">Medium</th>
                  <th className="px-4 py-3 text-left font-semibold text-text-secondary">Campaign</th>
                </tr>
              </thead>
              <tbody>
                {analytics.recentClicks.length > 0 ? (
                  analytics.recentClicks.map((click, idx) => (
                    <tr key={idx} className="border-b border-[var(--border-subtle)]">
                      <td className="px-4 py-3 text-text-primary">
                        {new Date(click.clicked_at).toLocaleString()}
                      </td>
                      <td className="px-4 py-3 font-mono text-sm text-text-primary">
                        {click.offer_id.substring(0, 8)}...
                      </td>
                      <td className="px-4 py-3 text-text-secondary">{click.utm_source || '-'}</td>
                      <td className="px-4 py-3 text-text-secondary">{click.utm_medium || '-'}</td>
                      <td className="px-4 py-3 text-text-secondary">{click.utm_campaign || '-'}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-text-secondary">
                      No clicks tracked yet
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Back to Dashboard */}
        <div className="mt-8 text-center">
          <button
            onClick={() => router.push('/dashboard')}
            className="hud-button-secondary px-8 py-3"
          >
            ← Back to Dashboard
          </button>
        </div>
      </div>
    </div>
  )
}
