import { DEFAULT_AI_FLIGHT_CONTRACT, isAIActionAllowed } from '../contracts'
import { injectContext } from '../middleware/ContextMiddleware'
import { injectVoiceMiddleware } from '../middleware/VoiceMiddleware'
import { injectTemplateConstraints } from '../middleware/TemplateConstraintMiddleware'
import { injectOnboardingState } from '../middleware/OnboardingStateMiddleware'
import { buildCalmInsight, emitAIFlightEvent } from '../telemetry'
import { validateAIOutput } from '../validators'
import type { AIContextInput } from '../context/Context.types'
import type { OnboardingRuntimeState } from '../middleware'

export interface FlightOrchestratorInput {
  prompt: string
  action: string
  context: AIContextInput
  requestedIntent: string
  generatedIntent: string
  generatedContent: string
  onboardingState: OnboardingRuntimeState
  promptVersion: string
  model: string
}

export function orchestrateAIFlight(input: FlightOrchestratorInput) {
  if (!isAIActionAllowed(input.action, DEFAULT_AI_FLIGHT_CONTRACT)) {
    return {
      blocked: true,
      reason: `Action is not allowed by AI flight contract: ${input.action}`,
      issues: [],
    }
  }

  const withContext = injectContext(input.prompt, input.context)
  const withVoice = injectVoiceMiddleware(withContext)
  const withTemplateConstraints = injectTemplateConstraints(withVoice)
  const prepared = injectOnboardingState(withTemplateConstraints, input.onboardingState)

  const validation = validateAIOutput({
    content: input.generatedContent,
    requestedIntent: input.requestedIntent,
    generatedIntent: input.generatedIntent,
  })

  emitAIFlightEvent({
    name: 'ai.validation',
    timestamp: new Date().toISOString(),
    promptVersion: input.promptVersion,
    model: input.model,
    blocked: validation.blocked,
    policyFlags: validation.issues.map((issue) => issue.id),
    calmInsight: buildCalmInsight({
      whatChanged: validation.blocked ? 'Output was blocked by validators.' : 'Output passed validators.',
      whyItMatters: 'Validation status controls whether generated copy can be shown to users.',
      nextStep: validation.blocked ? 'Revise copy with safer claims and re-run validation.' : 'Render copy and log decision envelope.',
    }),
    metadata: prepared.metadata,
  })

  return {
    blocked: validation.blocked,
    envelope: prepared,
    issues: validation.issues,
  }
}
