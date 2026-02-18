import { AIContext, AIContextInput } from './Context.types'

const DEFAULT_CONTEXT: AIContext = {
  location: 'Unknown',
  mode: 'builder',
  voice: 'boost',
  risk: 'low',
  userLevel: 'new'
}

// Resolves a safe context object. If anything critical is missing, returns null so callers can disable AI.
export function resolveAIContext(input: AIContextInput): AIContext | null {
  if (!input.componentId || !input.pageMode || !input.userLevel || !input.templateVoice || !input.riskLevel) {
    return null
  }

  return {
    location: input.componentId,
    mode: input.pageMode,
    voice: input.templateVoice,
    risk: input.riskLevel,
    userLevel: input.userLevel,
    templateVoice: input.templateVoice,
    metadata: input.metadata ?? {}
  }
}

// Convenience fallback to keep downstream consumers running in read-only mode.
export function resolveAIContextOrDefault(input: AIContextInput): AIContext {
  return resolveAIContext(input) ?? DEFAULT_CONTEXT
}
