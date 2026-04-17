'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { ClipboardCopy, RefreshCcw, CheckCircle2, ExternalLink } from 'lucide-react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import type { GeneratedFunnelAssets } from '@/lib/ai/tasks/generateFunnelFromOffer'

interface SignalsView {
  productName: string
  niche: string
  audience: string
  offerSummary: string
  keyBenefits: string[]
}

interface FunnelView {
  funnel_id: string
  slug: string
  name: string
}

interface GeneratedAssetsTabsProps {
  assets: GeneratedFunnelAssets
  signals: SignalsView
  sourceUrl: string
  warnings?: string[]
  funnel: FunnelView | null
  onRegenerate: () => Promise<void>
  regenerating: boolean
}

export default function GeneratedAssetsTabs({
  assets,
  signals,
  sourceUrl,
  warnings = [],
  funnel,
  onRegenerate,
  regenerating,
}: GeneratedAssetsTabsProps) {
  const [lastCopied, setLastCopied] = useState<string | null>(null)
  const [copyError, setCopyError] = useState<string | null>(null)

  const formattedLanding = useMemo(() => {
    const lines = [
      `Headline: ${assets.landing.headline}`,
      `Subheadline: ${assets.landing.subheadline}`,
      `CTA: ${assets.landing.cta}`,
      '',
      'Benefits:',
      ...assets.landing.benefits.map((benefit, index) => `${index + 1}. ${benefit.title} - ${benefit.description}`),
    ]

    return lines.join('\n')
  }, [assets.landing])

  const formattedEmails = useMemo(() => {
    return assets.emails
      .map((email, index) => {
        return [
          `Email ${index + 1}`,
          `Subject: ${email.subject}`,
          `Preview: ${email.preview}`,
          `Body: ${email.body}`,
          `CTA: ${email.cta}`,
        ].join('\n')
      })
      .join('\n\n---\n\n')
  }, [assets.emails])

  const handleCopy = async (id: string, value: string) => {
    try {
      await navigator.clipboard.writeText(value)
      setLastCopied(id)
      setCopyError(null)
      window.setTimeout(() => setLastCopied((current) => (current === id ? null : current)), 2200)
    } catch {
      setCopyError('Clipboard access is unavailable in this browser context.')
    }
  }

  return (
    <div className="space-y-4">
      {warnings.length > 0 && (
        <div className="rounded-lg border border-amber-400/40 bg-amber-500/10 px-3 py-2 text-xs text-amber-100">
          {warnings.join(' ')}
        </div>
      )}
      {copyError && (
        <div className="rounded-lg border border-red-400/40 bg-red-500/10 px-3 py-2 text-xs text-red-200">
          {copyError}
        </div>
      )}

      <div className="flex flex-wrap items-center gap-2 rounded-lg border border-[var(--border-subtle)] bg-[rgba(10,16,24,0.55)] p-3">
        <span className="text-xs uppercase tracking-system text-text-secondary">Source</span>
        <a href={sourceUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-sm text-rocket-400 hover:text-rocket-300">
          {sourceUrl}
          <ExternalLink className="size-3" />
        </a>
        <button type="button" onClick={onRegenerate} disabled={regenerating} className="hud-button-secondary ml-auto inline-flex items-center gap-2 px-3 py-1.5 text-xs">
          <RefreshCcw className={`size-3 ${regenerating ? 'animate-spin' : ''}`} />
          {regenerating ? 'Regenerating...' : 'Regenerate'}
        </button>
      </div>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-lg border border-[var(--border-subtle)] bg-[rgba(10,16,24,0.45)] p-3">
          <p className="text-xs uppercase tracking-system text-text-secondary">Product</p>
          <p className="mt-1 text-sm text-text-primary">{signals.productName}</p>
        </div>
        <div className="rounded-lg border border-[var(--border-subtle)] bg-[rgba(10,16,24,0.45)] p-3">
          <p className="text-xs uppercase tracking-system text-text-secondary">Niche</p>
          <p className="mt-1 text-sm text-text-primary">{signals.niche}</p>
        </div>
        <div className="rounded-lg border border-[var(--border-subtle)] bg-[rgba(10,16,24,0.45)] p-3">
          <p className="text-xs uppercase tracking-system text-text-secondary">Audience</p>
          <p className="mt-1 text-sm text-text-primary">{signals.audience}</p>
        </div>
        <div className="rounded-lg border border-[var(--border-subtle)] bg-[rgba(10,16,24,0.45)] p-3">
          <p className="text-xs uppercase tracking-system text-text-secondary">Funnel</p>
          {funnel ? (
            <Link href={`/funnels/${funnel.funnel_id}`} className="mt-1 inline-flex text-sm text-rocket-400 hover:text-rocket-300">
              Open Editor
            </Link>
          ) : (
            <p className="mt-1 text-sm text-text-secondary">Not saved</p>
          )}
        </div>
      </div>

      <Tabs defaultValue="landing" className="w-full">
        <TabsList className="grid w-full grid-cols-3 bg-[rgba(8,14,21,0.7)]">
          <TabsTrigger value="landing">Landing</TabsTrigger>
          <TabsTrigger value="emails">Email Sequence</TabsTrigger>
          <TabsTrigger value="signals">Offer Signals</TabsTrigger>
        </TabsList>

        <TabsContent value="landing" className="rounded-lg border border-[var(--border-subtle)] bg-[rgba(10,16,24,0.55)] p-4">
          <div className="mb-3 flex justify-end">
            <button type="button" onClick={() => handleCopy('landing', formattedLanding)} className="hud-button-secondary inline-flex items-center gap-2 px-3 py-1.5 text-xs">
              {lastCopied === 'landing' ? <CheckCircle2 className="size-3" /> : <ClipboardCopy className="size-3" />}
              {lastCopied === 'landing' ? 'Copied' : 'Copy Landing'}
            </button>
          </div>

          <h3 className="text-xl font-semibold text-text-primary">{assets.landing.headline}</h3>
          <p className="mt-2 text-sm text-text-secondary">{assets.landing.subheadline}</p>

          <div className="mt-4 space-y-3">
            {assets.landing.benefits.map((benefit, index) => (
              <div key={`${benefit.title}-${index}`} className="rounded-md border border-[var(--border-subtle)] bg-[rgba(6,10,16,0.45)] p-3">
                <p className="text-sm font-semibold text-text-primary">{benefit.title}</p>
                <p className="mt-1 text-sm text-text-secondary">{benefit.description}</p>
              </div>
            ))}
          </div>

          <div className="mt-4 rounded-md border border-rocket-500/35 bg-[rgba(46,230,194,0.08)] p-3 text-sm text-rocket-200">
            CTA: <span className="font-semibold">{assets.landing.cta}</span>
          </div>
        </TabsContent>

        <TabsContent value="emails" className="rounded-lg border border-[var(--border-subtle)] bg-[rgba(10,16,24,0.55)] p-4">
          <div className="mb-3 flex justify-end">
            <button type="button" onClick={() => handleCopy('emails', formattedEmails)} className="hud-button-secondary inline-flex items-center gap-2 px-3 py-1.5 text-xs">
              {lastCopied === 'emails' ? <CheckCircle2 className="size-3" /> : <ClipboardCopy className="size-3" />}
              {lastCopied === 'emails' ? 'Copied' : 'Copy Emails'}
            </button>
          </div>

          <div className="space-y-3">
            {assets.emails.map((email, index) => (
              <article key={`${email.subject}-${index}`} className="rounded-md border border-[var(--border-subtle)] bg-[rgba(6,10,16,0.45)] p-3">
                <p className="text-xs uppercase tracking-system text-text-secondary">Email {index + 1}</p>
                <p className="mt-1 text-base font-semibold text-text-primary">{email.subject}</p>
                <p className="mt-1 text-sm text-text-secondary">{email.preview}</p>
                <p className="mt-3 whitespace-pre-wrap text-sm text-text-primary">{email.body}</p>
                <p className="mt-2 text-sm text-rocket-300">CTA: {email.cta}</p>
              </article>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="signals" className="rounded-lg border border-[var(--border-subtle)] bg-[rgba(10,16,24,0.55)] p-4">
          <p className="text-sm text-text-secondary">{signals.offerSummary}</p>
          <ul className="mt-4 space-y-2">
            {signals.keyBenefits.map((benefit, index) => (
              <li key={`${benefit}-${index}`} className="rounded-md border border-[var(--border-subtle)] bg-[rgba(6,10,16,0.45)] px-3 py-2 text-sm text-text-primary">
                {benefit}
              </li>
            ))}
          </ul>
        </TabsContent>
      </Tabs>
    </div>
  )
}
