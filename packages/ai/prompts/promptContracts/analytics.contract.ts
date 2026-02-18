import type { PromptContract } from './types'

export const AnalyticsPromptContract: PromptContract = {
  allowedVoices: ['boost'],
  riskLevel: 'low',
  outputShape: 'options-with-explanations',
  overwritePolicy: 'replace-empty',
  persuasionLevel: 'low',
  notes: 'Explain what changed, why it matters, and suggest one calm next step. Never marketing copy.'
}
