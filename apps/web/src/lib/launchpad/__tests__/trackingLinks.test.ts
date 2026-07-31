import { describe, expect, it } from 'vitest'
import { buildLaunchpadChecklistUrl, buildOfferTrackingPath } from '../trackingLinks'

describe('Launchpad generated links', () => {
  it('encodes identifiers and attribution values', () => {
    expect(buildOfferTrackingPath({
      offerId: 'offer/one',
      funnelId: 'funnel & three',
      campaign: 'launch checklist',
    })).toBe('/api/redirect/offer%2Fone?aff_funnel=funnel+%26+three&utm_source=launchpad&utm_medium=funnel&utm_campaign=launch+checklist')
  })

  it('generates the canonical checklist entry URL', () => {
    expect(buildLaunchpadChecklistUrl()).toBe('https://launchpad4success.pro/launchpad?checklist=1')
  })
})
