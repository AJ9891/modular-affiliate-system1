'use client'

import { useState, useEffect } from 'react'

interface StripeConnectStatus {
  connected: boolean
  onboardingComplete: boolean
  chargesEnabled: boolean
  payoutsEnabled: boolean
  accountId?: string
}

export default function StripeConnectSection() {
  const [status, setStatus] = useState<StripeConnectStatus | null>(null)
  const [loading, setLoading] = useState(true)
  const [connecting, setConnecting] = useState(false)

  useEffect(() => {
    checkStatus()
  }, [])

  const checkStatus = async () => {
    try {
      const response = await fetch('/api/stripe/connect/status')
      if (response.ok) {
        const data = await response.json()
        setStatus(data)
      }
    } catch (error) {
      console.error('Error checking Stripe Connect status:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleConnect = async () => {
    setConnecting(true)
    try {
      const response = await fetch('/api/stripe/connect/onboard', {
        method: 'POST'
      })

      if (response.ok) {
        const data = await response.json()
        // Redirect to Stripe onboarding
        window.location.href = data.url
      } else {
        const error = await response.json()
        alert('Error: ' + error.error)
      }
    } catch (error) {
      console.error('Error connecting to Stripe:', error)
      alert('Failed to connect to Stripe')
    } finally {
      setConnecting(false)
    }
  }

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900">💳 Stripe Connect</h2>
          <p className="text-sm text-gray-600">Connect your bank account to receive affiliate payouts</p>
        </div>
        <div className="flex items-center gap-2">
          {status?.connected && status?.onboardingComplete && status?.payoutsEnabled ? (
            <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
              ✅ Connected
            </span>
          ) : status?.connected && !status?.onboardingComplete ? (
            <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm font-medium">
              ⏳ Setup Required
            </span>
          ) : (
            <span className="px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-sm font-medium">
              ❌ Not Connected
            </span>
          )}
        </div>
      </div>

      <div className="space-y-3">
        {!status?.connected ? (
          <div>
            <p className="text-sm text-gray-600 mb-3">
              To receive payments from your affiliate commissions, you need to connect your bank account through Stripe.
            </p>
            <button
              onClick={handleConnect}
              disabled={connecting}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
            >
              {connecting ? 'Connecting...' : 'Connect Bank Account'}
            </button>
          </div>
        ) : !status?.onboardingComplete ? (
          <div>
            <p className="text-sm text-gray-600 mb-3">
              Your Stripe account is created but needs additional setup. Click below to complete the onboarding process.
            </p>
            <button
              onClick={handleConnect}
              disabled={connecting}
              className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
            >
              {connecting ? 'Loading...' : 'Complete Setup'}
            </button>
          </div>
        ) : status?.payoutsEnabled ? (
          <div>
            <p className="text-sm text-green-600 mb-2">
              ✅ Your account is fully set up and ready to receive payouts!
            </p>
            <p className="text-xs text-gray-500">
              Account ID: {status.accountId}
            </p>
          </div>
        ) : (
          <div>
            <p className="text-sm text-yellow-600 mb-3">
              Your onboarding is complete, but payouts are not yet enabled. This usually takes 24-48 hours after setup.
            </p>
            <button
              onClick={checkStatus}
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 font-medium"
            >
              Check Status
            </button>
          </div>
        )}
      </div>
    </div>
  )
}