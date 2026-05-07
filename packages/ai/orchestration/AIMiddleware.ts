import { resolvePipelineContext } from './ContextResolver'
import { selectPromptContract, assemblePipelinePrompt } from './PromptAssembler'
import { injectVoice } from './VoiceInjector'
import { lintPipelineResponse } from './ResponseLinter'
import type { AIRequestPipelineInput, PreparedAIRequest, ResponseLintEnvelope } from './types'

export function prepareAIRequest(input: AIRequestPipelineInput): PreparedAIRequest {
  const context = resolvePipelineContext(input)
  const contract = selectPromptContract(input.contractKey, context.mode)
  const voiceResult = injectVoice(context, contract)

  if (voiceResult.blocked) {
    return {
      blocked: true,
      reason: voiceResult.reason,
      prompt: '',
      context,
      contract,
      voiceHeader: {
        id: context.voice,
        system: '',
        constraints: [],
      },
    }
  }

  const prompt = assemblePipelinePrompt({
    request: input,
    context,
    voiceHeader: voiceResult.voiceHeader,
    contract,
  })

  return {
    blocked: false,
    prompt,
    context,
    contract,
    voiceHeader: voiceResult.voiceHeader,
  }
}

export function lintAIResponse(content: string): ResponseLintEnvelope {
  return lintPipelineResponse(content)
}
