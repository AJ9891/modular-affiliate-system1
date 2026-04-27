'use client'

import { useEffect, useMemo, useState } from 'react'
import { buildTrackingLink, getAffiliateOverview, type AffiliateOverview } from '@/lib/api/affiliates'
import { CockpitEmptyState } from '@/components/ui/CockpitEmptyState'
import AffiliatesSkeleton from './AffiliatesSkeleton'

function currency(value: number) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 2,
  }).format(value)
}

export default function AffiliatesWorkspace() {
  const [data, setData] = useState<AffiliateOverview | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [copied, setCopied] = useState<string | null>(null)

  useEffect(() => {
    let active = true

    async function load() {
      try {
        setLoading(true)
        setError(null)
        const next = await getAffiliateOverview('30d')
        if (active) {
          setData(next)
        }
      } catch (err) {
        if (active) {
          setError(err instanceof Error ? err.message : 'Failed to load affiliates')
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

  const performanceMap = useMemo(() => {
    const map = new Map<string, number>()
    for (const row of data?.performanceByOffer || []) {
      map.set(row.offerKey, row.clicks)
    }
    return map
  }, [data?.performanceByOffer])

  async function copyToClipboard(id: string, value: string) {
    await navigator.clipboard.writeText(value)
    setCopied(id)
    setTimeout(() => setCopied(null), 1400)
  }

  if (loading) {
    return <AffiliatesSkeleton />
  }

  return (
    <main className="cockpit-shell page-fuel-management py-8">
      <div className="cockpit-container max-w-6xl space-y-6">
        <section className="hud-panel">
          <p className="text-xs uppercase tracking-system text-text-secondary">Affiliates</p>
          <h1 className="text-3xl font-semibold text-text-primary md:text-4xl">Referral and Commission Tracking</h1>
          <p className="mt-2 text-sm text-text-secondary">Track referral links, estimated commissions, and affiliate analytics.</p>
        </section>

        {error && <section className="rounded-lg border border-red-400/35 bg-red-500/12 p-4 text-red-200">{error}</section>}

        <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <article className="hud-card">
            <p className="text-xs uppercase tracking-system text-text-secondary">Offers</p>
            <p className="mt-3 text-3xl font-semibold text-text-primary">{data?.offers.length || 0}</p>
          </article>
          <article className="hud-card">
            <p className="text-xs uppercase tracking-system text-text-secondary">Revenue</p>
            <p className="mt-3 text-3xl font-semibold text-text-primary">{currency(data?.totalRevenue || 0)}</p>
          </article>
          <article className="hud-card">
            <p className="text-xs uppercase tracking-system text-text-secondary">Est. Commissions</p>
            <p className="mt-3 text-3xl font-semibold text-text-primary">{currency(data?.estimatedCommissions || 0)}</p>
          </article>
          <article className="hud-card">
            <p className="text-xs uppercase tracking-system text-text-secondary">Conversion Rate</p>
            <p className="mt-3 text-3xl font-semibold text-text-primary">{(data?.conversionRate || 0).toFixed(2)}%</p>
          </article>
        </section>

        <section className="hud-card overflow-x-auto">
          <h2 className="mb-4 text-xl font-semibold text-text-primary">Referral Links</h2>
          {data?.offers.length ? (
            <table className="min-w-full text-sm">
              <thead>
                <tr className="border-b border-[var(--border-subtle)] text-left text-text-secondary">
                  <th className="px-3 py-2">Offer</th>
                  <th className="px-3 py-2">Commission</th>
                  <th className="px-3 py-2">Clicks</th>
                  <th className="px-3 py-2">Tracking Link</th>
                  <th className="px-3 py-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {data.offers.map((offer) => {
                  const clicks = performanceMap.get(offer.id) || performanceMap.get(offer.name) || 0
                  const trackingLink = buildTrackingLink(offer.id)

                  return (
                    <tr key={offer.id} className="border-b border-[var(--border-subtle)] text-text-primary">
                      <td className="px-3 py-3">
                        <p className="font-medium">{offer.name}</p>
                        <p className="text-xs text-text-secondary">{offer.description || 'No description'}</p>
                      </td>
                      <td className="px-3 py-3">{offer.commission_rate}%</td>
                      <td className="px-3 py-3">{clicks.toLocaleString()}</td>
                      <td className="px-3 py-3 text-xs text-text-secondary">{trackingLink}</td>
                      <td className="px-3 py-3">
                        <div className="flex gap-2">
                          <button
                            type="button"
                            className="hud-button-secondary px-3 py-1 text-xs"
                            onClick={() => copyToClipboard(`track-${offer.id}`, trackingLink)}
                          >
                            {copied === `track-${offer.id}` ? 'Copied' : 'Copy Tracking'}
                          </button>
                          <button
                            type="button"
                            className="hud-button-secondary px-3 py-1 text-xs"
                            onClick={() => copyToClipboard(`direct-${offer.id}`, offer.affiliate_link)}
                          >
                            {copied === `direct-${offer.id}` ? 'Copied' : 'Copy Direct'}
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          ) : (
            <CockpitEmptyState
              compact
              title="No offers available yet"
              description="Add affiliate offers to generate tracking links and commission reporting."
              tone="warning"
              tips={[
                'Add at least one offer with commission rate.',
                'Use tracked links instead of direct destination URLs.',
              ]}
              primaryAction={{ label: 'Manage Offers', href: '/offers' }}
              secondaryAction={{ label: 'Open Launchpad', href: '/launchpad' }}
            />
          )}
        </section>
      </div>
    </main>
  )
}
