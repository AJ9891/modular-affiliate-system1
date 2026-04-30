import type { LaunchpadIntentId } from '@/lib/launchpad/preflight'

export type StartupFunnelType = 'lead-gen' | 'review' | 'vsl' | 'webinar'
export type StartupTrafficGoal = 'first-100-visitors' | 'first-25-leads' | 'first-10-sales'
export type StartupChecklistField = 'campaignName' | 'funnelType' | 'trafficGoal'
export type StartupTrafficSource = 'paid' | 'organic' | 'email' | 'social'

export interface StartupChecklistState {
  campaignName: string
  funnelType: StartupFunnelType | ''
  trafficGoal: StartupTrafficGoal | ''
}

export const STARTUP_FUNNEL_OPTIONS: Array<{ id: StartupFunnelType; label: string; description: string }> = [
  { id: 'lead-gen', label: 'Lead Magnet', description: 'Capture leads quickly with one focused offer.' },
  { id: 'review', label: 'Offer Review', description: 'Position affiliate offers with proof-first structure.' },
  { id: 'vsl', label: 'Video Sales Letter', description: 'Use narrative flow to warm and convert visitors.' },
  { id: 'webinar', label: 'Webinar Registration', description: 'Collect registrations for live conversion events.' },
]

export const STARTUP_TRAFFIC_GOAL_OPTIONS: Array<{
  id: StartupTrafficGoal
  label: string
  description: string
}> = [
  { id: 'first-100-visitors', label: 'First 100 visitors', description: 'Focus on traffic quality and baseline flow.' },
  { id: 'first-25-leads', label: 'First 25 leads', description: 'Prioritize opt-in conversion and email follow-up.' },
  { id: 'first-10-sales', label: 'First 10 sales', description: 'Drive direct-response traffic to monetization.' },
]

export function getStartupChecklistProgress(state: StartupChecklistState) {
  let completed = 0
  if (state.campaignName.trim().length > 0) completed += 1
  if (state.funnelType) completed += 1
  if (state.trafficGoal) completed += 1

  return {
    completed,
    total: 3,
    label: `Throttle: ${completed}/3 Completed`,
  }
}

export function getMissingStartupChecklistFields(state: StartupChecklistState): StartupChecklistField[] {
  const missing: StartupChecklistField[] = []
  if (state.campaignName.trim().length === 0) missing.push('campaignName')
  if (!state.funnelType) missing.push('funnelType')
  if (!state.trafficGoal) missing.push('trafficGoal')
  return missing
}

export function getStartupDefaultsFromIntent(intent: LaunchpadIntentId): {
  funnelType: StartupFunnelType
  trafficGoal: StartupTrafficGoal
} {
  if (intent === 'import-traffic') {
    return { funnelType: 'review', trafficGoal: 'first-100-visitors' }
  }
  if (intent === 'setup-email') {
    return { funnelType: 'lead-gen', trafficGoal: 'first-25-leads' }
  }
  return { funnelType: 'lead-gen', trafficGoal: 'first-10-sales' }
}

export function mapTrafficGoalToSource(goal: StartupTrafficGoal): StartupTrafficSource {
  if (goal === 'first-100-visitors') return 'organic'
  if (goal === 'first-25-leads') return 'email'
  return 'paid'
}

