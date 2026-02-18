export type VoiceId = 'boost' | 'anti-guru' | 'glitch'

export interface VoiceRuleSet {
  header: string
  rules: string[]
  examples?: string[]
  allowedSurfaces?: string[]
}
