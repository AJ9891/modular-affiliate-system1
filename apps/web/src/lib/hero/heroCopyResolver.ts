/**
 * Hero Copy Resolver
 * 
 * Converts HeroBehavior → HeroCopyContract
 * 
 * This is the bridge between:
 * - How the hero section should feel (behavior)
 * - How AI should write for it (contract)
 * 
 * Notice:
 * - Sarcasm comes from behavior, not brand name
 * - Promises are forbidden universally (very on-brand)
 * - Each decision is explicit, not inferred
 */

import { HeroBehavior } from '@/lib/personality/heroBehavior'
import { HeroCopyContract } from './types'

/**
 * Resolve Hero Copy Contract from Hero Behavior
 * 
 * Translates behavioral rules into AI prompt constraints.
 * This ensures the AI writes copy that matches the hero's posture.
 * 
 * @param behavior - Hero behavior configuration
 * @returns Copy contract for AI prompt construction
 */
export function resolveHeroCopyContract(
  behavior: HeroBehavior
): HeroCopyContract {
  return {
    // Headline length from headline style
    headlineLength:
      behavior.headlineStyle === 'fractured' ? 'short' : 'medium',

    // Subcopy density from subcopy style
    subcopyDensity:
      behavior.subcopyStyle === 'explanatory'
        ? 'explained'
        : 'minimal',

    // Sarcasm allowed when glitch is enabled
    allowSarcasm: behavior.allowGlitch,

    // Promises forbidden universally
    // This is a core brand value, not a behavior toggle
    forbidPromises: true,
  }
}
