import { bindVoice } from '../voices/VoiceBinder'
import type { AIContext } from '../context/Context.types'
import type { PromptContract } from '../prompts/promptContracts/types'

export function injectVoice(context: AIContext, contract: PromptContract) {
  const bound = bindVoice(context)

  if (!bound) {
    return {
      blocked: true,
      reason: `Voice ${context.voice} is not allowed for mode ${context.mode}`,
    } as const
  }

  if (!contract.allowedVoices.includes(bound.header.id)) {
    return {
      blocked: true,
      reason: `Voice ${bound.header.id} is not allowed by prompt contract`,
    } as const
  }

  return {
    blocked: false,
    voiceHeader: bound.header,
  } as const
}
