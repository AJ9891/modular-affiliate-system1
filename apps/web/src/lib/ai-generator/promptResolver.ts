/**
 * Prompt Resolver
 * 
 * Single switchboard: Personality → AI Prompt Profile
 * 
 * Notice what we don't do:
 * - No brand_mode string checks
 * - No feature flags
 * - No duplication
 * 
 * We infer AI behavior from the same personality traits the UI obeys.
 * That's coherence.
 */

import type { PersonalityProfile } from '@/lib/personality/types'
import { BrandModeId, PromptContext, ResolvedPrompt, AIPromptProfile } from './types';
import { aiMeltdown, aiMeltdownPrompt } from './brandModes/aiMeltdown';
import { antiGuru, antiGuruPrompt } from './brandModes/antiGuru';
import { rocketFuture, rocketFuturePrompt } from './brandModes/rocketFuture';

/**
 * Resolve AI Prompt from Personality
 * 
 * Maps personality → AIPromptProfile
 * The same personality that governs UI also governs AI
 * 
 * @param personality - The active personality profile
 * @returns AI prompt configuration
 */
export function resolveAIPrompt(
  personality: PersonalityProfile
): AIPromptProfile {
  switch (personality.authorityTone) {
    case 'sarcastic':
      return aiMeltdown

    case 'brutally_honest':
      return antiGuru

    case 'encouraging':
      return rocketFuture

    default:
      return antiGuru
  }
}

/**
 * Legacy resolver (deprecated - use resolveAIPrompt instead)
 * 
 * @deprecated Use resolveAIPrompt with PersonalityProfile
 */
export function resolvePrompt(
  brandMode: BrandModeId,
  context: PromptContext
): ResolvedPrompt {
  switch (brandMode) {
    case 'ai_meltdown':
      return aiMeltdownPrompt(context);
    case 'anti_guru':
      return antiGuruPrompt(context);
    case 'rocket_future':
      return rocketFuturePrompt(context);
    default: {
      const _exhaustiveCheck: never = brandMode;
      throw new Error(`Unhandled brand mode: ${brandMode}`);
    }
  }
}
