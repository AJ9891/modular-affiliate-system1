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

export const CURRENT_WORKFLOW_VERSION = 3 as const

export const LAUNCHPAD_WORKFLOW_STEPS = [
  { id: 'ground-control', order: 1 },
  { id: 'preflight', order: 2 },
  { id: 'building', order: 3 },
  { id: 'offer-setup', order: 4 },
  { id: 'email-setup', order: 5 },
  { id: 'launch-checks', order: 6 },
  { id: 'ready-to-publish', order: 7 },
  { id: 'live', order: 8 },
] as const

export const ALLOWED_WORKFLOW_TRANSITIONS = {
  'ground-control': ['preflight'],
  preflight: ['building'],
  building: ['offer-setup'],
  'offer-setup': ['email-setup'],
  'email-setup': ['launch-checks'],
  'launch-checks': ['ready-to-publish'],
  'ready-to-publish': ['live'],
  live: [],
} as const
