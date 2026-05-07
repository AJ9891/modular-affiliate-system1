export const ONBOARDING_STAGES = [
  'preflight',
  'identity',
  'offer-setup',
  'funnel-setup',
  'activation',
  'complete',
] as const

export type OnboardingStage = (typeof ONBOARDING_STAGES)[number]

export interface OnboardingState {
  userId: string
  currentStage: OnboardingStage
  completedSteps: string[]
  updatedAt: string
  workspaceContext?: string | null
  lastError?: string | null
}
