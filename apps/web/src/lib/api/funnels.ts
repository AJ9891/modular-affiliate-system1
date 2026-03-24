import { api } from './client'

export interface FunnelBlocks {
  template?: string
  niche?: string
  theme?: Record<string, unknown>
  blocks?: Array<Record<string, unknown>>
}

export interface FunnelRecord {
  funnel_id: string
  name: string
  slug: string
  user_id?: string
  status?: string
  active?: boolean
  blocks?: FunnelBlocks | string
  created_at?: string
  updated_at?: string
}

export interface CreateFunnelInput {
  name: string
  template?: string
  niche?: string
  slug?: string
  blocks?: Array<Record<string, unknown>>
  theme?: Record<string, unknown>
}

interface ListFunnelsResponse {
  funnels?: FunnelRecord[]
}

interface FunnelResponse {
  funnel?: FunnelRecord
}

interface CreateFunnelResponse {
  funnel?: FunnelRecord
  funnelId?: string
  slug?: string
}

export async function listFunnels(): Promise<FunnelRecord[]> {
  const payload = await api.get<ListFunnelsResponse>('/api/funnels')
  return payload.funnels || []
}

export async function getFunnelById(id: string): Promise<FunnelRecord> {
  const payload = await api.get<FunnelResponse>(`/api/funnels/${id}`)
  if (!payload.funnel) {
    throw new Error('Funnel not found')
  }
  return payload.funnel
}

export async function createFunnel(input: CreateFunnelInput): Promise<CreateFunnelResponse> {
  return api.post<CreateFunnelResponse>('/api/funnels', input)
}

export async function updateFunnel(id: string, updates: Partial<FunnelRecord>): Promise<FunnelRecord> {
  const payload = await api.put<FunnelResponse>(`/api/funnels/${id}`, updates)
  if (!payload.funnel) {
    throw new Error('Failed to update funnel')
  }
  return payload.funnel
}

export async function deleteFunnel(id: string): Promise<void> {
  await api.remove<{ message: string }>(`/api/funnels/${id}`)
}
