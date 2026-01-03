/**
 * Hero Copy Generator
 * 
 * AI Prompt Assembly - This is the convergence.
 * 
 * Where everything meets:
 * - Personality → AI discipline
 * - Hero posture → Copy constraints
 * - AI discipline → Actual prompt
 * 
 * No part is guessing. Every rule is resolved.
 */

import { AIPromptProfile } from './types'
import { HeroCopyContract } from '@/lib/hero/types'

/**
 * Build Hero Copy Prompt
 * 
 * Assembles a complete AI prompt from:
 * 1. AI personality profile (system + principles + forbidden)
 * 2. Hero copy contract (guardrails for this specific context)
 * 
 * The result is a prompt that:
 * - Respects brand personality
 * - Follows hero behavior rules
 * - Enforces copy constraints
 * 
 * @param aiProfile - AI personality and behavioral rules
 * @param contract - Hero-specific copy constraints
 * @returns Complete prompt string for AI generation
 */
export function buildHeroPrompt(
  aiProfile: AIPromptProfile,
  contract: HeroCopyContract
): string {
  return `
${aiProfile.system}

You are writing HERO COPY for a landing page.

Constraints:
- Headline length: ${contract.headlineLength}
- Subcopy density: ${contract.subcopyDensity}
- Sarcasm allowed: ${contract.allowSarcasm}
- Promises forbidden: ${contract.forbidPromises}

Rules:
${aiProfile.principles.map(p => `- ${p}`).join('\n')}

Never:
${aiProfile.forbidden.map(f => `- ${f}`).join('\n')}

Write:
1 headline
1 subcopy paragraph
`.trim()
}

/**
 * End-to-End Usage Example
 * 
 * This is the payoff - the complete chain:
 * 
 * ```tsx
 * const personality = resolvePersonality(user.brand_mode)
 * 
 * const heroBehavior = resolveHeroBehavior(personality)
 * const heroContract = resolveHeroCopyContract(heroBehavior)
 * 
 * const aiProfile = resolveAIPrompt(personality)
 * 
 * const prompt = buildHeroPrompt(aiProfile, heroContract)
 * 
 * const heroCopy = await generateAI({ system: prompt })
 * ```
 * 
 * Notice:
 * - Personality drives everything
 * - Each layer resolves explicitly
 * - No guessing, no magic strings
 * - Complete type safety
 */
