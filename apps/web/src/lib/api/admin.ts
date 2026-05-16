import { api } from './client'

export interface AdminOverview {
  totalUsers: number
  totalFunnels: number
  totalRevenue: number
  totalClicks: number
  totalConversions: number
}

export interface AdminUserRecord {
  id: string
  email: string
  role?: string
  is_admin?: boolean
  created_at?: string
  subscription_plan?: string
  plan?: string
}

export interface AdminAnalyticsTotals {
  provider: string
  total_cost: number
  requests: number
}

export type BetaTesterStatus = 'prospect' | 'invited' | 'active' | 'paused'

export interface BetaTesterRecord {
  id: string
  email: string
  full_name: string | null
  company: string | null
  status: BetaTesterStatus
  notes: string | null
  invited_at: string | null
  invite_token: string | null
  invite_sent_at: string | null
  invite_accepted_at: string | null
  accepted_user_id: string | null
  invite_url?: string | null
  created_by: string | null
  created_at: string
  updated_at: string
}

export interface CreateBetaTesterInput {
  email: string
  full_name?: string
  company?: string
  notes?: string
  status?: BetaTesterStatus
}

export interface UpdateBetaTesterInput {
  id: string
  full_name?: string
  company?: string
  notes?: string
  status?: BetaTesterStatus
  resend_invite?: boolean
}

export async function getAdminOverview(): Promise<AdminOverview> {
  return api.get<AdminOverview>('/api/admin/overview')
}

export async function getAdminUsers(): Promise<AdminUserRecord[]> {
  const payload = await api.get<{ users?: AdminUserRecord[] }>('/api/admin/users')
  return payload.users || []
}

export async function getAdminProviderTotals(): Promise<AdminAnalyticsTotals[]> {
  const payload = await api.get<{ totals?: AdminAnalyticsTotals[] }>('/api/admin/analytics')
  return payload.totals || []
}

export async function getBetaTesters(): Promise<BetaTesterRecord[]> {
  const payload = await api.get<{ testers?: BetaTesterRecord[] }>('/api/admin/beta-testers')
  return payload.testers || []
}

export async function createBetaTester(input: CreateBetaTesterInput): Promise<BetaTesterRecord> {
  const payload = await api.post<{ tester: BetaTesterRecord }>('/api/admin/beta-testers', input)
  return payload.tester
}

export async function updateBetaTester(input: UpdateBetaTesterInput): Promise<BetaTesterRecord> {
  const payload = await api.patch<{ tester: BetaTesterRecord }>('/api/admin/beta-testers', input)
  return payload.tester
}

export async function deleteBetaTester(id: string): Promise<void> {
  await api.remove<{ success: boolean }>(`/api/admin/beta-testers?id=${encodeURIComponent(id)}`)
}
