export interface AiDecisionEnvelope<TDecision = Record<string, unknown>> {
  decision: TDecision
  rationale: string
  confidence: number
  policyFlags: string[]
}
