import { api } from './client'

export interface SubscriberLead {
  id: string
  email: string
  source?: string
  funnel_id?: string
  utm_source?: string
  utm_medium?: string
  utm_campaign?: string
  created_at: string
  converted?: boolean
  revenue?: number
}

interface LeadsResponse {
  success?: boolean
  leads?: SubscriberLead[]
}

export async function listSubscribers(limit = 200): Promise<SubscriberLead[]> {
  const payload = await api.get<LeadsResponse>(`/api/leads/capture?limit=${limit}`)
  return payload.leads || []
}
