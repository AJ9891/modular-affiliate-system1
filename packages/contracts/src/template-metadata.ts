export const TEMPLATE_CATEGORIES = [
  'landing-page',
  'email',
  'ad-copy',
  'automation',
] as const

export type TemplateCategory = (typeof TEMPLATE_CATEGORIES)[number]

export interface TemplateMetadata {
  templateId: string
  name: string
  category: TemplateCategory
  version: string
  requiredInputs: string[]
  optionalInputs: string[]
  outputShape: 'html' | 'json' | 'markdown' | 'text'
  capabilityRequirements: string[]
}
