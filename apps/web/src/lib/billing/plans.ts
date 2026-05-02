export const PLAN_MONTHLY_PRICE_USD = {
  starter: 29,
  pro: 79,
  agency: 199,
} as const

export type BillingPlan = keyof typeof PLAN_MONTHLY_PRICE_USD

export type BillingCycle = 'monthly' | 'annual'

export const ANNUAL_DISCOUNT_PERCENT = 20
export const ANNUAL_DISCOUNT_MULTIPLIER = (100 - ANNUAL_DISCOUNT_PERCENT) / 100

export function getPlanAmountUsd(plan: BillingPlan, cycle: BillingCycle = 'monthly') {
  const monthly = PLAN_MONTHLY_PRICE_USD[plan]
  if (cycle === 'monthly') return monthly
  return monthly * 12 * ANNUAL_DISCOUNT_MULTIPLIER
}

export function getExpectedPlanAmountCents(plan: BillingPlan, cycle: BillingCycle = 'monthly') {
  return Math.round(getPlanAmountUsd(plan, cycle) * 100)
}
