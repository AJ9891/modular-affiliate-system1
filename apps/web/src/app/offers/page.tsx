'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { X } from 'lucide-react'
import { buildAffiliateLink } from '@/lib/tracking'

type CommissionType = 'percent' | 'flat'

interface Offer {
  id: string
  name: string
  description?: string
  affiliate_link: string
  commission_rate?: number
  commission_type?: CommissionType
  commission_value?: number
  commission_currency?: string
  niche_id?: string | null
  niche_label?: string | null
  is_active?: boolean
  active?: boolean
}

type ApiPayload = {
  error?: string
  message?: string
  details?: string
  hint?: string
  code?: string
  offer?: Offer
  offers?: Offer[]
}

interface NewOfferForm {
  name: string
  description: string
  niche_label: string
  affiliate_link: string
  commission_type: CommissionType
  commission_value: number
  commission_currency: string
}

const DEFAULT_NEW_OFFER: NewOfferForm = {
  name: '',
  description: '',
  niche_label: '',
  affiliate_link: '',
  commission_type: 'percent',
  commission_value: 0,
  commission_currency: 'USD',
}

async function readResponsePayload(response: Response): Promise<ApiPayload | string | null> {
  const raw = await response.text().catch(() => '')
  if (!raw) return null

  try {
    return JSON.parse(raw) as ApiPayload
  } catch {
    return raw
  }
}

function getApiErrorMessage(response: Response, payload: ApiPayload | string | null): string {
  if (typeof payload === 'string' && payload.trim().length > 0) {
    return payload
  }

  if (payload && typeof payload === 'object') {
    if (typeof payload.error === 'string' && payload.error.trim().length > 0) {
      return payload.error
    }
    if (typeof payload.message === 'string' && payload.message.trim().length > 0) {
      return payload.message
    }
  }

  return `Request failed (${response.status}${response.statusText ? ` ${response.statusText}` : ''})`
}

function isOfferActive(offer: Offer): boolean {
  if (typeof offer.is_active === 'boolean') return offer.is_active
  if (typeof offer.active === 'boolean') return offer.active
  return true
}

function formatCommission(offer: Offer): string {
  const type: CommissionType = offer.commission_type === 'flat' ? 'flat' : 'percent'
  const value = Number.isFinite(Number(offer.commission_value))
    ? Number(offer.commission_value)
    : Number(offer.commission_rate || 0)

  if (type === 'flat') {
    const currency = (offer.commission_currency || 'USD').toUpperCase()
    return `${currency} ${value.toFixed(2)}`
  }

  return `${value.toFixed(2)}%`
}

