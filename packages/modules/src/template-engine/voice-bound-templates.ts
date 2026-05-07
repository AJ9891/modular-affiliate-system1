import type { TemplateVoice, VoiceBoundTemplate } from './types'

const voiceConstraints: Record<TemplateVoice, string[]> = {
  boost: ['clear', 'explanatory', 'grounded'],
  'anti-guru': ['skeptical', 'plainspoken', 'no-hype'],
  glitch: ['self-aware', 'coherent', 'controlled-parody'],
}

export function getVoiceConstraints(voice: TemplateVoice): string[] {
  return voiceConstraints[voice]
}

export function bindTemplateToVoice(
  template: VoiceBoundTemplate,
  requestedVoice: TemplateVoice
): VoiceBoundTemplate {
  return {
    ...template,
    metadata: {
      ...template.metadata,
      voice: requestedVoice,
      tags: [...template.metadata.tags, `voice:${requestedVoice}`],
    },
  }
}

export function isVoiceBoundTemplate(
  template: VoiceBoundTemplate,
  requestedVoice: TemplateVoice
): boolean {
  return template.metadata.voice === requestedVoice
}
