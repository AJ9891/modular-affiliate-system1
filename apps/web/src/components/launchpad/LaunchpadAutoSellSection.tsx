"use client"

import React, { useState } from 'react'

interface AutoSellState {
  funnelId?: string
  funnelSlug?: string
  message?: string
  success?: boolean
}

export default function LaunchpadAutoSellSection() {
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [state, setState] = useState<AutoSellState>({})

  async function handleAutoSell() {
    setBusy(true)
    setMessage(null)
    setState({})

    try {
      // Generate basic funnel blocks for Launchpad
      const blocks = [
        {
          id: 'hero-1',
          type: 'hero',
          content: {
            headline: 'Build Funnels That Convert',
            subheadline: 'AI-powered funnel builder with email automation and real-time analytics',
            cta: 'Start Free',
          },
          style: {
            backgroundColor: '#050913',
            textColor: '#ffffff',
          },
        },
        {
          id: 'features-1',
          type: 'features',
          content: {
            title: 'Everything You Need',
            items: [
              { title: 'Visual Builder', description: 'Drag-and-drop funnel creator' },
              { title: 'Email Autopilot', description: 'Automated email sequences' },
              { title: 'Real-time Analytics', description: 'Track every conversion' },
            ],
          },
        },
        {
          id: 'cta-1',
          type: 'cta',
          content: {
            text: 'Ready to launch?',
            button: 'Get Started Free',
          },
        },
      ]

      // 1) create a draft funnel with content
      const funnelRes = await fetch('/api/funnels', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: 'Launchpad Auto-Sell Funnel',
          template: 'launchpad-auto',
          blocks,
        }),
      })

      if (!funnelRes.ok) throw new Error('Failed to create funnel')
      const funnelJson = await funnelRes.json()
      const funnel = funnelJson.funnel || funnelJson
      const funnelId = funnel?.funnel_id
      const funnelSlug = funnel?.slug

      // 2) create an offer that points to the funnel
      const origin = typeof window !== 'undefined' ? window.location.origin : ''
      const affiliateLink = funnelSlug ? `${origin}/f/${funnelSlug}` : origin || '/'

      const offerRes = await fetch('/api/offers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: 'Launchpad Referral - AutoSell',
          description: 'Auto-generated offer to promote Launchpad (funnel draft ready to publish)',
          affiliate_link: affiliateLink,
          commission_rate: 20,
          commission_type: 'percent',
        }),
      })

      if (!offerRes.ok) throw new Error('Failed to create offer')

      // 3) save as template
      try {
        await fetch('/api/funnels/templates', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: 'Launchpad Auto-Sell Template',
            type: 'funnel',
            content: {
              funnelId,
              funnel,
              offerName: 'Launchpad Referral - AutoSell',
              affiliateLink,
            },
          }),
        })
      } catch (err) {
        console.warn('Template save failed', err)
      }

      setState({
        funnelId,
        funnelSlug,
        success: true,
      })

      setMessage(
        'Draft funnel with content created. Ready to publish when you are.'
      )
    } catch (err: any) {
      setMessage(err?.message || 'Auto-sell failed')
      setState({ success: false })
    } finally {
      setBusy(false)
    }
  }

  async function handlePublish() {
    if (!state.funnelId) return

    setBusy(true)
    try {
      const publishRes = await fetch(`/api/funnels/${state.funnelId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: 'published',
          active: true,
        }),
      })

      if (!publishRes.ok) throw new Error('Failed to publish funnel')

      setMessage(`✓ Funnel published! View it at /f/${state.funnelSlug}`)
    } catch (err: any) {
      setMessage(err?.message || 'Publish failed')
    } finally {
      setBusy(false)
    }
  }

  function handleEditFunnel() {
    if (state.funnelId) {
      window.location.href = `/funnels/${state.funnelId}`
    }
  }

  return (
    <div className="mb-8 rounded-2xl border border-[var(--border-elevated)] bg-[rgba(8,14,24,0.62)] p-6 text-left">
      <h3 className="mb-2 text-xl font-semibold">Auto-sell Launchpad</h3>
      <p className="mb-4 text-sm text-text-secondary">
        Auto-generate a Launchpad promotion funnel with content, create an offer, and save as a template.
      </p>

      {!state.success ? (
        <div className="flex items-center gap-3">
          <button
            disabled={busy}
            onClick={handleAutoSell}
            className="rounded-md bg-rocket-500 px-4 py-2 font-semibold text-[#041118] disabled:opacity-60"
          >
            {busy ? 'Creating…' : 'Auto-generate Funnel'}
          </button>
          <button
            onClick={() => setMessage(null)}
            className="rounded-md border border-[var(--border-elevated)] px-3 py-2 text-sm"
          >
            Clear
          </button>
        </div>
      ) : (
        <div className="flex flex-wrap items-center gap-2">
          <button
            disabled={busy}
            onClick={handlePublish}
            className="rounded-md bg-green-600 px-4 py-2 font-semibold text-white disabled:opacity-60"
          >
            {busy ? 'Publishing…' : 'Publish Now'}
          </button>
          <button
            onClick={handleEditFunnel}
            className="rounded-md border border-[var(--border-elevated)] px-4 py-2 text-sm"
          >
            Edit Funnel
          </button>
          <button
            onClick={() => {
              setState({})
              setMessage(null)
            }}
            className="rounded-md border border-[var(--border-elevated)] px-3 py-2 text-sm"
          >
            Reset
          </button>
        </div>
      )}

      {message ? <p className="mt-4 text-sm text-text-secondary">{message}</p> : null}
    </div>
  )
}
