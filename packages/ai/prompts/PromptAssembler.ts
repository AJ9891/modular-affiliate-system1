import type { PromptAssemblyInput, PromptAssemblyOutput } from './Prompt.types'

// Deterministic assembly: guardrails → voice → component instructions → user content → contract.
export function assemblePrompt(input: PromptAssemblyInput): PromptAssemblyOutput {
  const blocks = [
    'SYSTEM GUARDRAILS: Follow contracts, do not add urgency, scarcity, or income claims unless provided.',
    `VOICE HEADER:\n${input.voiceHeader.system}\n${input.voiceHeader.constraints.map(c => `- ${c}`).join('\n')}`,
    input.componentInstructions ? `COMPONENT INSTRUCTIONS:\n${input.componentInstructions}` : null,
    input.userContent ? `USER CONTENT:\n${input.userContent}` : null,
    `OUTPUT CONTRACT:\n${JSON.stringify(input.contract, null, 2)}`
  ].filter(Boolean)

  return {
    prompt: blocks.join('\n\n'),
    metadata: { contract: input.contract, voice: input.voiceHeader.id, location: input.context.location }
  }
}
