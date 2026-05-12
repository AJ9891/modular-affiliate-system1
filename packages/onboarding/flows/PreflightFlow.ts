import { PREFLIGHT_COPY } from '../copy/preflight.copy'
import { PREFLIGHT_MOTION } from '../motion/preflight.motion'
import { PREFLIGHT_STEPS, type PreflightStepId } from '../steps/types'

export interface PreflightFlowState {
  currentStep: PreflightStepId
  completedSteps: PreflightStepId[]
}

export interface PreflightStepRuntime {
  id: PreflightStepId
  completed: boolean
  title: string
  primaryActionLabel: string
  momentumHint: string
  transition: string
}

export function buildPreflightFlow(state: PreflightFlowState): PreflightStepRuntime[] {
  return PREFLIGHT_STEPS.map((stepId) => {
    const stepCopy = PREFLIGHT_COPY[stepId]
    const stepMotion = PREFLIGHT_MOTION.find((motion) => motion.stepId === stepId)

    return {
      id: stepId,
      completed: state.completedSteps.includes(stepId),
      title: stepCopy.title,
      primaryActionLabel: stepCopy.primaryActionLabel,
      momentumHint: stepCopy.momentumHint,
      transition: stepMotion?.transition ?? 'fade-up',
    }
  })
}

export function getNextPreflightStep(state: PreflightFlowState): PreflightStepId | null {
  for (const stepId of PREFLIGHT_STEPS) {
    if (!state.completedSteps.includes(stepId)) {
      return stepId
    }
  }

  return null
}
