'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { X } from 'lucide-react'
import { buildAffiliateLink } from '@/lib/tracking'

interface Offer {
  id: string
  name: string
  description: string
  affiliate_link: string
  commission_rate: number
  niche_id?: string
  is_active: boolean
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

export default function OffersPage() {
  const router = useRouter()
  const [offers, setOffers] = useState<Offer[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddForm, setShowAddForm] = useState(false)
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [copiedType, setCopiedType] = useState<'tracking' | 'affiliate' | null>(null)
  const [newOffer, setNewOffer] = useState({
    name: '',
    description: '',
    affiliate_link: '',
    commission_rate: 0,
  })

  useEffect(() => {
    checkAuth()
    loadOffers()
  }, [])

  async function checkAuth() {
    const res = await fetch('/api/auth/me')
    if (!res.ok) {
      router.push('/login')
    }
  }

  async function loadOffers() {
    try {
      setLoading(true)
      const res = await fetch('/api/offers')
      if (res.ok) {
        const payload = await readResponsePayload(res)
        const data = payload && typeof payload === 'object' ? payload : null
        setOffers(data?.offers || [])
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
      const res = await fetch('/api/offers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newOffer),
      })
      const payload = await readResponsePayload(res)

      if (res.ok) {
        setShowAddForm(false)
        setNewOffer({ name: '', description: '', affiliate_link: '', commission_rate: 0 })
        loadOffers()
      } else {
        const message = getApiErrorMessage(res, payload)
        console.error('Failed to add offer:', {
          status: res.status,
          statusText: res.statusText,
          payload,
        })
        alert(`Failed to add offer: ${message}`)
      }
    } catch (error) {
      console.error('Error adding offer:', error)
      alert(`Error adding offer: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  async function handleToggleActive(offerId: string, currentStatus: boolean) {
    try {
      const res = await fetch(`/api/offers/${offerId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_active: !currentStatus }),
      })

      if (res.ok) {
        loadOffers()
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
    }, 2000)
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
      }, 2000)
    } catch (error) {
      console.error('Error building affiliate link:', error)
      // Fallback: just copy the base URL
      navigator.clipboard.writeText(baseUrl)
      setCopiedId(offerId)
      setCopiedType('affiliate')
      setTimeout(() => {
        setCopiedId(null)
        setCopiedType(null)
      }, 2000)
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
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">
              Affiliate Offers
            </h1>
            <p className="text-blue-200">Manage your affiliate offers and tracking links</p>
          </div>
          
          <button
            onClick={() => setShowAddForm(true)}
            className="hud-button-primary px-6 py-3 text-sm"
          >
            + Add Offer
          </button>
        </div>

        {/* Offers List */}
        <div className="space-y-4">
          {offers.length > 0 ? (
            offers.map((offer) => (
              <div
                key={offer.id}
                className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20"
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-2xl font-bold text-white mb-2">{offer.name}</h3>
                    <p className="text-blue-200 mb-2">{offer.description}</p>
                    <div className="text-sm text-blue-200">
                      Commission: <span className="text-yellow-400 font-bold">{offer.commission_rate}%</span>
                    </div>
                  </div>
                  
                  <button
                    onClick={() => handleToggleActive(offer.id, offer.is_active)}
                    className={`px-4 py-2 rounded-lg font-semibold transition ${
                      offer.is_active
                        ? 'bg-green-500 text-white'
                        : 'bg-gray-500 text-white'
                    }`}
                  >
                    {offer.is_active ? 'Active' : 'Inactive'}
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <div className="text-sm text-blue-200 mb-2">Tracking Link (redirects & tracks)</div>
                    <div className="flex gap-2">
                      <code className="flex-1 px-3 py-2 bg-black/30 rounded text-white text-sm break-all">
                        {`${typeof window !== 'undefined' ? window.location.origin : ''}/api/redirect/${offer.id}`}
                      </code>
                      <button
                        onClick={() => copyTrackingLink(offer.id)}
                        className={`px-4 py-2 rounded font-semibold transition ${
                          copiedId === offer.id && copiedType === 'tracking'
                            ? 'bg-green-500 text-white'
                            : 'bg-yellow-400 hover:bg-yellow-500 text-gray-900'
                        }`}
                      >
                        {copiedId === offer.id && copiedType === 'tracking' ? 'Copied!' : 'Copy'}
                      </button>
                    </div>
                  </div>

                  <div>
                    <div className="text-sm text-blue-200 mb-2">Direct Affiliate Link</div>
                    <div className="flex gap-2">
                      <code className="flex-1 px-3 py-2 bg-black/30 rounded text-white text-sm break-all">
                        {offer.affiliate_link}
                      </code>
                      <button
                        onClick={() => copyAffiliateLink(offer.affiliate_link, offer.id)}
                        className={`px-4 py-2 rounded font-semibold transition ${
                          copiedId === offer.id && copiedType === 'affiliate'
                            ? 'bg-green-500 text-white'
                            : 'bg-white/20 hover:bg-white/30 text-white'
                        }`}
                      >
                        {copiedId === offer.id && copiedType === 'affiliate' ? 'Copied!' : 'Copy'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-12 border border-white/20 text-center">
              <div className="text-white text-xl mb-4">No offers yet</div>
              <p className="text-blue-200 mb-6">Add your first affiliate offer to start tracking clicks and conversions</p>
              <button
                onClick={() => setShowAddForm(true)}
                className="px-6 py-3 bg-yellow-400 hover:bg-yellow-500 text-gray-900 rounded-lg font-bold transition"
              >
                Add Your First Offer
              </button>
            </div>
          )}
        </div>

        {/* Back to Dashboard */}
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
                  <p className="text-sm text-text-secondary">Create an offer with direct and trackable affiliate links.</p>
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
                <div>
                  <label htmlFor="offer-name" className="mb-2 block text-xs uppercase tracking-system text-text-secondary">
                    Offer Name
                  </label>
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
                  <label htmlFor="offer-description" className="mb-2 block text-xs uppercase tracking-system text-text-secondary">
                    Description
                  </label>
                  <textarea
                    id="offer-description"
                    value={newOffer.description}
                    onChange={(e) => setNewOffer({ ...newOffer, description: e.target.value })}
                    className="w-full rounded-lg border border-white/15 bg-[rgba(6,10,16,0.72)] px-4 py-3 text-sm text-text-primary placeholder:text-text-secondary focus:border-rocket-500/80 focus:outline-none focus:ring-2 focus:ring-rocket-500/30"
                    rows={3}
                    placeholder="What does this offer help the customer achieve?"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="offer-affiliate-link" className="mb-2 block text-xs uppercase tracking-system text-text-secondary">
                    Affiliate Link
                  </label>
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

                <div>
                  <label htmlFor="offer-commission-rate" className="mb-2 block text-xs uppercase tracking-system text-text-secondary">
                    Commission Rate (%)
                  </label>
                  <input
                    id="offer-commission-rate"
                    type="number"
                    min="0"
                    max="100"
                    step="0.01"
                    value={newOffer.commission_rate}
                    onChange={(e) =>
                      setNewOffer({
                        ...newOffer,
                        commission_rate: Number.isFinite(e.target.valueAsNumber) ? e.target.valueAsNumber : 0,
                      })
                    }
                    className="w-full rounded-lg border border-white/15 bg-[rgba(6,10,16,0.72)] px-4 py-3 text-sm text-text-primary placeholder:text-text-secondary focus:border-rocket-500/80 focus:outline-none focus:ring-2 focus:ring-rocket-500/30"
                    required
                  />
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
