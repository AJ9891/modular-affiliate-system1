import { ALL_TEMPLATES, type FunnelTemplate } from '@/config/funnelTemplates'
import { getEmailTemplates, type EmailTemplate } from './email'

export interface TemplateGallery {
  landingTemplates: FunnelTemplate[]
  emailTemplates: EmailTemplate[]
}

export async function getTemplateGallery(): Promise<TemplateGallery> {
  const emailTemplates = await getEmailTemplates().catch(() => [])

  return {
    landingTemplates: ALL_TEMPLATES,
    emailTemplates,
  }
}
