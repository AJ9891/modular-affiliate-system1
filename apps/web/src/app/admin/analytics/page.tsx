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
      <div className="min-h-screen flex items-center justify-center bg-brand-gradient launch-pad">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-orange mx-auto mb-4"></div>
          <p className="text-white">Loading analytics...</p>
        </div>
      </div>
    )
  }

  if (!user || !isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-brand-gradient launch-pad">
        <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl p-8 border-2 border-brand-purple/20 max-w-md">
          <h1 className="text-2xl font-bold text-brand-navy mb-4">Access Denied</h1>
          <p className="text-brand-purple mb-6">This page is only accessible to administrators.</p>
          <Link href="/dashboard" className="btn-launch inline-block">
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
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-6">
          <Link href="/dashboard" className="text-brand-purple hover:text-brand-cyan transition-colors">
            ← Back to Dashboard
          </Link>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-8 border-2 border-brand-purple/20 mb-8">
          <div className="flex items-center gap-3 mb-6">
            <span className="text-4xl">📊</span>
            <div>
              <h1 className="text-3xl font-bold text-brand-navy">Admin Analytics</h1>
              <p className="text-brand-purple">AI usage and cost tracking</p>
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border-2 border-red-500 rounded-xl p-4 mb-6">
              <p className="text-red-700">{error}</p>
            </div>
          )}

          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="bg-brand-purple/10 rounded-xl p-6 border-2 border-brand-purple/30">
              <div className="text-sm text-brand-purple font-semibold mb-1">Total Requests</div>
              <div className="text-3xl font-bold text-brand-navy">
                {totalRequests.toLocaleString()}
              </div>
            </div>
            <div className="bg-brand-orange/10 rounded-xl p-6 border-2 border-brand-orange/30">
              <div className="text-sm text-brand-orange font-semibold mb-1">Total Cost</div>
              <div className="text-3xl font-bold text-brand-navy">
                ${totalCost.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
            </div>
          </div>

          {/* Provider Breakdown */}
          <section className="mb-8">
            <h2 className="text-xl font-bold text-brand-navy mb-4">Usage by Provider</h2>
            {data?.totals && data.totals.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b-2 border-brand-purple/20">
                      <th className="text-left py-3 px-4 text-brand-purple font-semibold">Provider</th>
                      <th className="text-right py-3 px-4 text-brand-purple font-semibold">Requests</th>
                      <th className="text-right py-3 px-4 text-brand-purple font-semibold">Total Cost</th>
                      <th className="text-right py-3 px-4 text-brand-purple font-semibold">Avg Cost</th>
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
                        <tr key={t.provider || `unknown-${idx}`} className="border-b border-brand-purple/10 hover:bg-brand-purple/5">
                          <td className="py-3 px-4 font-semibold text-brand-navy">{String(t.provider || 'Unknown')}</td>
                          <td className="py-3 px-4 text-right text-brand-navy">
                            {(isNaN(requests) ? 0 : requests).toLocaleString()}
                          </td>
                          <td className="py-3 px-4 text-right text-brand-orange font-semibold">
                            ${(isNaN(totalCost) ? 0 : totalCost).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </td>
                          <td className="py-3 px-4 text-right text-brand-cyan">
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
              <div className="text-center py-8 text-brand-purple">
                No usage data available
              </div>
            )}
          </section>

          {/* Top Users */}
          {data?.topUsers && data.topUsers.length > 0 && (
            <section>
              <h2 className="text-xl font-bold text-brand-navy mb-4">Top AI Users</h2>
              <div className="bg-brand-cyan/10 border border-brand-cyan/30 rounded-lg p-4 overflow-x-auto">
                <pre className="text-sm text-brand-navy">
                  {JSON.stringify(data.topUsers, null, 2)}
                </pre>
              </div>
            </section>
          )}

          {/* Cost Summary */}
          {data?.costSummary && (
            <section className="mt-8">
              <h2 className="text-xl font-bold text-brand-navy mb-4">Cost Summary</h2>
              <div className="bg-brand-purple/10 border border-brand-purple/30 rounded-lg p-4 overflow-x-auto">
                <pre className="text-sm text-brand-navy">
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
            className="btn-launch px-8 py-3"
          >
            Refresh Analytics 🔄
          </button>
        </div>
      </div>
    </div>
  )
}
