import type { VoiceId, VoiceRuleSet } from './Voice.types'

type VoiceEntry = {
  id: VoiceId
  header: VoiceRuleSet
  rules: VoiceRuleSet
  examples: VoiceRuleSet
  allowedSurfaces?: string[]
}

class Registry {
  private voices = new Map<VoiceId, VoiceEntry>()

  register(entry: VoiceEntry) {
    this.voices.set(entry.id, entry)
  }

  get(id: VoiceId) {
    return this.voices.get(id)
  }

  list() {
    return Array.from(this.voices.values())
  }
}

export const voiceRegistry = new Registry()
