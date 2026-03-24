'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import {
  getCurrentUser,
  getPlanSettings,
  getStripeConnectStatus,
  updatePlan,
  type StripeConnectStatus,
  type UserPlan,
} from '@/lib/api/settings'
import SettingsSkeleton from './SettingsSkeleton'

const planOptions: UserPlan[] = ['free', 'starter', 'pro', 'agency']

export default function SettingsWorkspace() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  const [userEmail, setUserEmail] = useState('')
  const [plan, setPlan] = useState<UserPlan>('free')
  const [stripeStatus, setStripeStatus] = useState<StripeConnectStatus | null>(null)

  useEffect(() => {
    let active = true

    async function load() {
      try {
        setLoading(true)
        setError(null)

        const [user, planData, stripe] = await Promise.all([
          getCurrentUser(),
          getPlanSettings().catch((): { plan: UserPlan } => ({ plan: 'free' })),
          getStripeConnectStatus().catch(() => null),
        ])

        if (active) {
          setUserEmail(user.email || '')
          setPlan((planData.plan as UserPlan | undefined) || 'free')
          setStripeStatus(stripe)
        }
      } catch (err) {
        if (active) {
          setError(err instanceof Error ? err.message : 'Failed to load settings')
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

  async function handlePlanSave() {
    if (!plan || !planOptions.includes(plan)) return

    try {
      setSaving(true)
      setError(null)
      await updatePlan(plan)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update plan')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return <SettingsSkeleton />
  }

  return (
    <main className="cockpit-shell page-command-authority py-8">
      <div className="cockpit-container max-w-5xl space-y-6">
        <section className="hud-panel">
          <p className="text-xs uppercase tracking-system text-text-secondary">Settings</p>
          <h1 className="text-3xl font-semibold text-text-primary md:text-4xl">Account, API, and Billing Settings</h1>
          <p className="mt-2 text-sm text-text-secondary">Manage account profile, API usage posture, and billing controls.</p>
        </section>

        {error && <section className="rounded-lg border border-red-400/35 bg-red-500/12 p-4 text-red-200">{error}</section>}

        <section className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <article className="hud-card space-y-3">
            <h2 className="text-xl font-semibold text-text-primary">Account</h2>
            <p className="text-sm text-text-secondary">Email: {userEmail || 'Unknown'}</p>
            <label className="text-xs uppercase tracking-system text-text-secondary">Plan</label>
            <select value={plan} onChange={(event) => setPlan(event.target.value as UserPlan)} className="hud-select">
              {planOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
            <button type="button" onClick={handlePlanSave} disabled={saving} className="hud-button-primary px-4 py-2">
              {saving ? 'Saving...' : 'Save Plan'}
            </button>
          </article>

          <article className="hud-card space-y-3">
            <h2 className="text-xl font-semibold text-text-primary">Billing and Stripe</h2>
            <p className="text-sm text-text-secondary">
              Connect status: {stripeStatus?.connected ? 'Connected' : 'Not connected'}
            </p>
            <p className="text-sm text-text-secondary">
              Charges: {stripeStatus?.chargesEnabled ? 'Enabled' : 'Disabled'} · Payouts:{' '}
              {stripeStatus?.payoutsEnabled ? 'Enabled' : 'Disabled'}
            </p>
            <Link href="/subscription" className="hud-button-secondary inline-block px-4 py-2">
              Open Billing Center
            </Link>
          </article>
        </section>

        <section className="hud-card">
          <h2 className="mb-3 text-xl font-semibold text-text-primary">API Keys</h2>
          <div className="space-y-3 text-sm text-text-secondary">
            <p>Store and rotate provider keys from your deployment environment.</p>
            <div className="rounded-lg border border-[var(--border-subtle)] bg-[rgba(10,16,24,0.55)] p-3">
              <p>OpenAI: configured via `OPENAI_API_KEY`</p>
              <p>Stripe: configured via `STRIPE_SECRET_KEY`</p>
              <p>Sendshark: configured via `SENDSHARK_API_KEY`</p>
            </div>
          </div>
        </section>
      </div>
    </main>
  )
}
