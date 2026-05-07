import type { PlanId } from './plans'

export interface CapabilitySnapshot {
  canUseCustomDomains: boolean
  canUseAbTesting: boolean
  canUseAutoOptimize: boolean
  maxFunnels: number
  maxTeamMembers: number
}

export interface PlatformStateSnapshot {
  userId: string
  plan: PlanId
  launchpadStage: string | null
  capabilities: CapabilitySnapshot
}
