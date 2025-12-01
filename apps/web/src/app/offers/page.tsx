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
      console.log('Submitting offer:', newOffer)
      
      const res = await fetch('/api/offers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newOffer),
      })

      const data = await res.json()
      console.log('Response:', data)

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
            onClick={() => setShowAddForm(!showAddForm)}
            className="px-6 py-3 bg-yellow-400 hover:bg-yellow-500 text-gray-900 rounded-lg font-bold transition"
          >
            {showAddForm ? 'Cancel' : '+ Add Offer'}
          </button>
        </div>

        {/* Add Offer Form */}
        {showAddForm && (
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 mb-8">
            <h2 className="text-2xl font-bold text-white mb-4">Add New Offer</h2>
            <form onSubmit={handleAddOffer} className="space-y-4">
              <div>
                <label className="block text-white mb-2">Offer Name</label>
                <input
                  type="text"
                  value={newOffer.name}
                  onChange={(e) => setNewOffer({ ...newOffer, name: e.target.value })}
                  className="w-full px-4 py-3 rounded-lg bg-white/20 text-white border border-white/30 focus:border-yellow-400 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-white mb-2">Description</label>
                <textarea
                  value={newOffer.description}
                  onChange={(e) => setNewOffer({ ...newOffer, description: e.target.value })}
                  className="w-full px-4 py-3 rounded-lg bg-white/20 text-white border border-white/30 focus:border-yellow-400 focus:outline-none"
                  rows={3}
                  required
                />
              </div>

              <div>
                <label className="block text-white mb-2">Affiliate Link</label>
                <input
                  type="url"
                  value={newOffer.affiliate_link}
                  onChange={(e) => setNewOffer({ ...newOffer, affiliate_link: e.target.value })}
                  className="w-full px-4 py-3 rounded-lg bg-white/20 text-white border border-white/30 focus:border-yellow-400 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-white mb-2">Commission Rate (%)</label>
                <input
                  type="number"
                  step="0.01"
                  value={newOffer.commission_rate}
                  onChange={(e) => setNewOffer({ ...newOffer, commission_rate: parseFloat(e.target.value) })}
                  className="w-full px-4 py-3 rounded-lg bg-white/20 text-white border border-white/30 focus:border-yellow-400 focus:outline-none"
                  required
                />
              </div>

              <button
                type="submit"
                className="w-full px-6 py-3 bg-yellow-400 hover:bg-yellow-500 text-gray-900 rounded-lg font-bold transition"
              >
                Add Offer
              </button>
            </form>
          </div>
        )}

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
    </div>
  )
}
