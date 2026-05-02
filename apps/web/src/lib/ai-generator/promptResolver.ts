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
import { AIPromptProfile } from './types';
import { aiMeltdown } from './brandModes/aiMeltdown';
import { antiGuru } from './brandModes/antiGuru';
import { rocketFuture } from './brandModes/rocketFuture';

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
