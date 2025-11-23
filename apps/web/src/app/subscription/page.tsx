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
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-green-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading subscription...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-green-900 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">
            Subscription Management
          </h1>
          <p className="text-blue-200">Manage your plan and billing</p>
        </div>

        {subscription ? (
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20 mb-8">
            <div className="flex items-start justify-between mb-6">
              <div>
                <h2 className="text-3xl font-bold text-white mb-2">
                  {subscription.plan.charAt(0).toUpperCase() + subscription.plan.slice(1)} Plan
                </h2>
                <div className="flex items-center gap-2">
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-bold ${
                      subscription.status === 'active'
                        ? 'bg-green-500 text-white'
                        : subscription.status === 'past_due'
                        ? 'bg-yellow-500 text-gray-900'
                        : 'bg-red-500 text-white'
                    }`}
                  >
                    {subscription.status.toUpperCase()}
                  </span>
                </div>
              </div>

              <div className="text-right">
                <div className="text-4xl font-bold text-white">
                  ${subscription.plan === 'starter' ? '29' : subscription.plan === 'pro' ? '79' : '199'}
                </div>
                <div className="text-blue-200">per month</div>
              </div>
            </div>

            {subscription.currentPeriodEnd && (
              <div className="mb-6 text-blue-200">
                Next billing date: {new Date(subscription.currentPeriodEnd).toLocaleDateString()}
              </div>
            )}

            <button
              onClick={handleManageSubscription}
              disabled={portalLoading}
              className="w-full px-6 py-3 bg-yellow-400 hover:bg-yellow-500 text-gray-900 rounded-lg font-bold transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {portalLoading ? 'Loading...' : 'Manage Billing & Payment Methods'}
            </button>

            <p className="text-sm text-blue-200 mt-4 text-center">
              Update payment methods, download invoices, or cancel your subscription
            </p>
          </div>
        ) : (
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-12 border border-white/20 mb-8 text-center">
            <div className="text-white text-2xl mb-4">No Active Subscription</div>
            <p className="text-blue-200 mb-6">
              Choose a plan to unlock all features and start building your affiliate funnels
            </p>
            <Link
              href="/pricing"
              className="inline-block px-8 py-3 bg-yellow-400 hover:bg-yellow-500 text-gray-900 rounded-lg font-bold transition"
            >
              View Pricing Plans
            </Link>
          </div>
        )}

        <div className="text-center">
          <Link
            href="/dashboard"
            className="inline-block px-8 py-3 bg-white/10 hover:bg-white/20 text-white rounded-lg font-semibold transition border border-white/20"
          >
            ← Back to Dashboard
          </Link>
        </div>
      </div>
    </div>
  )
}
