import { resolveAIContextOrDefault } from '../context/AIContextResolver'
import type { AIContextInput } from '../context/Context.types'
import type { MiddlewareEnvelope } from './types'

export function injectContext(prompt: string, input: AIContextInput): MiddlewareEnvelope {
  return {
    prompt,
    context: resolveAIContextOrDefault(input),
    metadata: {},
  }
}
