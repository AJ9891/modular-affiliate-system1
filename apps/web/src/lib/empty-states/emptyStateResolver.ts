/**
 * Empty State Resolver
 * 
 * Maps personality + category to concrete empty state behavior
 * BrandBrain decides: tone, animation, visual noise
 * Product logic decides: message truth, recovery path
 */

import { PersonalityProfile } from '@/lib/personality/types'
import { 
  EmptyStateTone, 
  EmptyStateCategory, 
  EmptyStateVisuals,
  PersonalityBandwidth 
} from './types'

/**
 * Determine personality bandwidth based on category
 * Critical: Errors reduce personality, not increase it
 */
export function resolvePersonalityBandwidth(
  category: EmptyStateCategory
): PersonalityBandwidth {
  switch (category) {
    case 'empty-expected':
      return 'full'      // New projects can be expressive
    case 'empty-unexpected':
      return 'reduced'   // Data failures need less personality
    case 'recoverable-error':
      return 'minimal'   // Errors need clarity
    case 'hard-error':
      return 'none'      // Hard errors get zero personality
  }
}

/**
 * Resolve tone from personality and category
 * Each brand mode has a baseline, but errors override it
 */
export function resolveEmptyStateTone(
  personality: PersonalityProfile,
  category: EmptyStateCategory
): EmptyStateTone {
  const bandwidth = resolvePersonalityBandwidth(category)
  
  // Hard errors always get neutral tone, regardless of personality
  if (bandwidth === 'none') {
    return 'neutral'
  }
  
  // Recoverable errors always get neutral tone
  if (bandwidth === 'minimal') {
    return 'neutral'
  }
  
  // Map personality to tone
  const mode = personality.mode
  
  switch (mode) {
    case 'anti_guru':
      return 'neutral'
    case 'rocket_future':
      return 'encouraging'
    case 'ai_meltdown':
      return bandwidth === 'full' ? 'contained-chaos' : 'neutral'
    default:
      return 'neutral'
  }
}

/**
 * Resolve visual expression from personality and category
 * Critical: Motion reduces under stress, not increases
 */
export function resolveEmptyStateVisuals(
  personality: PersonalityProfile,
  category: EmptyStateCategory
): EmptyStateVisuals {
  const bandwidth = resolvePersonalityBandwidth(category)
  const mode = personality.mode
  
  // Hard errors: no motion, no noise, static icon
  if (bandwidth === 'none') {
    return {
      motionIntensity: 'none',
      visualNoise: 'minimal',
      allowMetaphor: false,
      allowGlitch: false,
      iconStyle: 'static'
    }
  }
  
  // Recoverable errors: minimal motion
  if (bandwidth === 'minimal') {
    return {
      motionIntensity: 'none',
      visualNoise: 'minimal',
      allowMetaphor: false,
      allowGlitch: false,
      iconStyle: 'static'
    }
  }
  
  // Map personality to visuals for expected empty states
  switch (mode) {
    case 'anti_guru':
      return {
        motionIntensity: 'none',
        visualNoise: 'minimal',
        allowMetaphor: false,
        allowGlitch: false,
        iconStyle: 'static'
      }
    
    case 'rocket_future':
      return {
        motionIntensity: bandwidth === 'full' ? 'subtle' : 'none',
        visualNoise: 'balanced',
        allowMetaphor: bandwidth === 'full',
        allowGlitch: false,
        iconStyle: bandwidth === 'full' ? 'animated' : 'static'
      }
    
    case 'ai_meltdown':
      return {
        motionIntensity: bandwidth === 'full' ? 'medium' : 'none',
        visualNoise: bandwidth === 'full' ? 'expressive' : 'minimal',
        allowMetaphor: bandwidth === 'full',
        allowGlitch: bandwidth === 'full', // Only for expected empty states
        iconStyle: bandwidth === 'full' ? 'animated' : 'static'
      }
    
    default:
      return {
        motionIntensity: 'none',
        visualNoise: 'minimal',
        allowMetaphor: false,
        allowGlitch: false,
        iconStyle: 'static'
      }
  }
}

/**
 * Get default copy templates by tone
 * Product logic should override these with specific messages
 */
export function getEmptyStateCopyTemplate(
  tone: EmptyStateTone,
  category: EmptyStateCategory
): { headline: string; body: string } {
  // anti_guru baseline (always safe to fall back to)
  if (tone === 'neutral') {
    switch (category) {
      case 'empty-expected':
        return {
          headline: 'Nothing here yet.',
          body: 'Create your first item to get started.'
        }
      case 'empty-unexpected':
        return {
          headline: 'We couldn\'t load this data.',
          body: 'Try again or check your connection.'
        }
      case 'recoverable-error':
        return {
          headline: 'Something went wrong.',
          body: 'Please try again in a moment.'
        }
      case 'hard-error':
        return {
          headline: 'Unable to continue.',
          body: 'Please contact support if this persists.'
        }
    }
  }
  
  // rocket_future (encouraging, forward motion)
  if (tone === 'encouraging') {
    switch (category) {
      case 'empty-expected':
        return {
          headline: 'This space is ready for its first launch.',
          body: 'Build your first offer to continue.'
        }
      case 'empty-unexpected':
        return {
          headline: 'We hit a brief delay.',
          body: 'Retry when ready — your work is safe.'
        }
      default:
        // Errors fall back to neutral
        return getEmptyStateCopyTemplate('neutral', category)
    }
  }
  
  // ai_meltdown (contained chaos - personality only in headline)
  if (tone === 'contained-chaos') {
    switch (category) {
      case 'empty-expected':
        return {
          headline: 'Nothing has formed yet.',
          body: 'Start by creating your first module.'
        }
      case 'empty-unexpected':
        return {
          headline: 'Signal dropped.',
          body: 'We couldn\'t complete the request. Please try again.'
        }
      default:
        // Errors fall back to neutral
        return getEmptyStateCopyTemplate('neutral', category)
    }
  }
  
  // Fallback to neutral
  return getEmptyStateCopyTemplate('neutral', category)
}
