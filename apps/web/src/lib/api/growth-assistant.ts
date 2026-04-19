import { api } from './client'
import type {
  FunnelPerformanceScore,
  GrowthAlert,
  GrowthInsight,
  GrowthRange,
  GrowthRecommendation,
} from '@/lib/growth-assistant/types'

type InsightsResponse = {
  insights?: GrowthInsight[]
  funnelScores?: FunnelPerformanceScore[]
}

type RecommendationsResponse = {
  recommendations?: GrowthRecommendation[]
}

type AlertsResponse = {
  alerts?: GrowthAlert[]
}

export async function getInsights(params?: {
  range?: GrowthRange
  funnelId?: string
  limit?: number
}): Promise<GrowthInsight[]> {
  const search = new URLSearchParams()
  if (params?.range) search.set('range', params.range)
  if (params?.funnelId) search.set('funnelId', params.funnelId)
  if (params?.limit) search.set('limit', String(params.limit))
  const suffix = search.toString() ? `?${search.toString()}` : ''
  const payload = await api.get<InsightsResponse>(`/api/insights${suffix}`)
  return payload.insights || []
}

export async function getGrowthSnapshot(params?: {
  range?: GrowthRange
  funnelId?: string
  limit?: number
}): Promise<{ insights: GrowthInsight[]; funnelScores: FunnelPerformanceScore[] }> {
  const search = new URLSearchParams()
  if (params?.range) search.set('range', params.range)
  if (params?.funnelId) search.set('funnelId', params.funnelId)
  if (params?.limit) search.set('limit', String(params.limit))
  const suffix = search.toString() ? `?${search.toString()}` : ''
  const payload = await api.get<InsightsResponse>(`/api/insights${suffix}`)
  return {
    insights: payload.insights || [],
    funnelScores: payload.funnelScores || [],
  }
}

export async function getRecommendations(params?: {
  range?: GrowthRange
  funnelId?: string
  status?: 'open' | 'applied' | 'dismissed' | 'archived'
  limit?: number
}): Promise<GrowthRecommendation[]> {
  const search = new URLSearchParams()
  if (params?.range) search.set('range', params.range)
  if (params?.funnelId) search.set('funnelId', params.funnelId)
  if (params?.status) search.set('status', params.status)
  if (params?.limit) search.set('limit', String(params.limit))
  const suffix = search.toString() ? `?${search.toString()}` : ''
  const payload = await api.get<RecommendationsResponse>(`/api/recommendations${suffix}`)
  return payload.recommendations || []
}

export async function getAlerts(params?: {
  range?: GrowthRange
  funnelId?: string
  state?: 'active' | 'resolved' | 'ignored'
  severity?: 'low' | 'medium' | 'high' | 'critical'
  limit?: number
}): Promise<GrowthAlert[]> {
  const search = new URLSearchParams()
  if (params?.range) search.set('range', params.range)
  if (params?.funnelId) search.set('funnelId', params.funnelId)
  if (params?.state) search.set('state', params.state)
  if (params?.severity) search.set('severity', params.severity)
  if (params?.limit) search.set('limit', String(params.limit))
  const suffix = search.toString() ? `?${search.toString()}` : ''
  const payload = await api.get<AlertsResponse>(`/api/alerts${suffix}`)
  return payload.alerts || []
}

export async function processGrowthAssistant(params?: {
  range?: GrowthRange
  funnelId?: string
}): Promise<{ success: boolean; counts?: Record<string, number> }> {
  return api.post('/api/growth/process', params || {})
}

export type { FunnelPerformanceScore }
