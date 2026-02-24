'use client'

import React, { useState, useEffect, Suspense } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'

function TopUpContent() {
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
      <div className="cockpit-shell page-command-authority flex items-center justify-center">
        <div className="text-center">
          <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-b-2 border-anchor-400"></div>
          <p className="text-text-secondary">Loading command authority...</p>
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

  return (
    <div className="cockpit-shell page-command-authority py-8">
      <div className="cockpit-container max-w-2xl">
        <div className="mb-6">
          <Link href="/dashboard" className="text-text-secondary transition hover:text-text-primary">
            ← Back to Dashboard
          </Link>
        </div>

        {success && (
          <div className="mb-6 rounded-xl border border-emerald-400/35 bg-emerald-500/12 p-4">
            <div className="flex items-center gap-2">
              <span className="text-2xl">✅</span>
              <div>
                <h3 className="font-semibold text-emerald-200">Payment Successful!</h3>
                <p className="text-emerald-300">Credits have been added to the user's account.</p>
              </div>
            </div>
          </div>
        )}

        <div className="hud-card border-[rgba(174,183,194,0.22)]">
          <div className="flex items-center gap-3 mb-6">
            <span className="text-4xl">💳</span>
            <div>
              <h1 className="text-3xl font-semibold text-text-primary">Fuel Credit Top-up</h1>
              <p className="text-text-secondary">Add credits to user accounts via Stripe</p>
            </div>
          </div>

          <div className="space-y-6">
            <div>
              <label className="mb-2 block text-sm font-semibold text-text-secondary">
                User ID to Top-up
              </label>
              <input
                type="text"
                value={targetUserId}
                onChange={(e) => setTargetUserId(e.target.value)}
                placeholder="Enter user UUID"
                className="hud-input"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-text-secondary">
                Amount (USD)
              </label>
              <input
                type="number"
                min="1"
                step="1"
                value={amount}
                onChange={(e) => setAmount(Number(e.target.value))}
                className="hud-input"
              />
              <p className="mt-2 text-sm text-text-secondary">
                Credits to add: <strong className="text-rocket-500">{amount * 10}</strong> ({amount} USD × 10 credits per dollar)
              </p>
            </div>

            <button
              disabled={processing || !targetUserId || amount <= 0}
              onClick={createCheckout}
              className="hud-button-primary w-full py-4 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {processing ? 'Creating Checkout...' : 'Create Stripe Checkout 🚀'}
            </button>
          </div>

          <div className="mt-6 rounded-lg border border-[var(--border-subtle)] bg-[rgba(10,16,24,0.55)] p-4">
            <p className="text-sm text-text-secondary">
              <strong>Note:</strong> This will create a Stripe Checkout session. After successful payment, 
              credits will automatically be added to the user's account via webhook.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function TopUpAdminPage() {
  return (
    <Suspense fallback={<div className="cockpit-shell page-command-authority flex items-center justify-center">
      <div className="text-center">
        <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-b-2 border-anchor-400"></div>
        <p className="text-text-secondary">Loading...</p>
      </div>
    </div>}>
      <TopUpContent />
    </Suspense>
  )
}
