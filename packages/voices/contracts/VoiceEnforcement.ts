import type { VoiceId } from '../Voice.types'
import { isVoiceCompatible, type VoiceSurface } from './VoiceCompatibility'

export interface VoiceEnforcementResult {
  allowed: boolean
  voice: VoiceId
  fallbackVoice: VoiceId
  reason?: string
}

const DEFAULT_FALLBACK_VOICE: VoiceId = 'boost'

export function enforceVoiceSurfaceCompatibility(
  voice: VoiceId,
  surface: VoiceSurface,
): VoiceEnforcementResult {
  if (isVoiceCompatible(voice, surface)) {
    return {
      allowed: true,
      voice,
      fallbackVoice: voice,
    }
  }

  return {
    allowed: false,
    voice,
    fallbackVoice: DEFAULT_FALLBACK_VOICE,
    reason: `Voice ${voice} is not compatible with ${surface}.`,
  }
}
