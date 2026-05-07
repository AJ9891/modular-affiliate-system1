import type { VoiceId } from '../Voice.types'

export type VoiceCompatibility = {
  sourceVoice: VoiceId
  targetVoice: VoiceId
  compatible: boolean
  notes?: string
}
