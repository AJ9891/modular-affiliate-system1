import type { AIContext } from '../context/Context.types'
import type { VoiceDefinition, VoiceHeader } from './Voice.types'
import { voiceRegistry } from './voiceRegistry'

export interface BoundVoice {
  header: VoiceHeader
  definition: VoiceDefinition
}

// Locks the voice for the duration of an AI call. Returns null if voice is not allowed.
export function bindVoice(context: AIContext): BoundVoice | null {
  const def = voiceRegistry.get(context.voice)
  if (!def) return null
  if (def.allowedContexts && !def.allowedContexts.includes(context.mode)) return null

  return {
    header: {
      id: def.id,
      system: def.system,
      constraints: def.constraints,
      allowedContexts: def.allowedContexts
    },
    definition: def
  }
}
