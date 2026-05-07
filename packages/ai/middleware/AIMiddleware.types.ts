import type { AIContext, AIContextInput, RiskLevel, VoiceId } from '../context/Context.types'
import type { PromptContract } from '../prompts/promptContracts/types'
import type { PromptAssemblyInput } from '../prompts/Prompt.types'
import type { LintResult } from '../linting/Lint.types'

export interface AIMiddlewareInput {
  contextInput: AIContextInput
  contract: PromptContract
  componentInstructions?: string
  userContent?: string
}

export interface AIMiddlewarePrepared {
  context: AIContext
  promptInput: PromptAssemblyInput
  effectiveRisk: RiskLevel
  voice: VoiceId
}

export interface AIMiddlewareFailure {
  stage: 'context' | 'contract' | 'content' | 'voice' | 'risk'
  message: string
  details?: string[]
}

export interface AIMiddlewarePreparedResult {
  ok: boolean
  data?: AIMiddlewarePrepared
  error?: AIMiddlewareFailure
}

export interface AIMiddlewareGenerateResult {
  ok: boolean
  data?: {
    prompt: string
    metadata: Record<string, unknown>
    response: string
    lint: LintResult
    context: AIContext
  }
  error?: AIMiddlewareFailure
}
