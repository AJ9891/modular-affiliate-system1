import { ALL_TEMPLATES, type BrandVoice, type FunnelTemplate, type TemplateCategory } from '@/config/funnelTemplates'
import { api } from './client'
import { getEmailTemplates, type EmailTemplate } from './email'

export interface TemplateGallery {
  landingTemplates: FunnelTemplate[]
  emailTemplates: EmailTemplate[]
}

export interface TemplateQuery {
  id?: string
  brandVoice?: BrandVoice
  category?: TemplateCategory
}

interface FunnelTemplatesResponse {
  templates?: FunnelTemplate[]
}

function toTemplateQueryString(query: TemplateQuery = {}): string {
  const params = new URLSearchParams()

  if (query.id) params.set('id', query.id)
  if (query.brandVoice) params.set('brandVoice', query.brandVoice)
  if (query.category) params.set('category', query.category)

  const raw = params.toString()
  return raw ? `?${raw}` : ''
}

export async function getLandingTemplates(query: TemplateQuery = {}): Promise<FunnelTemplate[]> {
  try {
    const queryString = toTemplateQueryString(query)
    const payload = await api.get<FunnelTemplatesResponse>(`/api/funnels/templates${queryString}`)
    return payload.templates || []
  } catch {
    return ALL_TEMPLATES.filter((template) => {
      const idMatch = !query.id || template.id === query.id
      const voiceMatch = !query.brandVoice || template.brandVoice === query.brandVoice
      const categoryMatch = !query.category || template.category === query.category
      return idMatch && voiceMatch && categoryMatch
    })
  }
}

export async function getTemplateGallery(query: TemplateQuery = {}): Promise<TemplateGallery> {
  const emailTemplates = await getEmailTemplates().catch(() => [])
  const landingTemplates = await getLandingTemplates(query)

  return {
    landingTemplates,
    emailTemplates,
  }
}
