'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { getAdminOverview, getAdminProviderTotals, getAdminUsers, type AdminAnalyticsTotals, type AdminOverview, type AdminUserRecord } from '@/lib/api/admin'
import { PageHeader } from '@/features/shared/ui'
import AdminSkeleton from './AdminSkeleton'

function currency(value: number) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 2,
  }).format(value)
}

export default function AdminWorkspace() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [overview, setOverview] = useState<AdminOverview | null>(null)
  const [users, setUsers] = useState<AdminUserRecord[]>([])
  const [providerTotals, setProviderTotals] = useState<AdminAnalyticsTotals[]>([])

  useEffect(() => {
    let active = true

    async function load() {
      try {
        setLoading(true)
        setError(null)

        const [overviewData, usersData, providerData] = await Promise.all([
          getAdminOverview(),
          getAdminUsers(),
          getAdminProviderTotals(),
        ])

        if (active) {
          setOverview(overviewData)
          setUsers(usersData)
          setProviderTotals(providerData)
        }
      } catch (err) {
        if (active) {
          setError(err instanceof Error ? err.message : 'Failed to load admin view')
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
  }, [])

  if (loading) {
    return <AdminSkeleton />
  }

  return (
    <main className="cockpit-shell page-command-authority py-8">
      <div className="cockpit-container max-w-6xl space-y-6">
        <PageHeader
          eyebrow="Admin"
          title="System Analytics and User Management"
          description="Command view for users, platform metrics, and revenue overview."
        />

        {error && <section className="rounded-lg border border-red-400/35 bg-red-500/12 p-4 text-red-200">{error}</section>}

        <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
          <article className="hud-card">
            <p className="text-xs uppercase tracking-system text-text-secondary">Users</p>
            <p className="mt-3 text-2xl font-semibold text-text-primary">{overview?.totalUsers || 0}</p>
          </article>
          <article className="hud-card">
            <p className="text-xs uppercase tracking-system text-text-secondary">Funnels</p>
            <p className="mt-3 text-2xl font-semibold text-text-primary">{overview?.totalFunnels || 0}</p>
          </article>
          <article className="hud-card">
            <p className="text-xs uppercase tracking-system text-text-secondary">Revenue</p>
            <p className="mt-3 text-2xl font-semibold text-text-primary">{currency(overview?.totalRevenue || 0)}</p>
          </article>
          <article className="hud-card">
            <p className="text-xs uppercase tracking-system text-text-secondary">Clicks</p>
            <p className="mt-3 text-2xl font-semibold text-text-primary">{overview?.totalClicks || 0}</p>
          </article>
          <article className="hud-card">
            <p className="text-xs uppercase tracking-system text-text-secondary">Conversions</p>
            <p className="mt-3 text-2xl font-semibold text-text-primary">{overview?.totalConversions || 0}</p>
          </article>
        </section>

        <section className="grid grid-cols-1 gap-6 xl:grid-cols-2">
          <article className="hud-card overflow-x-auto">
            <h2 className="mb-4 text-xl font-semibold text-text-primary">User Management</h2>
            <div className="mb-4">
              <Link
                href="/admin/beta-testers"
                className="inline-flex rounded-lg border border-rocket-500/45 bg-[rgba(46,230,194,0.12)] px-3 py-2 text-sm font-medium text-rocket-500 transition hover:bg-[rgba(46,230,194,0.2)]"
              >
                Open Beta Tester Roster
              </Link>
            </div>
            <table className="min-w-full text-sm">
              <thead>
                <tr className="border-b border-[var(--border-subtle)] text-left text-text-secondary">
                  <th className="px-3 py-2">Email</th>
                  <th className="px-3 py-2">Role</th>
                  <th className="px-3 py-2">Plan</th>
                  <th className="px-3 py-2">Created</th>
                </tr>
              </thead>
              <tbody>
                {users.slice(0, 25).map((user) => (
                  <tr key={user.id} className="border-b border-[var(--border-subtle)] text-text-primary">
                    <td className="px-3 py-3">{user.email || user.id}</td>
                    <td className="px-3 py-3">{user.role || (user.is_admin ? 'admin' : 'user')}</td>
                    <td className="px-3 py-3">{user.subscription_plan || user.plan || 'free'}</td>
                    <td className="px-3 py-3 text-text-secondary">
                      {user.created_at ? new Date(user.created_at).toLocaleDateString() : '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </article>

          <article className="hud-card">
            <h2 className="mb-4 text-xl font-semibold text-text-primary">System Analytics</h2>
            <div className="space-y-3">
              {providerTotals.length === 0 && <p className="text-sm text-text-secondary">No provider telemetry available.</p>}
              {providerTotals.map((provider) => (
                <div key={provider.provider} className="rounded-lg border border-[var(--border-subtle)] p-3">
                  <p className="font-medium text-text-primary">{provider.provider}</p>
                  <p className="text-sm text-text-secondary">
                    Requests: {provider.requests.toLocaleString()} · Cost: {currency(provider.total_cost)}
                  </p>
                </div>
              ))}
            </div>
          </article>
        </section>
      </div>
    </main>
  )
}
