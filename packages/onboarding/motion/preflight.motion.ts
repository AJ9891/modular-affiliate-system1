import type { PreflightStepId } from '../steps/types'

export interface MotionCue {
  stepId: PreflightStepId
  transition: 'slide-forward' | 'fade-up' | 'reveal-panel'
  durationMs: number
}

export const PREFLIGHT_MOTION: MotionCue[] = [
  { stepId: 'welcome', transition: 'fade-up', durationMs: 220 },
  { stepId: 'destination_selection', transition: 'slide-forward', durationMs: 260 },
  { stepId: 'funnel_type', transition: 'slide-forward', durationMs: 260 },
  { stepId: 'first_launch', transition: 'reveal-panel', durationMs: 300 },
  { stepId: 'cockpit_reveal', transition: 'reveal-panel', durationMs: 320 },
]
