/**
 * Hero Behavior Resolver
 * 
 * Converts personality into hero-specific behavior rules.
 * This is pure behavior math. No brand names, no assets, no copy text.
 * 
 * Usage:
 * ```tsx
 * const personality = usePersonality()
 * const behavior = resolveHeroBehavior(personality)
 * ```
 */

import type { PersonalityProfile } from './types'

/**
 * Hero-specific behavior configuration
 */
export interface HeroBehavior {
  headlineStyle: 'confident' | 'flat' | 'fractured'
  subcopyStyle: 'minimal' | 'explanatory' | 'resistant'
  visualTension: number // 0-1 scale
  allowGlitch: boolean
  allowAmbientSound: boolean
  animationIntensity: number // 0-1 scale
  emphasizeUrgency: boolean
}

/**
 * Resolve hero behavior from personality
 * 
 * This function translates personality rules into specific
 * hero section behavior. Each brand mode creates a different
 * hero experience without touching the component code.
 */
export function resolveHeroBehavior(
  personality: PersonalityProfile
): HeroBehavior {
  // Headline style logic
  const headlineStyle = (() => {
    if (personality.humorDensity === 'glitchy') return 'fractured'
    if (personality.authorityTone === 'blunt') return 'flat'
    return 'confident'
  })()

  // Subcopy style logic
  const subcopyStyle = (() => {
    if (personality.trustPosture === 'mentor') return 'explanatory'
    if (personality.trustPosture === 'co-conspirator') return 'resistant'
    return 'minimal'
  })()

  // Visual tension calculation
  const visualTension = (() => {
    switch (personality.visuals.motionProfile) {
      case 'unstable': return 0.8
      case 'calm': return 0.4
      case 'flat': return 0.1
      default: return 0.1
    }
  })()

  // Animation intensity
  const animationIntensity = (() => {
    switch (personality.visuals.motionProfile) {
      case 'unstable': return 1.0
      case 'calm': return 0.7
      case 'flat': return 0.2
      default: return 0.3
    }
  })()

  // Glitch permission
  const allowGlitch = personality.humorDensity === 'glitchy' || 
                      personality.visuals.motionProfile === 'unstable'

  // Ambient sound permission
  const allowAmbientSound = personality.soundProfile !== 'none'

  // Urgency emphasis
  const emphasizeUrgency = personality.authorityTone === 'unraveling' ||
                           personality.contentGeneration?.callToActionStyle === 'urgent'

  return {
    headlineStyle,
    subcopyStyle,
    visualTension,
    allowGlitch,
    allowAmbientSound,
    animationIntensity,
    emphasizeUrgency
  }
}

/**
 * Get CSS classes based on hero behavior
 * 
 * Helper function to translate behavior into Tailwind classes
 */
export function getHeroClasses(behavior: HeroBehavior): {
  container: string
  headline: string
  subcopy: string
} {
  return {
    container: [
      'hero-root',
      behavior.visualTension > 0.5 && 'hero-high-tension',
      behavior.allowGlitch && 'hero-glitchable'
    ].filter(Boolean).join(' '),

    headline: [
      'hero-headline',
      behavior.headlineStyle === 'confident' && 'hero-headline-confident',
      behavior.headlineStyle === 'flat' && 'hero-headline-flat',
      behavior.headlineStyle === 'fractured' && 'hero-headline-fractured',
      behavior.emphasizeUrgency && 'hero-headline-urgent'
    ].filter(Boolean).join(' '),

    subcopy: [
      'hero-subcopy',
      behavior.subcopyStyle === 'minimal' && 'hero-subcopy-minimal',
      behavior.subcopyStyle === 'explanatory' && 'hero-subcopy-explanatory',
      behavior.subcopyStyle === 'resistant' && 'hero-subcopy-resistant'
    ].filter(Boolean).join(' ')
  }
}

/**
 * Get animation variants based on hero behavior
 * 
 * For use with framer-motion or other animation libraries
 */
export function getHeroAnimationVariants(behavior: HeroBehavior) {
  const baseDelay = 0.1
  const intensity = behavior.animationIntensity

  return {
    container: {
      hidden: { opacity: 0 },
      visible: {
        opacity: 1,
        transition: {
          staggerChildren: 0.2 * intensity,
          delayChildren: baseDelay
        }
      }
    },

    headline: {
      hidden: {
        opacity: 0,
        y: behavior.headlineStyle === 'fractured' ? Math.random() * 40 - 20 : 20,
        x: behavior.headlineStyle === 'fractured' ? Math.random() * 20 - 10 : 0
      },
      visible: {
        opacity: 1,
        y: 0,
        x: 0,
        transition: {
          duration: behavior.headlineStyle === 'fractured' ? 0.3 : 0.6,
          ease: behavior.headlineStyle === 'fractured' ? 'easeOut' as const : 'easeInOut' as const
        }
      }
    },

    subcopy: {
      hidden: {
        opacity: 0,
        y: 10
      },
      visible: {
        opacity: 1,
        y: 0,
        transition: {
          duration: 0.4,
          delay: 0.2 * intensity
        }
      }
    }
  }
}

/**
 * Get glitch parameters based on hero behavior
 * 
 * Returns configuration for glitch effects
 */
export function getHeroGlitchParams(behavior: HeroBehavior) {
  if (!behavior.allowGlitch) {
    return {
      enabled: false,
      intensity: 0,
      frequency: 0
    }
  }

  return {
    enabled: true,
    intensity: behavior.visualTension,
    frequency: behavior.visualTension > 0.5 ? 'high' : 'low',
    types: ['rgb-shift', 'scan-lines', 'distortion'] as const
  }
}
