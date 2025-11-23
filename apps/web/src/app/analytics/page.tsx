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
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-green-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading analytics...</div>
      </div>
    )
  }

  if (!analytics) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-green-900 flex items-center justify-center">
        <div className="text-white text-xl">Failed to load analytics data</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-green-900 py-12 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">
              Analytics Dashboard
            </h1>
            <p className="text-blue-200">Track your affiliate performance</p>
          </div>
          
          {/* Time Range Selector */}
          <div className="flex gap-2">
            {['7d', '30d', 'all'].map((range) => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={`px-4 py-2 rounded-lg font-semibold transition ${
                  timeRange === range
                    ? 'bg-yellow-400 text-gray-900'
                    : 'bg-white/10 text-white hover:bg-white/20'
                }`}
              >
                {range === '7d' ? 'Last 7 Days' : range === '30d' ? 'Last 30 Days' : 'All Time'}
              </button>
            ))}
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
            <div className="text-blue-200 text-sm mb-2">Total Clicks</div>
            <div className="text-4xl font-bold text-white">{analytics.totalClicks.toLocaleString()}</div>
          </div>

          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
            <div className="text-blue-200 text-sm mb-2">Conversions</div>
            <div className="text-4xl font-bold text-white">{analytics.totalConversions.toLocaleString()}</div>
          </div>

          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
            <div className="text-blue-200 text-sm mb-2">Conversion Rate</div>
            <div className="text-4xl font-bold text-white">{analytics.conversionRate.toFixed(2)}%</div>
          </div>

          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
            <div className="text-blue-200 text-sm mb-2">Total Revenue</div>
            <div className="text-4xl font-bold text-white">${analytics.totalRevenue.toLocaleString()}</div>
          </div>
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Clicks by Source */}
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
            <h2 className="text-2xl font-bold text-white mb-4">Clicks by Source</h2>
            <div className="space-y-3">
              {analytics.clicksBySource.length > 0 ? (
                analytics.clicksBySource.map((item) => (
                  <div key={item.source} className="flex items-center justify-between">
                    <div className="text-white font-medium">{item.source || 'Direct'}</div>
                    <div className="text-blue-200">{item.count} clicks</div>
                  </div>
                ))
              ) : (
                <div className="text-blue-200 text-center py-8">No data available</div>
              )}
            </div>
          </div>

          {/* Clicks by Offer */}
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
            <h2 className="text-2xl font-bold text-white mb-4">Performance by Offer</h2>
            <div className="space-y-3">
              {analytics.clicksByOffer.length > 0 ? (
                analytics.clicksByOffer.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between">
                    <div className="text-white font-medium">{item.offer_name}</div>
                    <div className="text-blue-200">
                      {item.clicks} clicks / {item.conversions} conversions
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-blue-200 text-center py-8">No offers tracked yet</div>
              )}
            </div>
          </div>
        </div>

        {/* Recent Clicks Table */}
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
          <h2 className="text-2xl font-bold text-white mb-4">Recent Clicks</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/20">
                  <th className="text-left py-3 px-4 text-blue-200 font-semibold">Time</th>
                  <th className="text-left py-3 px-4 text-blue-200 font-semibold">Offer ID</th>
                  <th className="text-left py-3 px-4 text-blue-200 font-semibold">Source</th>
                  <th className="text-left py-3 px-4 text-blue-200 font-semibold">Medium</th>
                  <th className="text-left py-3 px-4 text-blue-200 font-semibold">Campaign</th>
                </tr>
              </thead>
              <tbody>
                {analytics.recentClicks.length > 0 ? (
                  analytics.recentClicks.map((click, idx) => (
                    <tr key={idx} className="border-b border-white/10">
                      <td className="py-3 px-4 text-white">
                        {new Date(click.clicked_at).toLocaleString()}
                      </td>
                      <td className="py-3 px-4 text-white font-mono text-sm">
                        {click.offer_id.substring(0, 8)}...
                      </td>
                      <td className="py-3 px-4 text-blue-200">{click.utm_source || '-'}</td>
                      <td className="py-3 px-4 text-blue-200">{click.utm_medium || '-'}</td>
                      <td className="py-3 px-4 text-blue-200">{click.utm_campaign || '-'}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-blue-200">
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
            className="px-8 py-3 bg-white/10 hover:bg-white/20 text-white rounded-lg font-semibold transition border border-white/20"
          >
            ← Back to Dashboard
          </button>
        </div>
      </div>
    </div>
  )
}
