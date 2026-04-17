export const PLAN_MONTHLY_PRICE_USD = {
  starter: 30,
  pro: 45,
  agency: 60,
} as const

export type BillingPlan = keyof typeof PLAN_MONTHLY_PRICE_USD

export function getExpectedPlanAmountCents(plan: BillingPlan) {
  return PLAN_MONTHLY_PRICE_USD[plan] * 100
}

