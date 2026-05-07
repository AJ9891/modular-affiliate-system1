import { type BoostGuidanceInput, type BoostGuidanceOutput, type PreflightStepId } from './types'

const stepActionMap: Record<PreflightStepId, string> = {
  intent: 'Select one campaign intent and lock it before editing funnel blocks.',
  audience: 'Choose a target audience segment and define one clear pain point.',
  offer: 'Attach one offer and verify destination URL and payout assumptions.',
  tracking: 'Connect tracking keys and verify a sample click event appears.',
  'publish-readiness': 'Run final checks and confirm launch criteria are satisfied.',
}

export function buildBoostGuidance(input: BoostGuidanceInput): BoostGuidanceOutput {
  const blockers = input.blockers.length
    ? `Current blockers: ${input.blockers.join('; ')}.`
    : 'No blockers detected for this step.'

  return {
    voice: 'boost',
    summary: `Preflight step "${input.stepId}" is active. ${blockers}`,
    nextAction: stepActionMap[input.stepId],
    explanation:
      'Boost guidance stays explanatory and grounded: one decision at a time, one clear next action.',
  }
}

export function isBoostOnlyOnboardingVoice(voice: string): boolean {
  return voice === 'boost'
}
