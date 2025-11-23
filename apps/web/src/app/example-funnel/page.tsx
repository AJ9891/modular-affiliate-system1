'use client'

import { useEffect, useState } from 'react'
import { trackClick, extractUTMParams } from '@/lib/tracking'

/**
 * Example funnel page showing how to implement affiliate tracking
 * This would be a real landing page with offers
 */
export default function ExampleFunnelPage() {
  const [offers, setOffers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadOffers()
  }, [])

  async function loadOffers() {
    try {
      const res = await fetch('/api/offers')
      if (res.ok) {
        const data = await res.json()
        setOffers(data.offers?.filter((o: any) => o.is_active) || [])
      }
    } catch (error) {
      console.error('Failed to load offers:', error)
    } finally {
      setLoading(false)
    }
  }

  async function handleOfferClick(offerId: string) {
    // Extract UTM parameters from current URL
    const utmParams = extractUTMParams()
    
    // Track the click with UTM data
    await trackClick({
      offerId,
      funnelId: 'example-funnel-id', // Would come from funnel config
      utmSource: utmParams.utmSource,
      utmMedium: utmParams.utmMedium,
      utmCampaign: utmParams.utmCampaign,
    })
    
    // Redirect to tracking URL
    window.location.href = `/api/redirect/${offerId}?utm_source=${utmParams.utmSource || ''}&utm_medium=${utmParams.utmMedium || ''}&utm_campaign=${utmParams.utmCampaign || ''}`
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-green-900">
      {/* Hero Section */}
      <div className="py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
            Transform Your Life with These Amazing Products
          </h1>
          <p className="text-xl text-blue-200 mb-8">
            Carefully curated affiliate offers that actually deliver results
          </p>
        </div>
      </div>

      {/* Offers Section */}
      <div className="py-12 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-white text-center mb-12">
            Featured Offers
          </h2>

          {loading ? (
            <div className="text-center text-white">Loading offers...</div>
          ) : offers.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {offers.map((offer) => (
                <div
                  key={offer.id}
                  className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 hover:border-yellow-400 transition"
                >
                  <h3 className="text-2xl font-bold text-white mb-3">{offer.name}</h3>
                  <p className="text-blue-200 mb-6">{offer.description}</p>
                  
                  <div className="mb-6">
                    <span className="text-yellow-400 font-bold text-lg">
                      {offer.commission_rate}% Commission
                    </span>
                  </div>

                  <button
                    onClick={() => handleOfferClick(offer.id)}
                    className="w-full px-6 py-3 bg-yellow-400 hover:bg-yellow-500 text-gray-900 rounded-lg font-bold transition"
                  >
                    Get Started Now →
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center text-white">
              <p className="text-xl mb-4">No active offers available</p>
              <p className="text-blue-200">Check back soon for new opportunities!</p>
            </div>
          )}
        </div>
      </div>

      {/* Benefits Section */}
      <div className="py-20 px-4">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-white text-center mb-12">
            Why Choose Our Recommended Products?
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="text-5xl mb-4">✓</div>
              <h3 className="text-xl font-bold text-white mb-2">Verified Quality</h3>
              <p className="text-blue-200">All offers are hand-picked and tested</p>
            </div>
            
            <div className="text-center">
              <div className="text-5xl mb-4">🚀</div>
              <h3 className="text-xl font-bold text-white mb-2">Fast Results</h3>
              <p className="text-blue-200">See improvements in days, not months</p>
            </div>
            
            <div className="text-center">
              <div className="text-5xl mb-4">💯</div>
              <h3 className="text-xl font-bold text-white mb-2">Money-Back Guarantee</h3>
              <p className="text-blue-200">Risk-free trials on most offers</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tracking Info (for demo purposes - would be hidden in production) */}
      <div className="py-8 px-4 bg-black/30">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white/10 rounded-lg p-6 border border-yellow-400">
            <h3 className="text-yellow-400 font-bold mb-2">🔍 Demo: Tracking Information</h3>
            <p className="text-white text-sm mb-2">
              This page demonstrates affiliate link tracking. When you click an offer:
            </p>
            <ul className="text-blue-200 text-sm space-y-1 list-disc list-inside">
              <li>Click is tracked in database with UTM parameters</li>
              <li>30-day attribution cookie is set</li>
              <li>User is redirected through /api/redirect/[offer-id]</li>
              <li>Analytics are updated in real-time</li>
              <li>Conversions are tracked via cookie attribution</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
