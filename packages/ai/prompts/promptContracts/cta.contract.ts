import type { PromptContract } from './types'

export const CTAPromptContract: PromptContract = {
  allowedVoices: ['boost', 'anti-guru'],
  riskLevel: 'high',
  outputShape: 'options-with-explanations',
  overwritePolicy: 'never',
  persuasionLevel: 'low',
  notes: 'Reduce friction; no urgency unless provided; always offer a low-pressure alternative.'
}
