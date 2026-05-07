export type PreflightStepId =
  | 'intent'
  | 'audience'
  | 'offer'
  | 'tracking'
  | 'publish-readiness'

export type PreflightStepStatus = 'locked' | 'ready' | 'complete' | 'blocked'

export type ReadinessLevel = 'not-ready' | 'needs-attention' | 'ready'

export interface PreflightStep {
  id: PreflightStepId
  title: string
  description: string
  required: boolean
}

export interface PreflightState {
  completedSteps: PreflightStepId[]
  blockers: string[]
  selectedIntent?: string
  selectedAudience?: string
  selectedOfferId?: string
  trackingConnected: boolean
}

export interface PreflightStepView extends PreflightStep {
  status: PreflightStepStatus
}

export interface CockpitShellSection {
  id: 'mission' | 'guidance' | 'progress' | 'actions'
  title: string
  description: string
}

export interface BoostGuidanceInput {
  stepId: PreflightStepId
  userLevel: 'new' | 'active' | 'advanced'
  blockers: string[]
}

export interface BoostGuidanceOutput {
  voice: 'boost'
  summary: string
  nextAction: string
  explanation: string
}

export interface ContextualExplanation {
  key: string
  title: string
  body: string
}
