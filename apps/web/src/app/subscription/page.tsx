'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

interface Subscription {
  plan: string
  status: string
  currentPeriodEnd?: string
}

export default function SubscriptionPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [subscription, setSubscription] = useState<Subscription | null>(null)
  const [loading, setLoading] = useState(true)
  const [portalLoading, setPortalLoading] = useState(false)
  const planLevels: Record<string, number> = { starter: 33, pro: 66, agency: 100 }

  useEffect(() => {
    checkAuth()
  }, [])

  async function checkAuth() {
    try {
      const res = await fetch('/api/auth/me')
      if (!res.ok) {
        router.push('/login')
        return
      }

      const data = await res.json()
      setUser(data.user)

      // Get subscription info
      if (data.user.subscription_plan) {
        setSubscription({
          plan: data.user.subscription_plan,
          status: data.user.subscription_status || 'active',
          currentPeriodEnd: data.user.subscription_period_end,
        })
      }
    } catch (error) {
      router.push('/login')
    } finally {
      setLoading(false)
    }
  }

  async function handleManageSubscription() {
    if (!user?.stripe_customer_id) {
      alert('No active subscription found')
      return
    }

    setPortalLoading(true)

    try {
      const res = await fetch('/api/stripe/create-portal-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerId: user.stripe_customer_id,
        }),
      })

      if (!res.ok) {
        throw new Error('Failed to create portal session')
      }

      const { url } = await res.json()
      window.location.href = url
    } catch (error) {
      console.error('Portal error:', error)
      alert('Failed to open billing portal. Please try again.')
      setPortalLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="cockpit-shell page-fuel-management flex items-center justify-center">
        <div className="text-xl text-text-secondary">Loading fuel status...</div>
      </div>
    )
  }

  return (
    <div className="cockpit-shell page-fuel-management py-12">
      <div className="cockpit-container max-w-4xl">
        <div className="mb-8">
          <h1 className="mb-2 text-4xl font-semibold text-text-primary">
            Fuel Management
          </h1>
          <p className="text-text-secondary">Plan overview, status gauges, and billing controls.</p>
        </div>

        {subscription ? (
          <div className="hud-card mb-8">
            <div className="flex items-start justify-between mb-6">
              <div>
                <h2 className="mb-2 text-3xl font-semibold text-text-primary">
                  {subscription.plan.charAt(0).toUpperCase() + subscription.plan.slice(1)} Plan
                </h2>
                <div className="flex items-center gap-2">
                  <span
                    className={`rounded-full px-3 py-1 text-sm font-bold ${
                      subscription.status === 'active'
                        ? 'bg-emerald-500 text-slate-950'
                        : subscription.status === 'past_due'
                        ? 'bg-amber-400 text-slate-950'
                        : 'bg-red-500 text-white'
                    }`}
                  >
                    {subscription.status.toUpperCase()}
                  </span>
                </div>
              </div>

              <div className="text-right">
                <div className="text-4xl font-semibold text-text-primary">
                  ${subscription.plan === 'starter' ? '29' : subscription.plan === 'pro' ? '79' : '199'}
                </div>
                <div className="text-text-secondary">per month</div>
              </div>
            </div>

            <div className="mb-6 space-y-3">
              <div>
                <div className="mb-2 flex items-center justify-between text-xs uppercase tracking-system text-text-secondary">
                  <span>Subscription Fuel</span>
                  <span>{planLevels[subscription.plan] ?? 20}%</span>
                </div>
                <div className="h-3 rounded-full bg-[rgba(10,16,24,0.72)]">
                  <div
                    className="h-3 rounded-full bg-gradient-to-r from-rocket-600 to-rocket-500"
                    style={{ width: `${planLevels[subscription.plan] ?? 20}%` }}
                  />
                </div>
              </div>
              <div>
                <div className="mb-2 flex items-center justify-between text-xs uppercase tracking-system text-text-secondary">
                  <span>System Health</span>
                  <span>{subscription.status === 'active' ? '100%' : '55%'}</span>
                </div>
                <div className="h-3 rounded-full bg-[rgba(10,16,24,0.72)]">
                  <div
                    className="h-3 rounded-full bg-gradient-to-r from-sky-500 to-emerald-400"
                    style={{ width: subscription.status === 'active' ? '100%' : '55%' }}
                  />
                </div>
              </div>
            </div>

            {subscription.currentPeriodEnd && (
              <div className="mb-6 text-text-secondary">
                Next billing date: {new Date(subscription.currentPeriodEnd).toLocaleDateString()}
              </div>
            )}

            <button
              onClick={handleManageSubscription}
              disabled={portalLoading}
              className="hud-button-primary w-full px-6 py-3 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {portalLoading ? 'Loading...' : 'Manage Billing & Payment Methods'}
            </button>

            <p className="mt-4 text-center text-sm text-text-secondary">
              Update payment methods, download invoices, or cancel your subscription
            </p>
          </div>
        ) : (
          <div className="hud-card mb-8 text-center">
            <div className="mb-4 text-2xl text-text-primary">No Active Subscription</div>
            <p className="mb-6 text-text-secondary">
              Choose a plan to unlock all features and start building your affiliate funnels
            </p>
            <Link
              href="/pricing"
              className="hud-button-primary inline-block px-8 py-3"
            >
              View Pricing Plans
            </Link>
          </div>
        )}

        <div className="text-center">
          <Link
            href="/dashboard"
            className="hud-button-secondary inline-block px-8 py-3"
          >
            ← Back to Dashboard
          </Link>
        </div>
      </div>
    </div>
  )
}
