export type TemplateVoice = 'boost' | 'anti-guru' | 'glitch'

export type TemplateRisk = 'low' | 'medium' | 'high'

export type TemplateChannel = 'landing-page' | 'email' | 'ad'

export interface TemplateMetadataContract {
  id: string
  version: string
  name: string
  owner: string
  channel: TemplateChannel
  voice: TemplateVoice
  risk: TemplateRisk
  audience: string
  aiAllowed: boolean
  tags: string[]
}

export interface VoiceBoundTemplate {
  metadata: TemplateMetadataContract
  body: {
    headline: string
    subheadline: string
    cta: string
    sections: string[]
  }
}

export interface ValidationIssue {
  field: string
  message: string
}

export interface ValidationResult<T> {
  isValid: boolean
  value?: T
  issues: ValidationIssue[]
}

export interface AISafeGenerationInput {
  metadata: TemplateMetadataContract
  prompt: string
  requestedVoice: TemplateVoice
}

export interface AISafeGenerationOutput {
  safe: boolean
  blockedReasons: string[]
  draft: VoiceBoundTemplate
}
