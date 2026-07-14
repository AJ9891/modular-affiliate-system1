export const PLANS = {
  FREE: 'free',
  STARTER: 'starter',
  PRO: 'pro',
  AGENCY: 'agency',
} as const

export const PLAN_LIMITS = {
  free: 0,
  starter: 1,
  pro: 20,
  agency: 60,
} as const

export const LAUNCHPAD_STAGES = {
  GROUND_CONTROL: 1,
  PRE_FLIGHT: 2,
  IGNITION: 3,
  LIFT_OFF: 4,
} as const
