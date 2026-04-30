export const JOURNEY_CHECKIN_THRESHOLD_DAYS = 3

export type JourneyMetrics = {
  visitors: number
  conversions: number
  funnels: number
}

export type JourneyRecommendation = {
  nextStep: string
  effort: string
  reason: string
}

export function getDaysSinceLastVisit(lastVisitedAtIso: string | null, now = new Date()): number {
  if (!lastVisitedAtIso) return 0
  const parsed = new Date(lastVisitedAtIso)
  if (Number.isNaN(parsed.getTime())) return 0

  const diffMs = now.getTime() - parsed.getTime()
  if (diffMs <= 0) return 0

  return Math.floor(diffMs / (1000 * 60 * 60 * 24))
}

export function shouldShowJourneyCheckIn(lastVisitedAtIso: string | null, now = new Date()): boolean {
  return getDaysSinceLastVisit(lastVisitedAtIso, now) >= JOURNEY_CHECKIN_THRESHOLD_DAYS
}

export function getJourneyRecommendation(metrics: JourneyMetrics): JourneyRecommendation {
  if (metrics.funnels <= 0) {
    return {
      nextStep: 'Generate a quick-start funnel',
      effort: '3 minutes',
      reason: 'No active funnel is live yet.',
    }
  }

  if (metrics.visitors < 100) {
    return {
      nextStep: 'Run one traffic source profile',
      effort: '5 minutes',
      reason: 'You need stable click volume before optimization decisions are trustworthy.',
    }
  }

  if (metrics.conversions < 1) {
    return {
      nextStep: 'Swap to a higher-intent offer',
      effort: '4 minutes',
      reason: 'You have traffic but no conversion signal yet.',
    }
  }

  return {
    nextStep: 'Duplicate your winning funnel into a second niche',
    effort: '6 minutes',
    reason: 'You already have conversion proof and can scale safely.',
  }
}

export function buildFlightReportCopy(daysAway: number, recommendation: JourneyRecommendation) {
  const awayLabel = daysAway > 0 ? `${daysAway} day${daysAway === 1 ? '' : 's'}` : 'a short break'

  return {
    title: 'Your launchpad is humming. Would you like a flight report?',
    summary: `You were away for ${awayLabel}. Next recommended move: ${recommendation.nextStep}.`,
    detail: `${recommendation.reason} Estimated effort: ${recommendation.effort}.`,
  }
}
