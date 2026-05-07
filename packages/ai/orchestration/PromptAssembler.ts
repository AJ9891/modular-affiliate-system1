import { assemblePrompt } from '../prompts/PromptAssembler'
import {
  AnalyticsPromptContract,
  CTAPromptContract,
  FunnelPromptContract,
  GlitchPromptContract,
  HeroPromptContract,
  OnboardingPromptContract,
  TemplatePromptContract,
} from '../prompts/promptContracts'
import type { PromptContract } from '../prompts/promptContracts/types'
import type { AIRequestPipelineInput, PipelineContractKey } from './types'
import type { AIContext } from '../context/Context.types'
import type { VoiceHeader } from '../voices/Voice.types'

const CONTRACT_MAP: Record<PipelineContractKey, PromptContract> = {
  hero: HeroPromptContract,
  template: TemplatePromptContract,
  cta: CTAPromptContract,
  onboarding: OnboardingPromptContract,
  analytics: AnalyticsPromptContract,
  funnel: FunnelPromptContract,
  glitch: GlitchPromptContract,
}

export function selectPromptContract(key: PipelineContractKey | undefined, fallback: AIContext['mode']): PromptContract {
  if (key) {
    return CONTRACT_MAP[key]
  }

  if (fallback === 'onboarding') {
    return OnboardingPromptContract
  }

  if (fallback === 'live_funnel') {
    return FunnelPromptContract
  }

  return TemplatePromptContract
}

export function assemblePipelinePrompt(input: {
  request: AIRequestPipelineInput
  context: AIContext
  voiceHeader: VoiceHeader
  contract: PromptContract
}): string {
  const result = assemblePrompt({
    context: input.context,
    voiceHeader: input.voiceHeader,
    contract: input.contract,
    componentInstructions: input.request.componentInstructions,
    userContent: input.request.content,
  })

  return result.prompt
}
