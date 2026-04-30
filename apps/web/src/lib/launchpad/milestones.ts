export type LaunchpadMilestoneId = 'first-100-visitors' | 'first-conversion'

export interface LaunchpadMilestone {
  id: LaunchpadMilestoneId
  title: string
  message: string
}

export interface LaunchpadDashboardStats {
  visitors: number
  conversions: number
}

const MILESTONE_REGISTRY: Record<LaunchpadMilestoneId, LaunchpadMilestone> = {
  'first-100-visitors': {
    id: 'first-100-visitors',
    title: 'First 100 Visitors',
    message: 'Clear skies ahead. That milestone just unlocked your next level.',
  },
  'first-conversion': {
    id: 'first-conversion',
    title: 'First Conversion',
    message: 'You just converted real traffic. Keep this flow and scale deliberately.',
  },
}

export function getUnlockedMilestones(
  stats: LaunchpadDashboardStats,
  seenMilestones: Set<LaunchpadMilestoneId>
): LaunchpadMilestone[] {
  const unlocked: LaunchpadMilestone[] = []

  if (stats.visitors >= 100 && !seenMilestones.has('first-100-visitors')) {
    unlocked.push(MILESTONE_REGISTRY['first-100-visitors'])
  }

  if (stats.conversions >= 1 && !seenMilestones.has('first-conversion')) {
    unlocked.push(MILESTONE_REGISTRY['first-conversion'])
  }

  return unlocked
}

