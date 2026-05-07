'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
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

export default function OffersPage() {
  const router = useRouter()
  const [offers, setOffers] = useState<Offer[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddForm, setShowAddForm] = useState(false)
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [copiedType, setCopiedType] = useState<'tracking' | 'affiliate' | null>(null)
  const [origin, setOrigin] = useState('')
  const [newOffer, setNewOffer] = useState({
    name: '',
    description: '',
    affiliate_link: '',
    commission_rate: 0,
  })

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setOrigin(window.location.origin)
    }

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
        const data = await res.json()
        setOffers(data.offers || [])
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

      const data = await res.json()

      if (res.ok) {
        setShowAddForm(false)
        setNewOffer({ name: '', description: '', affiliate_link: '', commission_rate: 0 })
        loadOffers()
      } else {
        console.error('Failed to add offer:', data)
        alert(`Failed to add offer: ${data.error || 'Unknown error'}`)
      }
    } catch (error) {
      console.error('Error adding offer:', error)
      alert('Error adding offer')
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
    const trackingLink = `${origin}/api/redirect/${offerId}`
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
      <div className="theme-fuel cockpit-shell page-fuel-management flex items-center justify-center">
        <div className="text-xl text-text-secondary">Loading offers...</div>
      </div>
    )
  }

  return (
    <div className="theme-fuel cockpit-shell page-fuel-management py-8">
      <div className="cockpit-container max-w-6xl">
        <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <button
            onClick={() => router.push('/dashboard')}
            className="hud-button-secondary w-fit px-4 py-2"
          >
            ← Back to Dashboard
          </button>

          <button
            onClick={() => setShowAddForm((prev) => !prev)}
            className="hud-button-primary w-fit px-6 py-2"
          >
            {showAddForm ? 'Cancel' : '+ Add Offer'}
          </button>
        </div>

        <section className="hud-panel mb-8">
          <h1 className="mb-2 text-4xl font-semibold text-text-primary">Affiliate Offers</h1>
          <p className="text-text-secondary">Manage your affiliate offers and tracking links.</p>
        </section>

        {showAddForm && (
          <section className="hud-card mb-8">
            <h2 className="mb-4 text-2xl font-semibold text-text-primary">Add New Offer</h2>
            <form onSubmit={handleAddOffer} className="space-y-4">
              <div>
                <label className="mb-2 block text-sm font-medium text-text-secondary">Offer Name</label>
                <input
                  type="text"
                  value={newOffer.name}
                  onChange={(e) => setNewOffer({ ...newOffer, name: e.target.value })}
                  className="hud-input"
                  required
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-text-secondary">Description</label>
                <textarea
                  value={newOffer.description}
                  onChange={(e) => setNewOffer({ ...newOffer, description: e.target.value })}
                  className="hud-textarea min-h-28"
                  required
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-text-secondary">Affiliate Link</label>
                <input
                  type="url"
                  value={newOffer.affiliate_link}
                  onChange={(e) => setNewOffer({ ...newOffer, affiliate_link: e.target.value })}
                  className="hud-input"
                  required
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-text-secondary">Commission Rate (%)</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={newOffer.commission_rate}
                  onChange={(e) => {
                    const value = Number.parseFloat(e.target.value)
                    setNewOffer({ ...newOffer, commission_rate: Number.isNaN(value) ? 0 : value })
                  }}
                  className="hud-input"
                  required
                />
              </div>

              <button type="submit" className="hud-button-primary w-full py-2.5">
                Add Offer
              </button>
            </form>
          </section>
        )}

        <section className="space-y-4">
          {offers.length > 0 ? (
            offers.map((offer) => {
              const trackingLink = `${origin}/api/redirect/${offer.id}`
              return (
                <article key={offer.id} className="hud-card">
                  <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                    <div>
                      <h3 className="mb-1 text-2xl font-semibold text-text-primary">{offer.name}</h3>
                      <p className="mb-2 text-text-secondary">{offer.description}</p>
                      <p className="text-sm text-text-secondary">
                        Commission: <span className="font-semibold text-rocket-500">{offer.commission_rate}%</span>
                      </p>
                    </div>

                    <button
                      onClick={() => handleToggleActive(offer.id, offer.is_active)}
                      className={
                        offer.is_active
                          ? 'rounded-full border border-emerald-300/30 bg-emerald-500/15 px-4 py-2 text-sm font-semibold text-emerald-200'
                          : 'rounded-full border border-slate-300/25 bg-slate-500/15 px-4 py-2 text-sm font-semibold text-slate-200'
                      }
                    >
                      {offer.is_active ? 'Active' : 'Inactive'}
                    </button>
                  </div>

                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div className="hud-card-tight space-y-2">
                      <p className="text-xs uppercase tracking-system text-text-secondary">Tracking Link</p>
                      <code className="block break-all text-sm text-text-primary">{trackingLink}</code>
                      <button
                        onClick={() => copyTrackingLink(offer.id)}
                        className={
                          copiedId === offer.id && copiedType === 'tracking'
                            ? 'hud-button-primary px-3 py-1.5 text-xs'
                            : 'hud-button-secondary px-3 py-1.5 text-xs'
                        }
                      >
                        {copiedId === offer.id && copiedType === 'tracking' ? 'Copied!' : 'Copy'}
                      </button>
                    </div>

                    <div className="hud-card-tight space-y-2">
                      <p className="text-xs uppercase tracking-system text-text-secondary">Direct Affiliate Link</p>
                      <code className="block break-all text-sm text-text-primary">{offer.affiliate_link}</code>
                      <button
                        onClick={() => copyAffiliateLink(offer.affiliate_link, offer.id)}
                        className={
                          copiedId === offer.id && copiedType === 'affiliate'
                            ? 'hud-button-primary px-3 py-1.5 text-xs'
                            : 'hud-button-secondary px-3 py-1.5 text-xs'
                        }
                      >
                        {copiedId === offer.id && copiedType === 'affiliate' ? 'Copied!' : 'Copy'}
                      </button>
                    </div>
                  </div>
                </article>
              )
            })
          ) : (
            <article className="hud-card text-center">
              <div className="mb-3 text-xl font-semibold text-text-primary">No offers yet</div>
              <p className="mb-6 text-text-secondary">
                Add your first affiliate offer to start tracking clicks and conversions.
              </p>
              <button onClick={() => setShowAddForm(true)} className="hud-button-primary px-6 py-2.5">
                Add Your First Offer
              </button>
            </article>
          )}
        </section>
      </div>
    </div>
  )
}
