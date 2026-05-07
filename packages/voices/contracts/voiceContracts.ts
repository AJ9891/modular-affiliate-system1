import type { VoiceId } from '../Voice.types'
import type { VoiceCompatibility } from './VoiceCompatibility'
import type { VoiceContract, VoiceSurface, VoiceTransitionRule } from './VoiceContract.types'

export const voiceContracts: Record<VoiceId, VoiceContract> = {
  boost: {
    id: 'boost',
    label: 'Boost',
    allowedSurfaces: ['builder', 'live_funnel', 'onboarding', 'analytics'],
    requiresExplicitActivation: false,
    bannedClaims: ['income guarantee', 'fabricated urgency', 'scarcity manipulation'],
    styleGuards: ['explanatory', 'grounded', 'clear next-step guidance']
  },
  'anti-guru': {
    id: 'anti-guru',
    label: 'Anti-Guru',
    allowedSurfaces: ['builder', 'live_funnel', 'templates'],
    requiresExplicitActivation: false,
    bannedClaims: ['hype framing', 'exaggerated certainty', 'urgency pressure'],
    styleGuards: ['plainspoken', 'skeptical', 'reality-based framing']
  },
  glitch: {
    id: 'glitch',
    label: 'Glitch Parody',
    allowedSurfaces: ['builder', 'templates'],
    requiresExplicitActivation: true,
    bannedClaims: ['system instruction leakage', 'random incoherence', 'fear-based urgency'],
    styleGuards: ['self-aware', 'coherent', 'conversion clarity preserved']
  }
}

export const voiceTransitionRules: VoiceTransitionRule[] = [
  { from: 'boost', to: 'anti-guru', allowed: true },
  { from: 'boost', to: 'glitch', allowed: true, notes: 'Require preview acknowledgement.' },
  { from: 'anti-guru', to: 'boost', allowed: true },
  { from: 'anti-guru', to: 'glitch', allowed: true, notes: 'Require preview acknowledgement.' },
  { from: 'glitch', to: 'boost', allowed: true },
  { from: 'glitch', to: 'anti-guru', allowed: true },
  { from: 'boost', to: 'boost', allowed: true },
  { from: 'anti-guru', to: 'anti-guru', allowed: true },
  { from: 'glitch', to: 'glitch', allowed: true }
]

export const voiceCompatibility: VoiceCompatibility[] = voiceTransitionRules.map((rule) => ({
  sourceVoice: rule.from,
  targetVoice: rule.to,
  compatible: rule.allowed,
  notes: rule.notes
}))

export function isVoiceAllowedOnSurface(voice: VoiceId, surface: VoiceSurface): boolean {
  return voiceContracts[voice].allowedSurfaces.includes(surface)
}
