import { resolveAIContextOrDefault } from '../context/AIContextResolver'
import type { AIContext, AIContextInput, ComponentId, PageMode, RiskLevel, UserLevel, VoiceId } from '../context/Context.types'

export interface MiddlewareContextInput {
  componentId: ComponentId
  pageMode: PageMode
  userLevel: UserLevel
  voice: VoiceId
  riskLevel: RiskLevel
  metadata?: Record<string, unknown>
}

export function resolveMiddlewareContext(input: MiddlewareContextInput): AIContext {
  const contextInput: AIContextInput = {
    componentId: input.componentId,
    pageMode: input.pageMode,
    userLevel: input.userLevel,
    templateVoice: input.voice,
    riskLevel: input.riskLevel,
    metadata: input.metadata,
  }

  return resolveAIContextOrDefault(contextInput)
}
