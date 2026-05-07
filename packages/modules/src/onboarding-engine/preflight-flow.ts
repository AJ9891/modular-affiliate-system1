import {
  type PreflightState,
  type PreflightStep,
  type PreflightStepId,
  type PreflightStepView,
  type ReadinessLevel,
} from './types'

export const preflightSteps: PreflightStep[] = [
  {
    id: 'intent',
    title: 'Define Intent',
    description: 'Select the campaign objective before any copy or layout decisions.',
    required: true,
  },
  {
    id: 'audience',
    title: 'Confirm Audience',
    description: 'Set audience profile so templates and offers stay aligned.',
    required: true,
  },
  {
    id: 'offer',
    title: 'Attach Offer',
    description: 'Choose the offer that the funnel will promote and track.',
    required: true,
  },
  {
    id: 'tracking',
    title: 'Connect Tracking',
    description: 'Enable click and conversion tracking before launch.',
    required: true,
  },
  {
    id: 'publish-readiness',
    title: 'Publish Readiness',
    description: 'Run final preflight checks before publishing.',
    required: true,
  },
]

export function getPreflightStepViews(state: PreflightState): PreflightStepView[] {
  return preflightSteps.map((step, index) => {
    if (state.completedSteps.includes(step.id)) {
      return { ...step, status: 'complete' }
    }

    if (state.blockers.length > 0 && isCurrentStep(index, state)) {
      return { ...step, status: 'blocked' }
    }

    if (isUnlockedStep(index, state.completedSteps.length)) {
      return { ...step, status: 'ready' }
    }

    return { ...step, status: 'locked' }
  })
}

export function getNextPreflightStep(state: PreflightState): PreflightStepId | null {
  const next = preflightSteps.find((step) => !state.completedSteps.includes(step.id))
  return next ? next.id : null
}

export function getPreflightReadiness(state: PreflightState): ReadinessLevel {
  if (state.blockers.length > 0) return 'needs-attention'
  if (state.completedSteps.length === preflightSteps.length) return 'ready'
  return 'not-ready'
}

function isCurrentStep(index: number, state: PreflightState): boolean {
  return index === state.completedSteps.length
}

function isUnlockedStep(index: number, completedCount: number): boolean {
  return index <= completedCount
}
