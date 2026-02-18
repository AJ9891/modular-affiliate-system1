import type { VoiceId } from '../context/Context.types'

export interface VoiceHeader {
  id: VoiceId
  system: string
  constraints: string[]
  allowedContexts?: ('builder' | 'onboarding' | 'live_funnel')[]
}

export interface VoiceDefinition extends VoiceHeader {
  principles: string[]
  forbidden: string[]
}
