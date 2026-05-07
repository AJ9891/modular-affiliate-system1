import type { VoiceId } from '../Voice.types'

export type VoiceSurface =
  | 'builder'
  | 'live_funnel'
  | 'onboarding'
  | 'analytics'
  | 'templates'

export interface VoiceContract {
  id: VoiceId
  label: string
  allowedSurfaces: VoiceSurface[]
  requiresExplicitActivation: boolean
  bannedClaims: string[]
  styleGuards: string[]
}

export interface VoiceTransitionRule {
  from: VoiceId
  to: VoiceId
  allowed: boolean
  notes?: string
}

export interface VoiceTransitionResult {
  isAllowed: boolean
  reason?: string
}
