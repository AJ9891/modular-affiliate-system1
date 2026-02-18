import type { PromptContract } from './types'

export const OnboardingPromptContract: PromptContract = {
  allowedVoices: ['boost'],
  riskLevel: 'low',
  outputShape: 'options-with-explanations',
  overwritePolicy: 'replace-empty',
  persuasionLevel: 'low',
  notes: 'Assume zero context; explain terms inline; never suggest advanced features.'
}
