import type { ComponentId, PageMode, RiskLevel, UserLevel, VoiceId, AIContext } from '../context/Context.types'
import type { PromptContract } from '../prompts/promptContracts/types'
import type { VoiceHeader } from '../voices/Voice.types'
import type { LintResult } from '../linting/Lint.types'

export type PipelineContractKey = 'hero' | 'template' | 'cta' | 'onboarding' | 'analytics' | 'funnel' | 'glitch'

export interface AIRequestPipelineInput {
  componentId: ComponentId
  pageMode: PageMode
  userLevel: UserLevel
  voice: VoiceId
  riskLevel: RiskLevel
  content: string
  componentInstructions?: string
  metadata?: Record<string, unknown>
  contractKey?: PipelineContractKey
}

export interface PreparedAIRequest {
  blocked: boolean
  reason?: string
  prompt: string
  context: AIContext
  contract: PromptContract
  voiceHeader: VoiceHeader
}

export interface ResponseLintEnvelope {
  blocked: boolean
  result: LintResult
}
