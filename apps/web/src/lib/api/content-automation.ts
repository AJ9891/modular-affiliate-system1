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
