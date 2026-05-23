import { getTemplateById } from '@/config/funnelTemplates'
import type { StartupFunnelType } from '@/lib/launchpad/startupChecklist'

export interface LaunchpadTemplateCard {
  name: string
  description: string
  blocks: number
  conversions: string
  category: StartupFunnelType
  templateId: string
}

const TEMPLATE_CARD_CONFIG: Array<{
  category: StartupFunnelType
  templateId: string
  fallbackName: string
  fallbackDescription: string
  conversions: string
}> = [
  {
    category: 'lead-gen',
    templateId: 'anchor-lead-magnet',
    fallbackName: 'Lead Magnet',
    fallbackDescription: 'Capture emails with a free download',
    conversions: '18-25%',
  },
  {
    category: 'review',
    templateId: 'anchor-affiliate-review',
    fallbackName: 'Product Review',
    fallbackDescription: 'Review and recommend affiliate products',
    conversions: '8-15%',
  },
  {
    category: 'vsl',
    templateId: 'anchor-sales-page',
    fallbackName: 'Video Sales Letter',
    fallbackDescription: 'Video-first landing page',
    conversions: '12-20%',
  },
  {
    category: 'webinar',
    templateId: 'anchor-webinar',
    fallbackName: 'Webinar Registration',
    fallbackDescription: 'Collect registrations for live training',
    conversions: '25-35%',
  },
]

export const LAUNCHPAD_TEMPLATE_CARDS: LaunchpadTemplateCard[] = TEMPLATE_CARD_CONFIG.map((entry) => {
  const template = getTemplateById(entry.templateId)

  return {
    name: template?.name || entry.fallbackName,
    description: template?.description || entry.fallbackDescription,
    blocks: template?.blocks.length || 0,
    conversions: entry.conversions,
    category: entry.category,
    templateId: entry.templateId,
  }
})

export function getLaunchpadTemplateByCategory(category: StartupFunnelType) {
  return LAUNCHPAD_TEMPLATE_CARDS.find((template) => template.category === category) || null
}
