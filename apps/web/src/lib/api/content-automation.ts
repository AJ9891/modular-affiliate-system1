import { api } from './client'

export interface GeneratedContentPayload {
  title: string
  slug: string
  article: {
    metaTitle: string
    metaDescription: string
    markdown: string
  }
  funnel: {
    headline: string
    subheadline: string
    cta: string
    blocks: Array<Record<string, unknown>>
  }
  emails: Array<{
    subject: string
    preview: string
    body: string
    cta: string
  }>
}

export interface ContentScheduleItem {
  id: string
  title: string
  run_at: string
  status: 'queued' | 'published' | 'failed' | 'cancelled'
  content_type: string
  content_payload: Record<string, unknown>
  created_at: string
}

export interface CmsIntegrationItem {
  id: string
  provider: string
  target_url: string
  auth_type: string
  is_active: boolean
  created_at: string
}

export async function generateContent(input: {
  sourceUrl?: string
  keyword?: string
  tone?: 'professional' | 'casual' | 'urgent' | 'friendly'
  audienceHint?: string
  nicheHint?: string
  persist?: boolean
}) {
  return api.post<{ success: boolean; content: GeneratedContentPayload; saved: { funnelId: string | null }; warnings: string[] }>(
    '/api/content/generate',
    input
  )
}

export type CampaignIngestionStatus =
  | 'success'
  | 'login_required'
  | 'blocked'
  | 'timeout'
  | 'unreadable'
  | 'not_provided'

export interface CampaignBuildResponse {
  success: boolean
  ingestion: {
    status: CampaignIngestionStatus
    sourceUrl?: string
    message: string
  }
  content: GeneratedContentPayload
  saved: {
    campaignId: string
    campaignStatus: 'draft'
    funnelId: string | null
    savedAt: string
  }
  warnings: string[]
  phases: string[]
}

export async function buildCampaign(input: {
  sourceUrl?: string
  productDescription?: string
  goal: 'sales' | 'leads' | 'traffic' | 'promotion'
  keyword: string
  tone: 'professional' | 'casual' | 'urgent' | 'friendly'
}) {
  return api.post<CampaignBuildResponse>('/api/content/campaign', input)
}

export interface CampaignDraftSummary {
  campaign_id: string
  funnel_id: string | null
  status: 'draft' | 'published' | 'archived'
  title: string
  goal: 'sales' | 'leads' | 'traffic' | 'promotion'
  tone: 'professional' | 'casual' | 'urgent' | 'friendly'
  source_url: string | null
  keyword: string
  ingestion: CampaignBuildResponse['ingestion']
  created_at: string
  updated_at: string
}

export async function listCampaignDrafts() {
  return api.get<{ success: boolean; campaigns: CampaignDraftSummary[] }>('/api/content/campaign')
}

export type CampaignSection = 'funnel' | 'article' | 'emails'

export async function updateCampaignDraft(campaignId: string, content: GeneratedContentPayload) {
  return api.patch<{
    success: boolean
    campaign: { campaign_id: string; status: 'draft' | 'published' | 'archived'; updated_at: string }
    content: GeneratedContentPayload
  }>(`/api/content/campaign/${campaignId}`, { content })
}

export async function regenerateCampaignSection(campaignId: string, section: CampaignSection) {
  return api.post<{
    success: boolean
    section: CampaignSection
    content: GeneratedContentPayload
    savedAt: string
  }>(`/api/content/campaign/${campaignId}`, { section })
}

export interface CampaignPublishResponse {
  success: boolean
  mode: 'now' | 'schedule'
  message: string
  publicPath?: string
  funnel?: { funnel_id: string; slug: string; status: 'published' }
  schedule?: { id: string; run_at: string; status: 'queued' }
}

export async function publishCampaign(
  campaignId: string,
  input: { mode: 'now' } | { mode: 'schedule'; runAt: string }
) {
  return api.post<CampaignPublishResponse>(`/api/content/campaign/${campaignId}/publish`, input)
}

export async function lookupGoogleKeywords(input: {
  query: string
  locale?: string
  projectName?: string
}) {
  return api.post<{
    success: boolean
    project: { id: string; name: string; locale: string }
    keywords: Array<{ keyword: string; source: string }>
  }>('/api/integrations/google/keywords', input)
}

export async function listKeywordProjects() {
  return api.get<{
    success: boolean
    projects: Array<{ id: string; name: string; seed_query: string; locale: string; created_at: string }>
  }>('/api/integrations/google/keywords')
}

export async function saveCmsIntegration(input: {
  provider: string
  targetUrl: string
  authType?: 'none' | 'bearer' | 'basic' | 'header'
  authValue?: string
  isActive?: boolean
  config?: Record<string, unknown>
}) {
  return api.post<{ success: boolean; integration: CmsIntegrationItem }>('/api/integrations/cms', input)
}

export async function listCmsIntegrations() {
  return api.get<{ success: boolean; integrations: CmsIntegrationItem[] }>('/api/integrations/cms')
}

export async function createPublishSchedule(input: {
  title: string
  runAt: string
  funnelId?: string
  content: {
    type: 'article_and_funnel' | 'article_only' | 'funnel_only'
    payload: Record<string, unknown>
  }
}) {
  return api.post<{ success: boolean; schedule: ContentScheduleItem }>('/api/publish/schedule', input)
}

export async function listPublishSchedules() {
  return api.get<{ success: boolean; schedules: ContentScheduleItem[] }>('/api/publish/schedule')
}