export default function OffersPage() {
  const router = useRouter()
  const [offers, setOffers] = useState<Offer[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddForm, setShowAddForm] = useState(false)
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [copiedType, setCopiedType] = useState<'tracking' | 'affiliate' | null>(null)
  const [newOffer, setNewOffer] = useState<NewOfferForm>(DEFAULT_NEW_OFFER)

  useEffect(() => {
    checkAuth()
    loadOffers()
  }, [])

  useEffect(() => {
    if (typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('new') === '1') {
      setShowAddForm(true)
    }
  }, [])

  const sortedOffers = useMemo(
    () => [...offers].sort((a, b) => Number(isOfferActive(b)) - Number(isOfferActive(a))),
    [offers]
  )

  async function checkAuth() {
    const res = await fetch('/api/auth/me')
    if (!res.ok) {
      router.push('/login')
    }
  }

  async function loadOffers() {
    try {
      setLoading(true)
      const res = await fetch('/api/offers', { cache: 'no-store' })
      if (res.ok) {
        const payload = await readResponsePayload(res)
        const data = payload && typeof payload === 'object' ? payload : null
        setOffers(Array.isArray(data?.offers) ? data.offers : [])
      }
    } catch (error) {
      console.error('Failed to load offers:', error)
    } finally {
      setLoading(false)
    }
  }

  async function handleAddOffer(e: React.FormEvent) {
    e.preventDefault()

    try {
      const commissionRate = newOffer.commission_type === 'percent' ? newOffer.commission_value : 0
      const res = await fetch('/api/offers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newOffer.name,
          description: newOffer.description,
          niche_label: newOffer.niche_label || null,
          affiliate_link: newOffer.affiliate_link,
          commission_type: newOffer.commission_type,
          commission_value: newOffer.commission_value,
          commission_currency: newOffer.commission_currency.toUpperCase(),
          commission_rate: commissionRate,
          niche_id: null,
        }),
      })
      const payload = await readResponsePayload(res)

      if (res.ok) {
        setShowAddForm(false)
        setNewOffer(DEFAULT_NEW_OFFER)
        await loadOffers()
      } else {
        const message = getApiErrorMessage(res, payload)
        alert(`Failed to add offer: ${message}`)
      }
    } catch (error) {
      console.error('Error adding offer:', error)
      alert(`Error adding offer: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  async function handleToggleActive(offerId: string, currentStatus: boolean) {
    try {
      const next = !currentStatus
      const res = await fetch(`/api/offers/${offerId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          active: next,
          is_active: next,
        }),
      })

      if (res.ok) {
        await loadOffers()
      }
    } catch (error) {
      console.error('Error toggling offer:', error)
    }
  }

  function copyTrackingLink(offerId: string) {
    const trackingLink = `${window.location.origin}/api/redirect/${offerId}`
    navigator.clipboard.writeText(trackingLink)
    setCopiedId(offerId)
    setCopiedType('tracking')
    setTimeout(() => {
      setCopiedId(null)
      setCopiedType(null)
    }, 1500)
  }

  function copyAffiliateLink(baseUrl: string, offerId: string) {
    try {
      const link = buildAffiliateLink(baseUrl, offerId, {
        source: 'launchpad',
        medium: 'website',
      })
      navigator.clipboard.writeText(link)
      setCopiedId(offerId)
      setCopiedType('affiliate')
      setTimeout(() => {
        setCopiedId(null)
        setCopiedType(null)
      }, 1500)
    } catch (error) {
      console.error('Error building affiliate link:', error)
      navigator.clipboard.writeText(baseUrl)
      setCopiedId(offerId)
      setCopiedType('affiliate')
      setTimeout(() => {
        setCopiedId(null)
        setCopiedType(null)
      }, 1500)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-green-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading offers...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-green-900 py-12 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">Affiliate Offers</h1>
            <p className="text-blue-200">Persistent offer list with niche, commission model, and affiliate links.</p>
          </div>

          <button
            onClick={() => setShowAddForm(true)}
            className="hud-button-primary px-6 py-3 text-sm"
          >
            + Add Offer
          </button>
        </div>

        {sortedOffers.length > 0 ? (
          <div className="overflow-hidden rounded-2xl border border-white/20 bg-white/10 backdrop-blur-lg">
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm text-white">
                <thead className="bg-black/20 text-blue-100">
                  <tr>
                    <th className="px-4 py-3 text-left">Offer</th>
                    <th className="px-4 py-3 text-left">Niche</th>
                    <th className="px-4 py-3 text-left">Commission</th>
                    <th className="px-4 py-3 text-left">Affiliate Link</th>
                    <th className="px-4 py-3 text-left">Tracking Link</th>
                    <th className="px-4 py-3 text-left">Status</th>
                    <th className="px-4 py-3 text-left">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {sortedOffers.map((offer) => {
                    const active = isOfferActive(offer)
                    return (
                      <tr key={offer.id} className="border-t border-white/10 align-top">
                        <td className="px-4 py-4">
                          <p className="font-semibold text-white">{offer.name}</p>
                          <p className="mt-1 text-xs text-blue-100/80">{offer.description || 'No description'}</p>
                        </td>
                        <td className="px-4 py-4 text-blue-50">{offer.niche_label || 'General'}</td>
                        <td className="px-4 py-4 text-yellow-300 font-semibold">{formatCommission(offer)}</td>
                        <td className="px-4 py-4">
                          <div className="max-w-[220px] break-all text-xs text-blue-100/90">{offer.affiliate_link}</div>
                          <button
                            onClick={() => copyAffiliateLink(offer.affiliate_link, offer.id)}
                            className="mt-2 rounded border border-white/20 px-2 py-1 text-xs hover:bg-white/10"
                          >
                            {copiedId === offer.id && copiedType === 'affiliate' ? 'Copied' : 'Copy'}
                          </button>
                        </td>
                        <td className="px-4 py-4">
                          <div className="max-w-[220px] break-all text-xs text-blue-100/90">{`${typeof window !== 'undefined' ? window.location.origin : ''}/api/redirect/${offer.id}`}</div>
                          <button
                            onClick={() => copyTrackingLink(offer.id)}
                            className="mt-2 rounded border border-white/20 px-2 py-1 text-xs hover:bg-white/10"
                          >
                            {copiedId === offer.id && copiedType === 'tracking' ? 'Copied' : 'Copy'}
                          </button>
                        </td>
                        <td className="px-4 py-4">
                          <span className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${active ? 'bg-emerald-500/25 text-emerald-100' : 'bg-slate-500/30 text-slate-100'}`}>
                            {active ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className="px-4 py-4">
                          <button
                            onClick={() => handleToggleActive(offer.id, active)}
                            className="rounded border border-white/25 px-3 py-1 text-xs hover:bg-white/10"
                          >
                            {active ? 'Deactivate' : 'Activate'}
                          </button>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-12 border border-white/20 text-center">
            <div className="text-white text-xl mb-4">No offers yet</div>
            <p className="text-blue-200 mb-6">Add your first offer with niche, commission model, and affiliate link.</p>
            <button
              onClick={() => setShowAddForm(true)}
              className="px-6 py-3 bg-yellow-400 hover:bg-yellow-500 text-gray-900 rounded-lg font-bold transition"
            >
              Add Your First Offer
            </button>
          </div>
        )}

        <div className="mt-8 text-center">
          <button
            onClick={() => router.push('/dashboard')}
            className="px-8 py-3 bg-white/10 hover:bg-white/20 text-white rounded-lg font-semibold transition border border-white/20"
          >
            ← Back to Dashboard
          </button>
        </div>
      </div>

      {showAddForm && (
        <div
          className="fixed inset-0 z-[80] flex items-center justify-center bg-black/65 px-4 backdrop-blur-sm"
          onClick={() => setShowAddForm(false)}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="add-offer-dialog-title"
            className="glass-tile relative w-full max-w-2xl border-white/20 bg-[rgba(8,14,24,0.9)] p-0 shadow-[0_26px_80px_rgba(0,0,0,0.52)]"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="pointer-events-none absolute inset-0 rounded-[14px] bg-[radial-gradient(circle_at_12%_0%,rgba(46,230,194,0.16),transparent_46%),radial-gradient(circle_at_92%_100%,rgba(31,199,167,0.14),transparent_42%)]" />
            <div className="relative space-y-5 p-5 sm:p-6">
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-2">
                  <p className="text-xs uppercase tracking-system text-text-secondary">Offers</p>
                  <h2 id="add-offer-dialog-title" className="text-2xl font-semibold leading-tight text-text-primary">
                    Add New Offer
                  </h2>
                  <p className="text-sm text-text-secondary">Store offer niche, commission model, and affiliate link in one place.</p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-lg border border-white/20 text-text-secondary transition hover:text-text-primary"
                  aria-label="Close add offer dialog"
                >
                  <X size={16} />
                </button>
              </div>

              <form onSubmit={handleAddOffer} className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <label htmlFor="offer-name" className="mb-2 block text-xs uppercase tracking-system text-text-secondary">Offer Name</label>
                    <input
                      id="offer-name"
                      type="text"
                      value={newOffer.name}
                      onChange={(e) => setNewOffer({ ...newOffer, name: e.target.value })}
                      className="w-full rounded-lg border border-white/15 bg-[rgba(6,10,16,0.72)] px-4 py-3 text-sm text-text-primary placeholder:text-text-secondary focus:border-rocket-500/80 focus:outline-none focus:ring-2 focus:ring-rocket-500/30"
                      placeholder="Offer title"
                      required
                    />
                  </div>

                  <div>
                    <label htmlFor="offer-niche-label" className="mb-2 block text-xs uppercase tracking-system text-text-secondary">Niche</label>
                    <input
                      id="offer-niche-label"
                      type="text"
                      value={newOffer.niche_label}
                      onChange={(e) => setNewOffer({ ...newOffer, niche_label: e.target.value })}
                      className="w-full rounded-lg border border-white/15 bg-[rgba(6,10,16,0.72)] px-4 py-3 text-sm text-text-primary placeholder:text-text-secondary focus:border-rocket-500/80 focus:outline-none focus:ring-2 focus:ring-rocket-500/30"
                      placeholder="e.g. SaaS, Health, Finance"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="offer-description" className="mb-2 block text-xs uppercase tracking-system text-text-secondary">Description</label>
                  <textarea
                    id="offer-description"
                    value={newOffer.description}
                    onChange={(e) => setNewOffer({ ...newOffer, description: e.target.value })}
                    className="w-full rounded-lg border border-white/15 bg-[rgba(6,10,16,0.72)] px-4 py-3 text-sm text-text-primary placeholder:text-text-secondary focus:border-rocket-500/80 focus:outline-none focus:ring-2 focus:ring-rocket-500/30"
                    rows={3}
                    placeholder="What does this offer help the customer achieve?"
                  />
                </div>

                <div>
                  <label htmlFor="offer-affiliate-link" className="mb-2 block text-xs uppercase tracking-system text-text-secondary">Affiliate Link</label>
                  <input
                    id="offer-affiliate-link"
                    type="url"
                    value={newOffer.affiliate_link}
                    onChange={(e) => setNewOffer({ ...newOffer, affiliate_link: e.target.value })}
                    className="w-full rounded-lg border border-white/15 bg-[rgba(6,10,16,0.72)] px-4 py-3 text-sm text-text-primary placeholder:text-text-secondary focus:border-rocket-500/80 focus:outline-none focus:ring-2 focus:ring-rocket-500/30"
                    placeholder="https://example.com/offer"
                    required
                  />
                </div>

                <div className="grid gap-4 md:grid-cols-3">
                  <div>
                    <label htmlFor="offer-commission-type" className="mb-2 block text-xs uppercase tracking-system text-text-secondary">Commission Type</label>
                    <select
                      id="offer-commission-type"
                      value={newOffer.commission_type}
                      onChange={(e) => setNewOffer({ ...newOffer, commission_type: e.target.value as CommissionType })}
                      className="w-full rounded-lg border border-white/15 bg-[rgba(6,10,16,0.72)] px-4 py-3 text-sm text-text-primary focus:border-rocket-500/80 focus:outline-none focus:ring-2 focus:ring-rocket-500/30"
                    >
                      <option value="percent">Percent (%)</option>
                      <option value="flat">Flat Amount ($)</option>
                    </select>
                  </div>

                  <div>
                    <label htmlFor="offer-commission-value" className="mb-2 block text-xs uppercase tracking-system text-text-secondary">
                      {newOffer.commission_type === 'flat' ? 'Commission Amount' : 'Commission Rate'}
                    </label>
                    <input
                      id="offer-commission-value"
                      type="number"
                      min="0"
                      step="0.01"
                      value={newOffer.commission_value}
                      onChange={(e) =>
                        setNewOffer({
                          ...newOffer,
                          commission_value: Number.isFinite(e.target.valueAsNumber) ? e.target.valueAsNumber : 0,
                        })
                      }
                      className="w-full rounded-lg border border-white/15 bg-[rgba(6,10,16,0.72)] px-4 py-3 text-sm text-text-primary placeholder:text-text-secondary focus:border-rocket-500/80 focus:outline-none focus:ring-2 focus:ring-rocket-500/30"
                      required
                    />
                  </div>

                  <div>
                    <label htmlFor="offer-commission-currency" className="mb-2 block text-xs uppercase tracking-system text-text-secondary">Currency</label>
                    <input
                      id="offer-commission-currency"
                      type="text"
                      maxLength={3}
                      value={newOffer.commission_currency}
                      onChange={(e) => setNewOffer({ ...newOffer, commission_currency: e.target.value.toUpperCase() || 'USD' })}
                      className="w-full rounded-lg border border-white/15 bg-[rgba(6,10,16,0.72)] px-4 py-3 text-sm text-text-primary placeholder:text-text-secondary focus:border-rocket-500/80 focus:outline-none focus:ring-2 focus:ring-rocket-500/30"
                      placeholder="USD"
                    />
                  </div>
                </div>

                <div className="flex flex-wrap justify-end gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setShowAddForm(false)}
                    className="hud-button-secondary inline-flex min-h-[44px] items-center px-4 py-2 text-sm"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="hud-button-primary inline-flex min-h-[44px] items-center px-4 py-2 text-sm"
                  >
                    Save Offer
                  </button>
                </div>
              </form>
            </div>
          </section>
        </div>
      )}
    </div>
  )
}
