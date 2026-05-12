import type { VoiceId } from '../Voice.types'

export type VoiceSurface = 'builder' | 'onboarding' | 'live_funnel' | 'templates' | 'analytics'

export type VoiceCompatibilityMap = Record<VoiceId, VoiceSurface[]>

export const VOICE_COMPATIBILITY: VoiceCompatibilityMap = {
  boost: ['builder', 'onboarding', 'live_funnel', 'analytics'],
  'anti-guru': ['builder', 'templates'],
  glitch: ['builder', 'templates'],
}

export function isVoiceCompatible(voice: VoiceId, surface: VoiceSurface): boolean {
  return VOICE_COMPATIBILITY[voice].includes(surface)
}
