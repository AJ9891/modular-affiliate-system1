export const PREFLIGHT_STEPS = [
  'welcome',
  'destination_selection',
  'funnel_type',
  'first_launch',
  'cockpit_reveal',
] as const

export type PreflightStepId = (typeof PREFLIGHT_STEPS)[number]

export interface PreflightStep {
  id: PreflightStepId
  title: string
  primaryActionLabel: string
  momentumHint: string
}
