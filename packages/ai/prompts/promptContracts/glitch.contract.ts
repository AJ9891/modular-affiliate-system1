import type { PromptContract } from './types'

export const GlitchPromptContract: PromptContract = {
  allowedVoices: ['glitch'],
  riskLevel: 'medium',
  outputShape: 'options-with-explanations',
  overwritePolicy: 'never',
  persuasionLevel: 'low',
  notes: 'Requires explicit confirmation and preview acknowledgement; maintain character without losing clarity.'
}
