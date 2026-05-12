export const AI_ALLOWED_ACTIONS = [
  'generate_copy',
  'rewrite_copy',
  'summarize',
  'recommend_template',
  'recommend_next_step',
] as const

export type AIAllowedAction = (typeof AI_ALLOWED_ACTIONS)[number]

export interface AIOverwritePolicy {
  canOverwriteUserIntent: boolean
  requiresConfirmation: boolean
  mutableFields: string[]
}

export interface AIPersuasionLimits {
  prohibitUrgencyFabrication: boolean
  prohibitShamingLanguage: boolean
  prohibitFalseScarcity: boolean
  prohibitManipulativeGuarantees: boolean
}

export interface AIFlightContract {
  allowedActions: readonly AIAllowedAction[]
  overwritePolicy: AIOverwritePolicy
  persuasionLimits: AIPersuasionLimits
  compatibleVoices: readonly string[]
}

export const DEFAULT_AI_FLIGHT_CONTRACT: AIFlightContract = {
  allowedActions: AI_ALLOWED_ACTIONS,
  overwritePolicy: {
    canOverwriteUserIntent: false,
    requiresConfirmation: true,
    mutableFields: ['draft.copy', 'draft.layout', 'draft.cta'],
  },
  persuasionLimits: {
    prohibitUrgencyFabrication: true,
    prohibitShamingLanguage: true,
    prohibitFalseScarcity: true,
    prohibitManipulativeGuarantees: true,
  },
  compatibleVoices: ['boost', 'anti-guru', 'glitch'],
}

export function isAIActionAllowed(
  action: string,
  contract: AIFlightContract = DEFAULT_AI_FLIGHT_CONTRACT,
): action is AIAllowedAction {
  return contract.allowedActions.includes(action as AIAllowedAction)
}
