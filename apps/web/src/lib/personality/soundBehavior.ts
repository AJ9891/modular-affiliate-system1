/**
 * Sound Behavior Resolver
 * 
 * Personality → Sound mapping (single resolver)
 * Sound is now governed, not sprinkled.
 * 
 * Key principles:
 * - No autoplay
 * - No timing logic here
 * - Just permission + constraints
 */

import type { PersonalityProfile, SoundProfile } from './types'

/**
 * Sound trigger types
 */
export type SoundTrigger = 
  | 'step_complete' 
  | 'step_unlocked' 
  | 'system_ready' 
  | 'error' 
  | 'success'

/**
 * Sound behavior configuration
 */
export interface SoundBehavior {
  enabled: boolean
  profile: 'checklist' | 'glitch' | 'hum' | null
  volume: number // 0-1 scale
}

/**
 * Resolve sound behavior from personality
 * 
 * This function governs what sounds are allowed and at what volume.
 * The actual playback is handled by AmbientSoundController.
 * 
 * @param personality - The active personality profile
 * @returns Sound behavior configuration
 */
export function resolveSoundBehavior(
  personality: PersonalityProfile
): SoundBehavior {
  // Silent mode - no sound at all
  if (personality.soundProfile === 'none') {
    return { 
      enabled: false, 
      profile: null, 
      volume: 0 
    }
  }

  // Map sound profile to behavior
  switch (personality.soundProfile) {
    case 'ambient_checklist':
      // Subtle task completion sounds
      // Used by: anti_guru (focused, minimal)
      return { 
        enabled: true, 
        profile: 'checklist', 
        volume: 0.15 
      }

    case 'glitch_comm':
      // Digital glitch/interference audio
      // Used by: ai_meltdown (chaotic, unstable)
      return { 
        enabled: true, 
        profile: 'glitch', 
        volume: 0.2 
      }

    case 'procedural_hum':
      // Algorithmic ambient hum
      // Used by: rocket_future (smooth, generative)
      return { 
        enabled: true, 
        profile: 'hum', 
        volume: 0.12 
      }

    default:
      // Fallback to silent
      return { 
        enabled: false, 
        profile: null, 
        volume: 0 
      }
  }
}

/**
 * Check if sound should play for a specific trigger
 * 
 * Some personalities may want sounds only for certain events.
 * This provides fine-grained control beyond the profile.
 */
export function shouldPlaySound(
  personality: PersonalityProfile,
  trigger: 'step_complete' | 'step_unlocked' | 'system_ready' | 'error' | 'success'
): boolean {
  const behavior = resolveSoundBehavior(personality)
  
  if (!behavior.enabled) return false

  // Additional trigger-based rules
  switch (personality.soundProfile) {
    case 'ambient_checklist':
      // Only play on completion events
      return ['step_complete', 'success'].includes(trigger)
    
    case 'glitch_comm':
      // Play on any event (chaotic)
      return true
    
    case 'procedural_hum':
      // Play on system events
      return ['system_ready', 'step_unlocked'].includes(trigger)
    
    default:
      return false
  }
}

/**
 * Get sound file path for a profile
 * 
 * Maps sound profile to actual audio file
 */
export function getSoundFilePath(profile: 'checklist' | 'glitch' | 'hum'): string {
  const soundMap = {
    checklist: '/sounds/checklist.mp3',
    glitch: '/sounds/glitch.mp3',
    hum: '/sounds/hum.mp3'
  }
  
  return soundMap[profile]
}
