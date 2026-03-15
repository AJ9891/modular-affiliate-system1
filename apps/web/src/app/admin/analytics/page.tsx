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
        .select('is_admin, role')
        .eq('id', user.id)
        .single()

      const allowed = adminUser?.is_admin || adminUser?.role === 'admin' || adminUser?.role === 'owner'

      if (adminError || !allowed) {
        router.push('/dashboard')
        return
      }

      setIsAdmin(true)
      await loadAnalytics()
    } catch (err) {
      console.error('Auth error:', err)
      router.push('/login')
    } finally {
      setLoading(false)
    }
  }

  async function loadAnalytics() {
    try {
      const response = await fetch('/api/admin/analytics')
      if (!response.ok) throw new Error('Failed to fetch analytics')
      const analyticsData = await response.json()
      setData(analyticsData)
    } catch (err: any) {
      console.error('Analytics error:', err)
      setError(err.message || 'Failed to load analytics')
    }
  }

  if (loading) {
    return (
      <div className="theme-command cockpit-shell page-command-authority flex items-center justify-center">
        <div className="text-center text-white/80 space-y-2">
          <div className="mx-auto mb-2 h-12 w-12 animate-spin rounded-full border-b-2 border-cyan-400" />
          <p>Loading command telemetry…</p>
        </div>
      </div>
    )
  }

  if (!user || !isAdmin) {
    return (
      <div className="theme-command cockpit-shell page-command-authority flex items-center justify-center">
        <div className="glass-tile max-w-md text-white">
          <h1 className="mb-3 text-2xl font-semibold">Access Denied</h1>
          <p className="mb-5 text-white/75">This page is only accessible to administrators.</p>
          <Link href="/dashboard" className="hud-button-primary inline-block">
            Return to Dashboard
          </Link>
        </div>
      </div>
    )
  }

  // Safely calculate totals
  let totalRequests = 0
  let totalCost = 0
  if (data?.totals && Array.isArray(data.totals)) {
    totalRequests = data.totals.reduce((sum, t) => {
      if (!t) return sum
      const req = typeof t.requests === 'number' ? t.requests : parseInt(String(t.requests || 0))
      return sum + (isNaN(req) ? 0 : req)
    }, 0)
    totalCost = data.totals.reduce((sum, t) => {
      if (!t) return sum
      const c = typeof t.total_cost === 'number' ? t.total_cost : parseFloat(String(t.total_cost || 0))
      return sum + (isNaN(c) ? 0 : c)
    }, 0)
  }

  return (
    <div className="theme-command cockpit-shell page-command-authority py-8">
      <div className="cockpit-container max-w-6xl space-y-8">
        <div className="glass-tile">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.25em] text-white/60">Admin · Command</p>
              <h1 className="text-3xl font-semibold text-white">Command Analytics</h1>
              <p className="text-white/70">System-level usage, cost, and provider telemetry.</p>
            </div>
            <Link href="/dashboard" className="text-white/60 hover:text-white text-sm">
              ← Back to Dashboard
            </Link>
          </div>
        </div>

        {error && (
          <div className="glass-tile border border-red-400/40 bg-red-500/10 text-red-100">
            {error}
          </div>
        )}

        <div className="glass-tile grid gap-6 md:grid-cols-3">
          <Metric label="Total Requests" value={totalRequests.toLocaleString()} />
          <Metric label="Total Cost" value={`$${totalCost.toFixed(2)}`} />
          <Metric label="Providers" value={data?.totals?.length || 0} />
        </div>

        {/* Provider Totals */}
        {data?.totals && (
          <section className="glass-tile">
            <h2 className="mb-4 text-xl font-semibold text-white">Provider Totals</h2>
            <div className="overflow-x-auto rounded-lg border border-white/10">
              <table className="min-w-full text-sm text-white/80">
                <thead className="bg-white/5 text-white">
                  <tr>
                    <th className="px-4 py-3 text-left">Provider</th>
                    <th className="px-4 py-3 text-left">Requests</th>
                    <th className="px-4 py-3 text-left">Cost</th>
                  </tr>
                </thead>
                <tbody>
                  {data.totals.map((t, idx) => {
                    if (!t) return null
                    return (
                      <tr key={t.provider || `p-${idx}`} className="border-t border-white/10">
                        <td className="px-4 py-3">{t.provider || 'Unknown'}</td>
                        <td className="px-4 py-3">{t.requests?.toLocaleString?.() ?? t.requests}</td>
                        <td className="px-4 py-3">${Number(t.total_cost || 0).toFixed(4)}</td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {/* Top Users */}
        {data?.topUsers && data.topUsers.length > 0 && (
          <section className="glass-tile">
            <h2 className="mb-3 text-xl font-semibold text-white">Top AI Users</h2>
            <div className="overflow-x-auto rounded-lg border border-white/10 bg-black/20 p-4">
              <pre className="text-sm text-white/80 whitespace-pre-wrap">
                {JSON.stringify(data.topUsers, null, 2)}
              </pre>
            </div>
          </section>
        )}

        {/* Cost Summary */}
        {data?.costSummary && (
          <section className="glass-tile">
            <h2 className="mb-3 text-xl font-semibold text-white">Cost Summary</h2>
            <div className="overflow-x-auto rounded-lg border border-white/10 bg-black/20 p-4">
              <pre className="text-sm text-white/80 whitespace-pre-wrap">
                {JSON.stringify(data.costSummary, null, 2)}
              </pre>
            </div>
          </section>
        )}

        <div className="text-center">
          <button onClick={loadAnalytics} className="hud-button-secondary px-8 py-3">
            Refresh Analytics 🔄
          </button>
        </div>
      </div>
    </div>
  )
}

function Metric({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="glass-tile bg-white/5 border border-white/10">
      <p className="text-xs uppercase tracking-[0.2em] text-white/60">{label}</p>
      <p className="mt-2 text-2xl font-semibold text-white">{value}</p>
    </div>
  )
}
