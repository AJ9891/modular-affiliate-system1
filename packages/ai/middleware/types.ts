import type { AIContext } from '../context/Context.types'

export interface TemplateConstraintSet {
  maxClaims: number
  bannedPhrases: string[]
}

export interface OnboardingRuntimeState {
  currentStage: string
  completedSteps: string[]
}

export interface MiddlewareEnvelope {
  prompt: string
  context: AIContext
  metadata: Record<string, unknown>
  templateConstraints?: TemplateConstraintSet
  onboardingState?: OnboardingRuntimeState
}
