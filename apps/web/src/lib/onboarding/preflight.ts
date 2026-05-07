export const PREFLIGHT_TOTAL_STEPS = 4
export const LAUNCHPAD_TOTAL_STEPS = 6
export const ONBOARDING_COMPLETE_STEP = 8
export const MIN_LAUNCHPAD_STEP = 2

export const PREFLIGHT_STEP_IDS = [
  'identity',
  'intent',
  'campaign',
  'ready',
] as const

export const ONBOARDING_INTENTS = [
  'create-funnel',
  'import-traffic',
  'setup-email',
] as const

export type PreflightStepId = (typeof PREFLIGHT_STEP_IDS)[number]
export type OnboardingIntent = (typeof ONBOARDING_INTENTS)[number]

export type PreflightChecklist = Record<PreflightStepId, boolean>

export interface PreflightState {
  currentStep: number
  launchpadStep: number
  intent: OnboardingIntent | null
  campaignName: string
  checklist: PreflightChecklist
  preflightComplete: boolean
  onboardingSeen: boolean
  onboardingStep: number
  onboardingComplete: boolean
  launchpadStage: number | null
  updatedAt: string | null
}

export function defaultPreflightChecklist(): PreflightChecklist {
  return {
    identity: false,
    intent: false,
    campaign: false,
    ready: false,
  }
}

export function createDefaultPreflightState(): PreflightState {
  return {
    currentStep: 1,
    launchpadStep: 0,
    intent: null,
    campaignName: '',
    checklist: defaultPreflightChecklist(),
    preflightComplete: false,
    onboardingSeen: false,
    onboardingStep: 0,
    onboardingComplete: false,
    launchpadStage: null,
    updatedAt: null,
  }
}

export function clampPreflightStep(value: number): number {
  if (!Number.isFinite(value)) return 1
  return Math.min(PREFLIGHT_TOTAL_STEPS, Math.max(1, Math.floor(value)))
}

export function clampLaunchpadStep(value: number): number {
  if (!Number.isFinite(value)) return 0
  return Math.min(LAUNCHPAD_TOTAL_STEPS - 1, Math.max(0, Math.floor(value)))
}

export function launchpadStepToOnboardingStep(launchpadStep: number): number {
  return Math.min(ONBOARDING_COMPLETE_STEP - 1, MIN_LAUNCHPAD_STEP + clampLaunchpadStep(launchpadStep))
}

export function isOnboardingIntent(value: unknown): value is OnboardingIntent {
  return typeof value === 'string' && (ONBOARDING_INTENTS as readonly string[]).includes(value)
}

export function sanitizeCampaignName(value: unknown): string {
  if (typeof value !== 'string') return ''
  return value.trim().slice(0, 80)
}
