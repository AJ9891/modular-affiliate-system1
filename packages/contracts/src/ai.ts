import type { VoiceId } from './voice'

export interface AiPolicyAudit {
  policyFlags: string[]
  blocked: boolean
}

export interface AiDecisionEnvelope<TDecision = Record<string, unknown>> {
  decision: TDecision
  rationale: string
  confidence: number
  policyFlags: string[]
}

export interface AiRequestContext {
  userId: string
  workspaceId: string | null
  voiceId: VoiceId
  stage: string | null
  capabilities: Record<string, boolean | number | string>
}

export interface AiResponseEnvelope<TDecision = Record<string, unknown>> {
  output: AiDecisionEnvelope<TDecision>
  audit: AiPolicyAudit
  promptVersion: string
  model: string
}
