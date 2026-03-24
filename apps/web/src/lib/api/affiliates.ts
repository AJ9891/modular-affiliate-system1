import { getAnalyticsSummary } from './analytics'
import { api } from './client'

export interface OfferRecord {
  id: string
  name: string
  description?: string
  affiliate_link: string
  commission_rate: number
  is_active?: boolean
  active?: boolean
}

interface OffersResponse {
  offers?: OfferRecord[]
}

export interface AffiliateOverview {
  offers: OfferRecord[]
  totalRevenue: number
  totalClicks: number
  totalConversions: number
  estimatedCommissions: number
  conversionRate: number
  performanceByOffer: Array<{ offerKey: string; clicks: number }>
}

export function buildTrackingLink(offerId: string): string {
  if (typeof window === 'undefined') {
    return `/api/redirect/${offerId}`
  }
  return `${window.location.origin}/api/redirect/${offerId}`
}

export async function getAffiliateOverview(range = '30d'): Promise<AffiliateOverview> {
  const [offerPayload, analytics] = await Promise.all([
    api.get<OffersResponse>('/api/offers'),
    getAnalyticsSummary(range),
  ])

  const offers = offerPayload.offers || []
  const activeOffers = offers.filter((offer) => offer.is_active ?? offer.active ?? true)
  const averageCommissionRate =
    activeOffers.length === 0
      ? 0
      : activeOffers.reduce((sum, offer) => sum + (Number(offer.commission_rate) || 0), 0) / activeOffers.length

  return {
    offers,
    totalRevenue: analytics.stats.totalRevenue,
    totalClicks: analytics.stats.totalClicks,
    totalConversions: analytics.stats.totalConversions,
    estimatedCommissions: analytics.stats.totalRevenue * (averageCommissionRate / 100),
    conversionRate: analytics.stats.conversionRate,
    performanceByOffer: analytics.clicksByOffer,
  }
}
