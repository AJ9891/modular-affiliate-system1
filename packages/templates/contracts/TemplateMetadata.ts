export type TemplateRisk = 'low' | 'medium' | 'high'

export type TemplateAudience = 'new_creator' | 'active_operator' | 'team' | 'agency'

export type TemplateGoal =
  | 'list_building'
  | 'conversion'
  | 'activation'
  | 'retention'
  | 'education'

export type ExperienceLevel = 'beginner' | 'intermediate' | 'advanced'

export interface TemplateMetadataContract {
  templateId: string
  version: string
  voice: string
  risk: TemplateRisk
  audience: TemplateAudience
  goal: TemplateGoal
  experienceLevel: ExperienceLevel
}

export interface TemplateDefinition {
  metadata: TemplateMetadataContract
  render: (input: Record<string, unknown>) => string
}

export function validateTemplateMetadata(metadata: TemplateMetadataContract): string[] {
  const errors: string[] = []

  if (!metadata.templateId.trim()) {
    errors.push('templateId is required')
  }

  if (!metadata.version.trim()) {
    errors.push('version is required')
  }

  if (!metadata.voice.trim()) {
    errors.push('voice is required')
  }

  return errors
}
