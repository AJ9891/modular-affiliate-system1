import { validateMetadataContract } from './metadata-contracts'
import {
  bindTemplateToVoice,
  getVoiceConstraints,
  isVoiceBoundTemplate,
} from './voice-bound-templates'
import type {
  AISafeGenerationInput,
  AISafeGenerationOutput,
  TemplateVoice,
  VoiceBoundTemplate,
} from './types'

const BLOCKED_PATTERNS = [
  /guaranteed income/i,
  /risk[-\s]?free/i,
  /limited time only/i,
  /act now/i,
  /secret method/i,
]

export function generateAISafeTemplate(input: AISafeGenerationInput): AISafeGenerationOutput {
  const blockedReasons: string[] = []
  const metadataValidation = validateMetadataContract(input.metadata)

  if (!metadataValidation.isValid) {
    blockedReasons.push(
      ...metadataValidation.issues.map((issue) => `${issue.field}: ${issue.message}`)
    )
  }

  if (!input.metadata.aiAllowed) {
    blockedReasons.push('metadata.aiAllowed must be true for AI generation')
  }

  if (input.metadata.voice !== input.requestedVoice) {
    blockedReasons.push(
      `requested voice "${input.requestedVoice}" does not match metadata voice "${input.metadata.voice}"`
    )
  }

  const normalizedPrompt = normalizePrompt(input.prompt)
  BLOCKED_PATTERNS.forEach((pattern) => {
    if (pattern.test(normalizedPrompt)) {
      blockedReasons.push(`prompt contains blocked pattern: ${pattern.source}`)
    }
  })

  const baseTemplate: VoiceBoundTemplate = {
    metadata: input.metadata,
    body: {
      headline: buildHeadline(normalizedPrompt, input.requestedVoice),
      subheadline: `Built for ${input.metadata.audience} with ${input.requestedVoice} voice constraints.`,
      cta: buildCta(input.requestedVoice),
      sections: [
        `Voice constraints: ${getVoiceConstraints(input.requestedVoice).join(', ')}`,
        `Channel: ${input.metadata.channel}`,
        `Risk profile: ${input.metadata.risk}`,
      ],
    },
  }

  const draft = bindTemplateToVoice(baseTemplate, input.requestedVoice)
  if (!isVoiceBoundTemplate(draft, input.requestedVoice)) {
    blockedReasons.push('failed to bind template to requested voice')
  }

  return {
    safe: blockedReasons.length === 0,
    blockedReasons,
    draft,
  }
}

function normalizePrompt(prompt: string): string {
  return prompt.replace(/\u0000/g, '').trim().slice(0, 1500)
}

function buildHeadline(prompt: string, voice: TemplateVoice): string {
  const subject = prompt.length > 0 ? prompt : 'your campaign objective'

  if (voice === 'anti-guru') {
    return `A practical path to improve ${subject}`
  }
  if (voice === 'glitch') {
    return `A controlled launch plan for ${subject}`
  }

  return `Build momentum with a clear plan for ${subject}`
}

function buildCta(voice: TemplateVoice): string {
  if (voice === 'anti-guru') return 'Review the realistic plan'
  if (voice === 'glitch') return 'Run the controlled preview'
  return 'Start the guided setup'
}
