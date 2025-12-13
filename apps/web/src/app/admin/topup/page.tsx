'use client'

import React, { useState, useEffect } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'

export default function TopUpAdminPage() {
  const supabase = createClientComponentClient()
  const router = useRouter()
  const searchParams = useSearchParams()
  const sessionId = searchParams.get('session_id')
  
  const [user, setUser] = useState<any>(null)
  const [isAdmin, setIsAdmin] = useState(false)
  const [loading, setLoading] = useState(true)
  const [targetUserId, setTargetUserId] = useState('')
  const [amount, setAmount] = useState(5)
  const [processing, setProcessing] = useState(false)
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    checkAuth()
    if (sessionId) {
      setSuccess(true)
    }
  }, [sessionId])

  async function checkAuth() {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login')
        return
      }
      setUser(user)

      const { data: profile } = await supabase
        .from('profiles')
        .select('is_admin')
        .eq('id', user.id)
        .single()

      if (!profile?.is_admin) {
        router.push('/dashboard')
        return
      }
      
      setIsAdmin(true)
    } catch (error) {
      console.error('Auth error:', error)
      router.push('/login')
    } finally {
      setLoading(false)
    }
  }

  async function createCheckout() {
    if (!targetUserId || amount <= 0) {
      alert('Please enter a valid user ID and amount')
      return
    }

    setProcessing(true)
    try {
      const resp = await fetch('/api/stripe/create-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          target_user_id: targetUserId, 
          amount_usd: amount 
        })
      })
      
      const data = await resp.json()
      
      if (!resp.ok) {
        throw new Error(data.error || 'Failed to create checkout')
      }

      if (data.url) {
        window.location.href = data.url
      } else {
        throw new Error('No checkout URL received')
      }
    } catch (error: any) {
      console.error('Checkout error:', error)
      alert('Error: ' + error.message)
      setProcessing(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-brand-gradient launch-pad">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-orange mx-auto mb-4"></div>
          <p className="text-white">Loading...</p>
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

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-2xl mx-auto">
        <div className="mb-6">
          <Link href="/dashboard" className="text-brand-purple hover:text-brand-cyan transition-colors">
            ← Back to Dashboard
          </Link>
        </div>

        {success && (
          <div className="bg-green-50 border-2 border-green-500 rounded-xl p-4 mb-6">
            <div className="flex items-center gap-2">
              <span className="text-2xl">✅</span>
              <div>
                <h3 className="font-bold text-green-800">Payment Successful!</h3>
                <p className="text-green-700">Credits have been added to the user's account.</p>
              </div>
            </div>
          </div>
        )}

        <div className="bg-white rounded-2xl shadow-lg p-8 border-2 border-brand-purple/20">
          <div className="flex items-center gap-3 mb-6">
            <span className="text-4xl">💳</span>
            <div>
              <h1 className="text-3xl font-bold text-brand-navy">Admin Credit Top-up</h1>
              <p className="text-brand-purple">Add credits to user accounts via Stripe</p>
            </div>
          </div>

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-semibold mb-2 text-brand-purple">
                User ID to Top-up
              </label>
              <input
                type="text"
                value={targetUserId}
                onChange={(e) => setTargetUserId(e.target.value)}
                placeholder="Enter user UUID"
                className="w-full px-4 py-3 border-2 border-brand-purple/30 rounded-lg focus:border-brand-cyan focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2 text-brand-purple">
                Amount (USD)
              </label>
              <input
                type="number"
                min="1"
                step="1"
                value={amount}
                onChange={(e) => setAmount(Number(e.target.value))}
                className="w-full px-4 py-3 border-2 border-brand-purple/30 rounded-lg focus:border-brand-cyan focus:outline-none"
              />
              <p className="text-sm text-brand-purple mt-2">
                Credits to add: <strong className="text-brand-orange">{amount * 10}</strong> ({amount} USD × 10 credits per dollar)
              </p>
            </div>

            <button
              disabled={processing || !targetUserId || amount <= 0}
              onClick={createCheckout}
              className="w-full btn-launch py-4 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {processing ? 'Creating Checkout...' : 'Create Stripe Checkout 🚀'}
            </button>
          </div>

          <div className="mt-6 p-4 bg-brand-cyan/10 border border-brand-cyan/30 rounded-lg">
            <p className="text-sm text-brand-navy">
              <strong>Note:</strong> This will create a Stripe Checkout session. After successful payment, 
              credits will automatically be added to the user's account via webhook.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
