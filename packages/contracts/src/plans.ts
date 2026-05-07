export const PLAN_IDS = ['free', 'starter', 'pro', 'agency'] as const
export type PlanId = (typeof PLAN_IDS)[number]

export const PAID_PLAN_IDS = ['starter', 'pro', 'agency'] as const
export type PaidPlanId = (typeof PAID_PLAN_IDS)[number]

export function isPlanId(value: unknown): value is PlanId {
  return typeof value === 'string' && (PLAN_IDS as readonly string[]).includes(value)
}

export function isPaidPlanId(value: unknown): value is PaidPlanId {
  return typeof value === 'string' && (PAID_PLAN_IDS as readonly string[]).includes(value)
}
