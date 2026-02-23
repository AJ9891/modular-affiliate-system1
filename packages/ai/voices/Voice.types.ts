import type { PageMode, VoiceId } from '../context/Context.types'

export type { VoiceId }

export interface VoiceHeader {
  id: VoiceId
  system: string
  constraints: string[]
  allowedContexts?: (PageMode | 'templates')[]
}

export interface VoiceDefinition extends VoiceHeader {
  principles: string[]
  forbidden: string[]
}
