import type { PromptContract } from './types'

export const FunnelPromptContract: PromptContract = {
  allowedVoices: ['boost'],
  riskLevel: 'high',
  outputShape: 'structured-json',
  overwritePolicy: 'replace-empty',
  persuasionLevel: 'low',
  notes: 'Outputs ordered steps with reasons; flags optional vs required; tone experimentation forbidden.'
}
