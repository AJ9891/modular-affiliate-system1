import type { MiddlewareEnvelope, OnboardingRuntimeState } from './types'

export function injectOnboardingState(
  envelope: MiddlewareEnvelope,
  onboardingState: OnboardingRuntimeState,
): MiddlewareEnvelope {
  return {
    ...envelope,
    onboardingState,
    metadata: {
      ...envelope.metadata,
      onboarding_stage: onboardingState.currentStage,
      onboarding_completed_steps: onboardingState.completedSteps,
    },
  }
}
