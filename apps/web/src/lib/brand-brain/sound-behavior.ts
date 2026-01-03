/**
 * Sound Behavior Resolver
 * 
 * Determines whether ambient sound should play based on:
 * - Brand personality profile
 * - User context (page, launchpad, etc.)
 * - User preferences
 */

import { UIExpressionProfile } from '@/types/ui-expression'

export type SoundProfile = 'checklist' | 'hum' | 'glitch' | 'none'

export type SoundContext = 
  | 'homepage'
  | 'launchpad'
  | 'dashboard'
  | 'builder'
  | 'checkout'
  | 'other'

export type SoundBehavior = {
  enabled: boolean
  profile: SoundProfile
  volume: number
}

/**
 * Resolve sound behavior based on UI expression and context
 */
export function resolveSoundBehavior(
  uiExpression: UIExpressionProfile,
  context: SoundContext,
  userPreference: boolean | null = null
): SoundBehavior {
  // User preference always wins
  if (userPreference === false) {
    return {
      enabled: false,
      profile: 'none',
      volume: 0
    }
  }

  // Check if brand allows sound at all
  if (uiExpression.sound.maxVolume === 0) {
    return {
      enabled: false,
      profile: 'none',
      volume: 0
    }
  }

  // Determine if context allows sound
  const soundAllowedInContext = getSoundContextRules(context)
  
  if (!soundAllowedInContext) {
    return {
      enabled: false,
      profile: 'none',
      volume: 0
    }
  }

  // Get the primary sound profile from brand
  const profile = getPrimarySoundProfile(uiExpression.sound.ambientProfiles)

  // Default: enabled in allowed contexts if user hasn't explicitly opted out
  const enabled = userPreference === null ? true : userPreference

  return {
    enabled,
    profile,
    volume: uiExpression.sound.maxVolume
  }
}

/**
 * Context rules for sound playback
 */
function getSoundContextRules(context: SoundContext): boolean {
  switch (context) {
    case 'homepage':
      return false // Visitors shouldn't be surprised
    case 'launchpad':
      return true // Main launch experience
    case 'dashboard':
      return false // Focus work environment
    case 'builder':
      return false // Creative focus mode
    case 'checkout':
      return false // Don't distract during payment
    case 'other':
      return false
    default:
      return false
  }
}

/**
 * Get primary sound profile from array
 */
function getPrimarySoundProfile(profiles: ('checklist' | 'hum' | 'glitch')[]): SoundProfile {
  if (profiles.length === 0) return 'none'
  
  // Priority order: checklist > hum > glitch
  if (profiles.includes('checklist')) return 'checklist'
  if (profiles.includes('hum')) return 'hum'
  if (profiles.includes('glitch')) return 'glitch'
  
  return 'none'
}

/**
 * Get audio file path for sound profile
 */
export function getSoundFilePath(profile: SoundProfile): string {
  switch (profile) {
    case 'checklist':
      return '/audio/rocket-checklist-ambient.mp3'
    case 'hum':
      return '/audio/rocket-hum-ambient.mp3'
    case 'glitch':
      return '/audio/glitch-ambient.mp3'
    case 'none':
    default:
      return ''
  }
}
