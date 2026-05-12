import type { PreflightStep, PreflightStepId } from '../steps/types'

export const PREFLIGHT_COPY: Record<PreflightStepId, PreflightStep> = {
  welcome: {
    id: 'welcome',
    title: 'Welcome aboard',
    primaryActionLabel: 'Start preflight',
    momentumHint: 'You are one click away from motion.',
  },
  destination_selection: {
    id: 'destination_selection',
    title: 'Pick your destination',
    primaryActionLabel: 'Set destination',
    momentumHint: 'Choose the result you want first.',
  },
  funnel_type: {
    id: 'funnel_type',
    title: 'Choose funnel type',
    primaryActionLabel: 'Select funnel',
    momentumHint: 'Match structure to your mission.',
  },
  first_launch: {
    id: 'first_launch',
    title: 'Prepare first launch',
    primaryActionLabel: 'Launch now',
    momentumHint: 'Ship an initial version before polishing.',
  },
  cockpit_reveal: {
    id: 'cockpit_reveal',
    title: 'Cockpit unlocked',
    primaryActionLabel: 'Enter cockpit',
    momentumHint: 'You are live. Iterate from instrumentation.',
  },
}
