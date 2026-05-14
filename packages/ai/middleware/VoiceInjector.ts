import { enforceVoiceSurfaceCompatibility } from '@modular-affiliate/voices'
import { bindVoice } from '../voices/VoiceBinder'
import type { AIContext } from '../context/Context.types'
import type { PromptContract } from '../prompts/promptContracts/types'
import type { VoiceHeader } from '../voices/Voice.types'

export type VoiceInjectionResult =
  | {
      blocked: true
      reason: string
    }
  | {
      blocked: false
      voiceHeader: VoiceHeader
    }

function getSurfaceFromMode(mode: AIContext['mode']): 'builder' | 'onboarding' | 'live_funnel' {
  if (mode === 'onboarding') return 'onboarding'
  if (mode === 'live_funnel') return 'live_funnel'
  return 'builder'
}

export function injectMiddlewareVoice(context: AIContext, contract: PromptContract): VoiceInjectionResult {
  const compatibility = enforceVoiceSurfaceCompatibility(context.voice, getSurfaceFromMode(context.mode))
  if (!compatibility.allowed) {
    return {
      blocked: true,
      reason: compatibility.reason ?? `Voice ${context.voice} is not compatible with surface.`,
    }
  }

  const bound = bindVoice(context)
  if (!bound) {
    return {
      blocked: true,
      reason: `Voice ${context.voice} is not registered for mode ${context.mode}`,
    }
  }

  if (!contract.allowedVoices.includes(bound.header.id)) {
    return {
      blocked: true,
      reason: `Voice ${bound.header.id} is not allowed by prompt contract`,
    }
  }

  return {
    blocked: false,
    voiceHeader: bound.header,
  }
}
