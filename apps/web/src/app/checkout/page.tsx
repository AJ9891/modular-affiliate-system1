'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'

export const runtime = 'edge'

export default function CheckoutPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [loading, setLoading] = useState(false)
  const [selectedPlan, setSelectedPlan] = useState<'starter' | 'pro' | 'agency'>('pro')

  useEffect(() => {
    const plan = searchParams.get('plan') as 'starter' | 'pro' | 'agency'
    if (plan && ['starter', 'pro', 'agency'].includes(plan)) {
      setSelectedPlan(plan)
    }
  }, [searchParams])

  const plans = {
    starter: {
      name: 'Starter',
      price: 29,
      features: [
        '1 Active Funnel',
        'Basic Templates',
        'Analytics Dashboard',
        'Email Support',
      ],
      popular: false,
    },
    pro: {
      name: 'Pro',
      price: 79,
      features: [
        'Unlimited Funnels',
        'Premium Templates',
        'AI Content Generation',
        'Advanced Analytics',
        'Priority Support',
      ],
      popular: true,
    },
    agency: {
      name: 'Agency',
      price: 199,
      features: [
        'Everything in Pro',
        'White Label Options',
        'Team Collaboration',
        'Custom Integrations',
        'Dedicated Account Manager',
      ],
      popular: false,
    },
  }

  const handleCheckout = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/stripe/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          plan: selectedPlan,
          userId: 'user-id', // This should come from auth context
          email: 'user@example.com', // This should come from auth context
        }),
      })

      if (!res.ok) {
        const error = await res.json()
        alert(error.error || 'Failed to create checkout session')
        return
      }

      const data = await res.json()
      if (data.url) {
        window.location.href = data.url
      }
    } catch (error) {
      console.error('Checkout error:', error)
      alert('Failed to proceed to checkout')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-green-900 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-white mb-4">
            Choose Your Plan
          </h1>
          <p className="text-xl text-blue-200">
            Select the perfect plan for your affiliate marketing goals
          </p>
        </div>

        {/* Plan Selection */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          {Object.entries(plans).map(([key, plan]) => (
            <div
              key={key}
              onClick={() => setSelectedPlan(key as any)}
              className={`
                relative cursor-pointer rounded-2xl p-8 transition-all duration-300
                ${selectedPlan === key
                  ? 'bg-white shadow-2xl scale-105 ring-4 ring-yellow-400'
                  : 'bg-white/10 backdrop-blur-lg border border-white/20 hover:scale-102'
                }
              `}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-yellow-400 text-gray-900 px-4 py-1 rounded-full text-sm font-bold">
                  POPULAR
                </div>
              )}
              
              <div className={selectedPlan === key ? 'text-gray-900' : 'text-white'}>
                <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                <div className="text-4xl font-bold mb-6">
                  ${plan.price}
                  <span className={`text-xl ${selectedPlan === key ? 'text-gray-600' : 'text-blue-200'}`}>
                    /mo
                  </span>
                </div>
                
                <ul className="space-y-3 mb-6">
                  {plan.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start">
                      <span className={`mr-2 ${selectedPlan === key ? 'text-green-600' : 'text-yellow-400'}`}>
                        ✓
                      </span>
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>

                {selectedPlan === key && (
                  <div className="mt-4 p-3 bg-yellow-400/20 rounded-lg text-center font-semibold">
                    Selected
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Checkout Button */}
        <div className="max-w-md mx-auto">
          <button
            onClick={handleCheckout}
            disabled={loading}
            className="w-full px-8 py-4 bg-yellow-400 hover:bg-yellow-500 text-gray-900 rounded-lg font-bold text-xl transition disabled:opacity-50 disabled:cursor-not-allowed shadow-lg mb-4"
          >
            {loading ? 'Processing...' : `Continue with ${plans[selectedPlan].name} - $${plans[selectedPlan].price}/mo`}
          </button>
          
          <p className="text-center text-blue-200 text-sm mb-4">
            14-day money-back guarantee • Cancel anytime
          </p>
          
          <Link
            href="/pricing"
            className="block text-center text-white hover:text-yellow-400 transition"
          >
            ← Back to Pricing
          </Link>
        </div>

        {/* Trust Indicators */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
            <div className="text-3xl mb-2">🔒</div>
            <h4 className="text-white font-semibold mb-1">Secure Payment</h4>
            <p className="text-blue-200 text-sm">256-bit SSL encryption</p>
          </div>
          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
            <div className="text-3xl mb-2">💳</div>
            <h4 className="text-white font-semibold mb-1">Flexible Billing</h4>
            <p className="text-blue-200 text-sm">Monthly or annual options</p>
          </div>
          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
            <div className="text-3xl mb-2">✨</div>
            <h4 className="text-white font-semibold mb-1">Instant Access</h4>
            <p className="text-blue-200 text-sm">Start building immediately</p>
          </div>
        </div>
      </div>
    </div>
  )
}
