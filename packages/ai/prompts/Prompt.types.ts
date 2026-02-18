import type { AIContext } from '../context/Context.types'
import type { VoiceHeader } from '../voices/Voice.types'
import type { PromptContract } from './promptContracts/types'

export interface PromptAssemblyInput {
  context: AIContext
  voiceHeader: VoiceHeader
  contract: PromptContract
  userContent?: string
  componentInstructions?: string
}

export interface PromptAssemblyOutput {
  prompt: string
  metadata: Record<string, unknown>
}
