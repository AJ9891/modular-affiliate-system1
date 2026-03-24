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
