import { describe, expect, it } from 'vitest'
import {
  buildFlightReportCopy,
  getDaysSinceLastVisit,
  getJourneyRecommendation,
  shouldShowJourneyCheckIn,
} from '@/lib/launchpad/journeySupport'

describe('launchpad journey support', () => {
  it('computes days since last visit', () => {
    const now = new Date('2026-04-30T00:00:00.000Z')
    expect(getDaysSinceLastVisit('2026-04-27T00:00:00.000Z', now)).toBe(3)
    expect(getDaysSinceLastVisit('2026-04-30T00:00:00.000Z', now)).toBe(0)
  })

  it('shows check-in only after threshold', () => {
    const now = new Date('2026-04-30T00:00:00.000Z')
    expect(shouldShowJourneyCheckIn('2026-04-28T00:00:00.000Z', now)).toBe(false)
    expect(shouldShowJourneyCheckIn('2026-04-26T00:00:00.000Z', now)).toBe(true)
  })

  it('returns recommendations by funnel maturity', () => {
    expect(getJourneyRecommendation({ visitors: 0, conversions: 0, funnels: 0 }).nextStep).toContain('quick-start')
    expect(getJourneyRecommendation({ visitors: 80, conversions: 0, funnels: 1 }).nextStep).toContain('traffic source')
    expect(getJourneyRecommendation({ visitors: 200, conversions: 0, funnels: 1 }).nextStep).toContain('higher-intent offer')
    expect(getJourneyRecommendation({ visitors: 200, conversions: 2, funnels: 1 }).nextStep).toContain('Duplicate')
  })

  it('builds a friendly flight report summary', () => {
    const recommendation = getJourneyRecommendation({ visitors: 200, conversions: 2, funnels: 1 })
    const copy = buildFlightReportCopy(4, recommendation)
    expect(copy.title).toContain('flight report')
    expect(copy.summary).toContain('4 days')
    expect(copy.detail).toContain('Estimated effort')
  })
})
