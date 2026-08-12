export type OfferTrackingContext = {
  offerId: string
  funnelId: string
  campaign: string
  source?: string
  medium?: string
}

export function buildOfferTrackingPath({
  offerId,
  funnelId,
  campaign,
  source = 'launchpad',
  medium = 'funnel',
}: OfferTrackingContext): string {
  const params = new URLSearchParams({
    aff_funnel: funnelId,
    utm_source: source,
    utm_medium: medium,
    utm_campaign: campaign,
  })
  return `/api/redirect/${encodeURIComponent(offerId)}?${params.toString()}`
}

export function buildLaunchpadChecklistUrl(origin = 'https://launchpad4success.pro'): string {
  const url = new URL('/launchpad', origin)
  url.searchParams.set('checklist', '1')
  return url.toString()
}
