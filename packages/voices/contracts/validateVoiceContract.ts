import type { VoiceId } from '../Voice.types'
import type { VoiceSurface, VoiceTransitionResult } from './VoiceContract.types'
import { voiceContracts, voiceTransitionRules } from './voiceContracts'

export function validateVoiceSurface(voice: VoiceId, surface: VoiceSurface): VoiceTransitionResult {
  const contract = voiceContracts[voice]
  if (!contract.allowedSurfaces.includes(surface)) {
    return {
      isAllowed: false,
      reason: `Voice "${voice}" is not allowed on "${surface}".`
    }
  }

  return { isAllowed: true }
}

export function validateVoiceTransition(from: VoiceId, to: VoiceId): VoiceTransitionResult {
  const rule = voiceTransitionRules.find((entry) => entry.from === from && entry.to === to)
  if (!rule || !rule.allowed) {
    return {
      isAllowed: false,
      reason: `Transition "${from}" -> "${to}" is blocked by contract.`
    }
  }

  return {
    isAllowed: true,
    reason: rule.notes
  }
}
