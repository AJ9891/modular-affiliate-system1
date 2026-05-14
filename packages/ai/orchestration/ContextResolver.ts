import { resolveMiddlewareContext } from '../middleware/ContextResolver'
import type { AIRequestPipelineInput } from './types'

export function resolvePipelineContext(input: AIRequestPipelineInput) {
  return resolveMiddlewareContext({
    componentId: input.componentId,
    pageMode: input.pageMode,
    userLevel: input.userLevel,
    voice: input.voice,
    riskLevel: input.riskLevel,
    metadata: input.metadata,
  })
}
