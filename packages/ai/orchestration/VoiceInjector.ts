import { injectMiddlewareVoice } from '../middleware/VoiceInjector'
import type { AIContext } from '../context/Context.types'
import type { PromptContract } from '../prompts/promptContracts/types'

export function injectVoice(context: AIContext, contract: PromptContract) {
  return injectMiddlewareVoice(context, contract)
}
