'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { UserCog, CreditCard, ShieldCheck } from 'lucide-react'
import {
  getCurrentUser,
  getPlanSettings,
  getStripeConnectStatus,
  updatePlan,
  type StripeConnectStatus,
  type UserPlan,
} from '@/lib/api/settings'
import DashboardPanel from '@/components/cockpit/DashboardPanel'
import WorkspacePanel from '@/components/cockpit/WorkspacePanel'
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
      <div className="cockpit-container max-w-7xl space-y-6">
        <section className="hud-panel">
          <p className="text-xs uppercase tracking-system text-text-secondary">Settings</p>
          <h1 className="text-3xl font-semibold text-text-primary md:text-4xl">Account and Billing Command</h1>
          <p className="mt-2 text-sm text-text-secondary">Manage profile state, plan level, billing integration, and provider key posture.</p>
        </section>

        {error && <section className="rounded-lg border border-red-400/35 bg-red-500/12 p-4 text-red-200">{error}</section>}

        <section className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <DashboardPanel title="User" icon={<UserCog size={16} />} value={userEmail || 'Unknown'} tone="info">
            <p className="text-xs text-text-secondary">Current authenticated profile email.</p>
          </DashboardPanel>
          <DashboardPanel title="Plan Tier" icon={<CreditCard size={16} />} value={plan.toUpperCase()} tone="warning">
            <p className="text-xs text-text-secondary">Active subscription entitlement.</p>
          </DashboardPanel>
          <DashboardPanel
            title="Stripe Status"
            icon={<ShieldCheck size={16} />}
            value={stripeStatus?.connected ? 'Connected' : 'Disconnected'}
            tone={stripeStatus?.connected ? 'success' : 'neutral'}
          >
            <p className="text-xs text-text-secondary">Payments and payout availability signal.</p>
          </DashboardPanel>
        </section>

        <section className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <WorkspacePanel
            title="Account Configuration"
            description="Update plan and account controls."
            actions={
              <button type="button" onClick={handlePlanSave} disabled={saving} className="hud-button-primary px-3 py-1.5 text-xs">
                {saving ? 'Saving...' : 'Save Plan'}
              </button>
            }
            expandable
          >
            <div className="space-y-3">
              <p className="text-sm text-text-secondary">Email: {userEmail || 'Unknown'}</p>
              <label className="text-xs uppercase tracking-system text-text-secondary">Plan</label>
              <select value={plan} onChange={(event) => setPlan(event.target.value as UserPlan)} className="hud-select">
                {planOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>
          </WorkspacePanel>

          <WorkspacePanel title="Billing and Stripe" description="Inspect billing connection status and payout readiness." expandable>
            <div className="space-y-3 text-sm">
              <p className="text-text-secondary">Connect status: {stripeStatus?.connected ? 'Connected' : 'Not connected'}</p>
              <p className="text-text-secondary">
                Charges: {stripeStatus?.chargesEnabled ? 'Enabled' : 'Disabled'} · Payouts: {stripeStatus?.payoutsEnabled ? 'Enabled' : 'Disabled'}
              </p>
              <Link href="/subscription" className="hud-button-secondary inline-block px-4 py-2">
                Open Billing Center
              </Link>
            </div>
          </WorkspacePanel>
        </section>

        <WorkspacePanel title="API Key Posture" description="Provider key references currently expected from environment configuration." expandable>
          <div className="space-y-3 text-sm text-text-secondary">
            <p>Store and rotate provider keys from your deployment environment.</p>
            <div className="rounded-lg border border-[var(--border-subtle)] bg-[rgba(10,16,24,0.55)] p-3">
              <p>OpenAI: configured via `OPENAI_API_KEY`</p>
              <p>Stripe: configured via `STRIPE_SECRET_KEY`</p>
              <p>Email provider: `EMAIL_PROVIDER` (`ses` or `sendshark`)</p>
              <p>SES: `AWS_REGION`, `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`</p>
              <p>Sendshark fallback: `SENDSHARK_API_KEY`</p>
            </div>
          </div>
        </WorkspacePanel>
      </div>
    </main>
  )
}
