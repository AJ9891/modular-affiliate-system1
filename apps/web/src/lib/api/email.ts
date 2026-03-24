import { api } from './client'

export type EmailPersonality = 'rocket' | 'glitch' | 'anchor'

export interface EmailTemplate {
  id?: string
  name: string
  subject: string
  html?: string
  text?: string
  preheader?: string
  personality?: EmailPersonality
  source?: 'local' | 'remote'
}

interface EmailTemplatesResponse {
  success?: boolean
  templates?: EmailTemplate[]
}

interface SendCampaignInput {
  name: string
  subject: string
  html: string
  recipients: Array<{ email: string; name?: string }>
}

export async function getEmailTemplates(): Promise<EmailTemplate[]> {
  const payload = await api.get<EmailTemplatesResponse>('/api/email/templates')
  return payload.templates || []
}

export async function saveEmailTemplate(template: EmailTemplate): Promise<EmailTemplate> {
  const payload = await api.post<{ template?: EmailTemplate }>('/api/email/templates', template)
  if (!payload.template) {
    throw new Error('Template save failed')
  }
  return payload.template
}

export async function createAutomation(payload: Record<string, unknown>): Promise<void> {
  await api.post('/api/email/automation', payload)
}

export async function setupDefaultAutomations(): Promise<void> {
  await api.put('/api/email/automation')
}

export async function createCampaignDraft(input: SendCampaignInput): Promise<void> {
  await api.post('/api/email/send', {
    type: 'campaign',
    name: input.name,
    subject: input.subject,
    html: input.html,
    recipients: input.recipients,
  })
}
