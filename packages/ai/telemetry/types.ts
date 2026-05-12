export interface CalmInsight {
  whatChanged: string
  whyItMatters: string
  nextStep: string
}

export interface AIFlightTelemetryEvent {
  name: 'ai.validation' | 'ai.generation' | 'ai.decision'
  timestamp: string
  promptVersion: string
  model: string
  blocked: boolean
  policyFlags: string[]
  calmInsight: CalmInsight
  metadata?: Record<string, unknown>
}

export interface TelemetrySink {
  emit: (event: AIFlightTelemetryEvent) => void
}
