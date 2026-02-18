import type { PromptContract } from './types'

export const HeroPromptContract: PromptContract = {
  allowedVoices: ['boost', 'anti-guru', 'glitch'],
  riskLevel: 'medium',
  outputShape: 'options-with-explanations',
  overwritePolicy: 'never',
  persuasionLevel: 'low',
  notes: 'Clarify relevance quickly; never change the offer; explain why each option works.'
}
