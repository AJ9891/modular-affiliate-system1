import { findHypeCreep } from './HypeCreepValidator'
import { findIntentMutation } from './IntentMutationValidator'
import { findUnsafeCopy } from './UnsafeCopyValidator'
import { findVoiceDrift } from './VoiceDriftValidator'
import type { ValidationResult } from './types'

export * from './types'
export * from './HypeCreepValidator'
export * from './VoiceDriftValidator'
export * from './UnsafeCopyValidator'
export * from './IntentMutationValidator'

export function validateAIOutput(input: {
  content: string
  requestedIntent: string
  generatedIntent: string
  forbiddenVoicePatterns?: string[]
}): ValidationResult {
  const voicePatterns = input.forbiddenVoicePatterns ?? []

  const issues = [
    ...findHypeCreep(input.content),
    ...findUnsafeCopy(input.content),
    ...findVoiceDrift(input.content, voicePatterns),
    ...findIntentMutation(input.requestedIntent, input.generatedIntent),
  ]

  return {
    blocked: issues.some((issue) => issue.severity === 'violation'),
    issues,
  }
}
