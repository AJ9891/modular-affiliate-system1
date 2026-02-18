import type { PromptContract } from './types'

export const TemplatePromptContract: PromptContract = {
  allowedVoices: ['boost', 'anti-guru', 'glitch'],
  riskLevel: 'medium',
  outputShape: 'structured-json',
  overwritePolicy: 'replace-empty',
  persuasionLevel: 'low',
  notes: 'Draft only empty blocks; label sections; include non-public explanation comments.'
}
