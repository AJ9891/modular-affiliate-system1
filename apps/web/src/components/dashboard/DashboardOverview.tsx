'use client'

import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'
import { getDashboardData, type DashboardData } from '@/lib/api/dashboard'
import DashboardSkeleton from './DashboardSkeleton'

const ranges = [
  { value: '7d', label: '7 days' },
  { value: '30d', label: '30 days' },
  { value: '90d', label: '90 days' },
]

function currency(value: number) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(value)
}

export default function DashboardOverview() {
  const [range, setRange] = useState('7d')
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let active = true

    async function load() {
      try {
        setLoading(true)
        setError(null)
        const next = await getDashboardData(range)
        if (active) {
          setData(next)
        }
      } catch (err) {
        if (active) {
          setError(err instanceof Error ? err.message : 'Failed to load dashboard')
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

  const stats = useMemo(() => {
    if (!data) {
      return []
    }

    return [
      { label: 'Funnels', value: data.totals.funnels.toLocaleString() },
      { label: 'Leads', value: data.totals.leads.toLocaleString() },
      { label: 'Clicks', value: data.totals.clicks.toLocaleString() },
      { label: 'Revenue', value: currency(data.totals.revenue) },
    ]
  }, [data])

  if (loading && !data) {
    return <DashboardSkeleton />
  }

  return (
    <main className="cockpit-shell page-mission-control py-8">
      <div className="cockpit-container max-w-6xl space-y-6">
        <section className="hud-panel flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs uppercase tracking-system text-text-secondary">Dashboard</p>
            <h1 className="text-3xl font-semibold text-text-primary md:text-4xl">Performance Control Center</h1>
            <p className="mt-2 text-sm text-text-secondary">Analytics, activity, and operations in one place.</p>
          </div>
          <div className="flex gap-2">
            {ranges.map((item) => (
              <button
                key={item.value}
                type="button"
                onClick={() => setRange(item.value)}
                className={`rounded-lg px-3 py-2 text-sm ${
                  range === item.value
                    ? 'bg-rocket-500 text-slate-950'
                    : 'border border-[var(--border-subtle)] text-text-secondary hover:text-text-primary'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </section>

        {error && (
          <section className="rounded-lg border border-red-400/30 bg-red-500/10 p-4 text-red-200">
            {error}
          </section>
        )}

        <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {stats.map((stat) => (
            <article key={stat.label} className="hud-card">
              <p className="text-xs uppercase tracking-system text-text-secondary">{stat.label}</p>
              <p className="mt-3 text-3xl font-semibold text-text-primary">{stat.value}</p>
            </article>
          ))}
        </section>

        <section className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <article className="hud-card">
            <h2 className="text-xl font-semibold text-text-primary">Traffic Sources</h2>
            <div className="mt-4 space-y-3">
              {(data?.sourceBreakdown || []).length === 0 && (
                <p className="text-sm text-text-secondary">No source data yet.</p>
              )}
              {(data?.sourceBreakdown || []).map((source) => (
                <div key={source.source}>
                  <div className="mb-1 flex items-center justify-between text-sm">
                    <span className="text-text-primary">{source.source}</span>
                    <span className="text-text-secondary">{source.count}</span>
                  </div>
                  <div className="h-2 rounded-full bg-[rgba(10,16,24,0.65)]">
                    <div
                      className="h-2 rounded-full bg-gradient-to-r from-rocket-600 to-rocket-500"
                      style={{
                        width: `${Math.min(100, source.count * 4)}%`,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </article>

          <article className="hud-card">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-text-primary">Recent Activity</h2>
              <span className="text-xs uppercase tracking-system text-text-secondary">Live feed</span>
            </div>
            <div className="space-y-3">
              {(data?.recentActivity || []).length === 0 && (
                <p className="text-sm text-text-secondary">No activity events yet.</p>
              )}
              {(data?.recentActivity || []).slice(0, 7).map((item, index) => (
                <div
                  key={`${item.timestamp}-${index}`}
                  className="rounded-lg border border-[var(--border-subtle)] bg-[rgba(10,16,24,0.46)] p-3"
                >
                  <p className="text-sm font-medium text-text-primary">{item.type.replace('_', ' ')}</p>
                  <p className="text-xs text-text-secondary">
                    {new Date(item.timestamp).toLocaleString()} · {item.source || item.email || item.funnel || 'system'}
                  </p>
                </div>
              ))}
            </div>
          </article>
        </section>

        <section className="grid grid-cols-1 gap-3 md:grid-cols-4">
          <Link href="/funnels" className="hud-card text-center text-text-primary hover:border-rocket-500/40">
            Funnels
          </Link>
          <Link href="/analytics" className="hud-card text-center text-text-primary hover:border-rocket-500/40">
            Analytics
          </Link>
          <Link href="/email" className="hud-card text-center text-text-primary hover:border-rocket-500/40">
            Email
          </Link>
          <Link href="/affiliates" className="hud-card text-center text-text-primary hover:border-rocket-500/40">
            Affiliates
          </Link>
        </section>
      </div>
    </main>
  )
}
