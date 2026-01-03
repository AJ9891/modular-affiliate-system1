/**
 * UI Expression Profiles
 * 
 * Predefined UI expression configurations for each brand mode.
 * These define HOW the brand personality expresses itself in the UI.
 */

import { UIExpressionProfile } from '@/types/ui-expression';

export const UI_PROFILES: Record<string, UIExpressionProfile> = {
  ai_meltdown: {
    hero: {
      variants: ['meltdown'],
      motionIntensity: 'high',
      visualNoise: 'expressive'
    },
    typography: {
      tone: 'fractured',
      emphasisStyle: 'strike'
    },
    surfaces: {
      depth: 'layered',
      borderStyle: 'sharp'
    },
    microInteractions: {
      hoverAllowed: true,
      glitchAllowed: true,
      pulseAllowed: false
    },
    sound: {
      ambientProfiles: ['glitch'],
      maxVolume: 0.3
    }
  },

  anti_guru: {
    hero: {
      variants: ['anti-guru'],
      motionIntensity: 'none',
      visualNoise: 'none'
    },
    typography: {
      tone: 'flat',
      emphasisStyle: 'none'
    },
    surfaces: {
      depth: 'flat',
      borderStyle: 'sharp'
    },
    microInteractions: {
      hoverAllowed: true,
      glitchAllowed: false,
      pulseAllowed: false
    },
    sound: {
      ambientProfiles: [],
      maxVolume: 0
    }
  },

  rocket_future: {
    hero: {
      variants: ['rocket'],
      motionIntensity: 'medium',
      visualNoise: 'controlled'
    },
    typography: {
      tone: 'confident',
      emphasisStyle: 'highlight'
    },
    surfaces: {
      depth: 'soft',
      borderStyle: 'rounded'
    },
    microInteractions: {
      hoverAllowed: true,
      glitchAllowed: false,
      pulseAllowed: true
    },
    sound: {
      ambientProfiles: ['checklist', 'hum'],
      maxVolume: 0.2
    }
  }
};

/**
 * Get UI expression profile by brand mode
 */
export function getUIProfile(brandMode: string): UIExpressionProfile {
  return UI_PROFILES[brandMode] || UI_PROFILES.anti_guru;
}
