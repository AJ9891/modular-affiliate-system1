import { resolveAIContext } from '../context/AIContextResolver'
import { assessRisk } from '../context/RiskAssessor'
import { AIService } from '../services/AIService'
import { bindVoice } from '../voices/VoiceBinder'
import { validateAIContext, validatePromptContract, validateUserContent } from '../validators'
import type {
  AIMiddlewareGenerateResult,
  AIMiddlewareInput,
  AIMiddlewarePreparedResult
} from './AIMiddleware.types'

const riskWeight = {
  low: 1,
  medium: 2,
  high: 3
}

export function prepareAIMiddleware(input: AIMiddlewareInput): AIMiddlewarePreparedResult {
  const context = resolveAIContext(input.contextInput)
  if (!context) {
    return {
      ok: false,
      error: {
        stage: 'context',
        message: 'Context is incomplete and cannot be resolved.'
      }
    }
  }

  const contextValidation = validateAIContext(context)
  if (!contextValidation.isValid) {
    return {
      ok: false,
      error: {
        stage: 'context',
        message: 'Context validation failed.',
        details: contextValidation.issues.map((issue) => `${issue.field}: ${issue.message}`)
      }
    }
  }

  const contractValidation = validatePromptContract(input.contract)
  if (!contractValidation.isValid) {
    return {
      ok: false,
      error: {
        stage: 'contract',
        message: 'Prompt contract validation failed.',
        details: contractValidation.issues.map((issue) => `${issue.field}: ${issue.message}`)
      }
    }
  }

  const contentValidation = validateUserContent(input.userContent)
  if (!contentValidation.isValid) {
    return {
      ok: false,
      error: {
        stage: 'content',
        message: 'User content validation failed.',
        details: contentValidation.issues.map((issue) => `${issue.field}: ${issue.message}`)
      }
    }
  }

  const boundVoice = bindVoice(context)
  if (!boundVoice) {
    return {
      ok: false,
      error: {
        stage: 'voice',
        message: `Voice "${context.voice}" is unavailable for mode "${context.mode}".`
      }
    }
  }

  if (!input.contract.allowedVoices.includes(boundVoice.header.id)) {
    return {
      ok: false,
      error: {
        stage: 'voice',
        message: `Voice "${boundVoice.header.id}" is blocked by prompt contract.`
      }
    }
  }

  const effectiveRisk = assessRisk(context)
  if (riskWeight[effectiveRisk] > riskWeight[input.contract.riskLevel]) {
    return {
      ok: false,
      error: {
        stage: 'risk',
        message: `Context risk "${effectiveRisk}" exceeds contract risk "${input.contract.riskLevel}".`
      }
    }
  }

  return {
    ok: true,
    data: {
      context,
      effectiveRisk,
      voice: boundVoice.header.id,
      promptInput: {
        context,
        voiceHeader: boundVoice.header,
        contract: input.contract,
        componentInstructions: input.componentInstructions,
        userContent: contentValidation.value
      }
    }
  }
}

export async function generateWithAIMiddleware(
  input: AIMiddlewareInput,
  service = new AIService()
): Promise<AIMiddlewareGenerateResult> {
  const prepared = prepareAIMiddleware(input)
  if (!prepared.ok || !prepared.data) {
    return {
      ok: false,
      error: prepared.error
    }
  }

  const generated = await service.generate(prepared.data.promptInput)

  return {
    ok: true,
    data: {
      ...generated,
      context: prepared.data.context
    }
  }
}
