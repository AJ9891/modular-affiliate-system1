import { api } from './client'
import { isPlanId, type PlanId } from '@contracts/plans'

export interface CurrentUser {
  id: string
  email?: string
  user_metadata?: {
    full_name?: string
    [key: string]: unknown
  }
  app_metadata?: Record<string, unknown>
  created_at?: string
}

export interface PlanSettings {
  plan?: UserPlan
  launchpad_stage?: string
}

export type UserPlan = PlanId

export interface StripeConnectStatus {
  connected: boolean
  onboardingComplete: boolean
  chargesEnabled: boolean
  payoutsEnabled: boolean
  accountId?: string
}

export async function getCurrentUser(): Promise<CurrentUser> {
  const payload = await api.get<{ user?: CurrentUser }>('/api/auth/me')
  if (!payload.user) {
    throw new Error('User not authenticated')
  }
  return payload.user
}

export async function getPlanSettings(): Promise<PlanSettings> {
  const payload = await api.get<{ plan?: string; launchpad_stage?: string }>('/api/profile/plan')
  const plan = payload.plan
  const safePlan: UserPlan | undefined = isPlanId(plan) ? plan : undefined

  return {
    plan: safePlan,
    launchpad_stage: payload.launchpad_stage,
  }
}

export async function updatePlan(plan: UserPlan): Promise<void> {
  await api.post('/api/profile/plan', { plan })
}

export async function getStripeConnectStatus(): Promise<StripeConnectStatus> {
  return api.get<StripeConnectStatus>('/api/stripe/connect/status')
}

export async function createBillingPortalSession(customerId: string): Promise<string> {
  const payload = await api.post<{ url?: string }>('/api/stripe/create-portal-session', { customerId })
  if (!payload.url) {
    throw new Error('Billing portal unavailable')
  }
  return payload.url
}
