export const VOICE_IDS = [
  'anchor',
  'rocket',
  'anti_guru',
  'glitch',
  'boost',
] as const

export type VoiceId = (typeof VOICE_IDS)[number]

export interface VoiceContract {
  id: VoiceId
  tone: string
  lexiconConstraints: string[]
  forbiddenPatterns: string[]
  fallbackStyle: string
}

export function isVoiceId(value: unknown): value is VoiceId {
  return typeof value === 'string' && (VOICE_IDS as readonly string[]).includes(value)
}
