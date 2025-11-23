/**
 * Tracking utilities for affiliate links and conversions
 */

interface TrackClickParams {
  offerId: string
  funnelId?: string
  utmSource?: string
  utmMedium?: string
  utmCampaign?: string
}

interface TrackConversionParams {
  offerId: string
  amount: number
  orderId: string
}

/**
 * Track affiliate link click
 */
export async function trackClick(params: TrackClickParams): Promise<string | null> {
  try {
    const response = await fetch('/api/track/click', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        offer_id: params.offerId,
        funnel_id: params.funnelId,
        utm_source: params.utmSource,
        utm_medium: params.utmMedium,
        utm_campaign: params.utmCampaign,
      }),
    })

    if (!response.ok) {
      console.error('Failed to track click')
      return null
    }

    const data = await response.json()
    return data.click_id
  } catch (error) {
    console.error('Error tracking click:', error)
    return null
  }
}

/**
 * Track conversion event
 */
export async function trackConversion(params: TrackConversionParams): Promise<boolean> {
  try {
    const response = await fetch('/api/track/conversion', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        offer_id: params.offerId,
        amount: params.amount,
        order_id: params.orderId,
      }),
    })

    if (!response.ok) {
      console.error('Failed to track conversion')
      return false
    }

    return true
  } catch (error) {
    console.error('Error tracking conversion:', error)
    return false
  }
}

/**
 * Extract UTM parameters from URL
 */
export function extractUTMParams(): {
  utmSource?: string
  utmMedium?: string
  utmCampaign?: string
  utmContent?: string
  utmTerm?: string
} {
  if (typeof window === 'undefined') return {}

  const params = new URLSearchParams(window.location.search)
  
  return {
    utmSource: params.get('utm_source') || undefined,
    utmMedium: params.get('utm_medium') || undefined,
    utmCampaign: params.get('utm_campaign') || undefined,
    utmContent: params.get('utm_content') || undefined,
    utmTerm: params.get('utm_term') || undefined,
  }
}

/**
 * Build affiliate link with tracking parameters
 */
export function buildAffiliateLink(
  baseUrl: string,
  offerId: string,
  options?: {
    funnelId?: string
    source?: string
    medium?: string
    campaign?: string
  }
): string {
  const url = new URL(baseUrl)
  
  // Add tracking parameters
  url.searchParams.set('aff_offer', offerId)
  if (options?.funnelId) url.searchParams.set('aff_funnel', options.funnelId)
  if (options?.source) url.searchParams.set('utm_source', options.source)
  if (options?.medium) url.searchParams.set('utm_medium', options.medium)
  if (options?.campaign) url.searchParams.set('utm_campaign', options.campaign)
  
  return url.toString()
}

/**
 * Generate conversion pixel HTML
 */
export function generateConversionPixel(
  offerId: string,
  amount: number,
  orderId: string
): string {
  const params = new URLSearchParams({
    offer_id: offerId,
    amount: amount.toString(),
    order_id: orderId,
  })
  
  return `<img src="/api/track/conversion?${params.toString()}" width="1" height="1" style="display:none" />`
}
