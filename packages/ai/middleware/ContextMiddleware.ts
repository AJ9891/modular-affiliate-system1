import { resolveMiddlewareContext } from './ContextResolver'
import type { AIContextInput } from '../context/Context.types'
import type { MiddlewareEnvelope } from './types'

export function injectContext(prompt: string, input: AIContextInput): MiddlewareEnvelope {
  const componentId = input.componentId ?? 'Unknown'
  const pageMode = input.pageMode ?? 'builder'
  const userLevel = input.userLevel ?? 'new'
  const voice = input.templateVoice ?? 'boost'
  const riskLevel = input.riskLevel ?? 'low'

  return {
    prompt,
    context: resolveMiddlewareContext({
      componentId,
      pageMode,
      userLevel,
      voice,
      riskLevel,
      metadata: input.metadata,
    }),
    metadata: {},
  }
}
