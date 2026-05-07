import { resolveAIContextOrDefault } from '../context/AIContextResolver'
import type { AIRequestPipelineInput } from './types'

export function resolvePipelineContext(input: AIRequestPipelineInput) {
  return resolveAIContextOrDefault({
    componentId: input.componentId,
    pageMode: input.pageMode,
    userLevel: input.userLevel,
    templateVoice: input.voice,
    riskLevel: input.riskLevel,
    metadata: input.metadata,
  })
}
