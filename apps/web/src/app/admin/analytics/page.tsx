'use client'

import React, { useEffect, useState } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

interface ProviderTotal {
  provider: string
  requests: number
  total_cost: number
}

interface AnalyticsData {
  totals?: ProviderTotal[]
  costSummary?: any
  topUsers?: any[]
}

export default function AdminAnalytics() {
  const supabase = createClientComponentClient()
  const router = useRouter()
  
  const [user, setUser] = useState<any>(null)
  const [isAdmin, setIsAdmin] = useState(false)
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState<AnalyticsData | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    checkAuthAndLoadData()
  }, [])

  async function checkAuthAndLoadData() {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login')
        return
      }
      setUser(user)

      const { data: adminUser, error: adminError } = await supabase
        .from('users')
        .select('is_admin')
        .eq('id', user.id)
        .single()

      if (adminError || !adminUser?.is_admin) {
        router.push('/dashboard')
        return
      }
      
      setIsAdmin(true)
      
      // Load analytics data
      await loadAnalytics()
    } catch (error) {
      console.error('Auth error:', error)
      router.push('/login')
    } finally {
      setLoading(false)
    }
  }

  async function loadAnalytics() {
    try {
      const response = await fetch('/api/admin/analytics')
      
      if (!response.ok) {
        throw new Error('Failed to fetch analytics')
      }
      
      const analyticsData = await response.json()
      setData(analyticsData)
    } catch (err: any) {
      console.error('Analytics error:', err)
      setError(err.message || 'Failed to load analytics')
    }
  }

  if (loading) {
    return (
      <div className="cockpit-shell page-command-authority flex items-center justify-center">
        <div className="text-center">
          <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-b-2 border-anchor-400"></div>
          <p className="text-text-secondary">Loading command telemetry...</p>
        </div>
      </div>
    )
  }

  if (!user || !isAdmin) {
    return (
      <div className="cockpit-shell page-command-authority flex items-center justify-center">
        <div className="hud-card max-w-md">
          <h1 className="mb-4 text-2xl font-semibold text-text-primary">Access Denied</h1>
          <p className="mb-6 text-text-secondary">This page is only accessible to administrators.</p>
          <Link href="/dashboard" className="hud-button-primary inline-block">
            Return to Dashboard
          </Link>
        </div>
      </div>
    )
  }

  // Safely calculate totals with proper type checking
  let totalRequests = 0
  let totalCost = 0
  
  if (data?.totals && Array.isArray(data.totals)) {
    totalRequests = data.totals.reduce((sum, t) => {
      if (!t) return sum
      // Parse requests as integer, handling any type
      const requests = typeof t.requests === 'number' ? t.requests : parseInt(String(t.requests || 0))
      return sum + (isNaN(requests) ? 0 : requests)
    }, 0)
    
    totalCost = data.totals.reduce((sum, t) => {
      if (!t) return sum
      // Parse cost as float, handling any type
      const cost = typeof t.total_cost === 'number' ? t.total_cost : parseFloat(String(t.total_cost || 0))
      return sum + (isNaN(cost) ? 0 : cost)
    }, 0)
  }

  return (
    <div className="cockpit-shell page-command-authority py-8">
      <div className="cockpit-container max-w-6xl">
        <div className="mb-6">
          <Link href="/dashboard" className="text-text-secondary transition hover:text-text-primary">
            ← Back to Dashboard
          </Link>
        </div>

        <div className="hud-card mb-8 border-[rgba(174,183,194,0.22)]">
          <div className="flex items-center gap-3 mb-6">
            <span className="text-4xl">📊</span>
            <div>
              <h1 className="text-3xl font-semibold text-text-primary">Command Analytics</h1>
              <p className="text-text-secondary">AI usage and cost tracking</p>
            </div>
          </div>

          {error && (
            <div className="mb-6 rounded-xl border border-red-400/35 bg-red-500/12 p-4">
              <p className="text-red-200">{error}</p>
            </div>
          )}

          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="hud-card-tight p-6">
              <div className="mb-1 text-sm font-semibold uppercase tracking-system text-text-secondary">Total Requests</div>
              <div className="text-3xl font-semibold text-text-primary">
                {totalRequests.toLocaleString()}
              </div>
            </div>
            <div className="hud-card-tight p-6">
              <div className="mb-1 text-sm font-semibold uppercase tracking-system text-text-secondary">Total Cost</div>
              <div className="text-3xl font-semibold text-text-primary">
                ${totalCost.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
            </div>
          </div>

          {/* Provider Breakdown */}
          <section className="mb-8">
            <h2 className="mb-4 text-xl font-semibold text-text-primary">Usage by Provider</h2>
            {data?.totals && data.totals.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-[var(--border-subtle)]">
                      <th className="px-4 py-3 text-left font-semibold text-text-secondary">Provider</th>
                      <th className="px-4 py-3 text-right font-semibold text-text-secondary">Requests</th>
                      <th className="px-4 py-3 text-right font-semibold text-text-secondary">Total Cost</th>
                      <th className="px-4 py-3 text-right font-semibold text-text-secondary">Avg Cost</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.totals.map((t, idx) => {
                      if (!t) return null
                      
                      // Safely parse numeric values, handling any potential date/string values
                      const totalCostRaw = t.total_cost
                      const requestsRaw = t.requests
                      
                      const totalCost = typeof totalCostRaw === 'number' ? totalCostRaw : parseFloat(String(totalCostRaw || 0))
                      const requests = typeof requestsRaw === 'number' ? requestsRaw : parseInt(String(requestsRaw || 0))
                      const avgCost = requests > 0 && !isNaN(totalCost) ? totalCost / requests : 0
                      
                      return (
                        <tr key={t.provider || `unknown-${idx}`} className="border-b border-[var(--border-subtle)] hover:bg-[rgba(255,255,255,0.03)]">
                          <td className="px-4 py-3 font-semibold text-text-primary">{String(t.provider || 'Unknown')}</td>
                          <td className="px-4 py-3 text-right text-text-primary">
                            {(isNaN(requests) ? 0 : requests).toLocaleString()}
                          </td>
                          <td className="px-4 py-3 text-right font-semibold text-rocket-500">
                            ${(isNaN(totalCost) ? 0 : totalCost).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </td>
                          <td className="px-4 py-3 text-right text-text-secondary">
                            {requests > 0 && !isNaN(avgCost) && avgCost > 0
                              ? `$${avgCost.toFixed(4)}`
                              : '$0.0000'}
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="py-8 text-center text-text-secondary">
                No usage data available
              </div>
            )}
          </section>

          {/* Top Users */}
          {data?.topUsers && data.topUsers.length > 0 && (
            <section>
              <h2 className="mb-4 text-xl font-semibold text-text-primary">Top AI Users</h2>
              <div className="overflow-x-auto rounded-lg border border-[var(--border-subtle)] bg-[rgba(10,16,24,0.55)] p-4">
                <pre className="text-sm text-text-secondary">
                  {JSON.stringify(data.topUsers, null, 2)}
                </pre>
              </div>
            </section>
          )}

          {/* Cost Summary */}
          {data?.costSummary && (
            <section className="mt-8">
              <h2 className="mb-4 text-xl font-semibold text-text-primary">Cost Summary</h2>
              <div className="overflow-x-auto rounded-lg border border-[var(--border-subtle)] bg-[rgba(10,16,24,0.55)] p-4">
                <pre className="text-sm text-text-secondary">
                  {JSON.stringify(data.costSummary, null, 2)}
                </pre>
              </div>
            </section>
          )}
        </div>

        {/* Refresh Button */}
        <div className="text-center">
          <button
            onClick={loadAnalytics}
            className="hud-button-secondary px-8 py-3"
          >
            Refresh Analytics 🔄
          </button>
        </div>
      </div>
    </div>
  )
}
