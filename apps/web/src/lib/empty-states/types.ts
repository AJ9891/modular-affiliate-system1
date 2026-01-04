/**
 * Empty States & Errors - Type Contracts
 * 
 * Governing rule: Empty states and errors express personality without
 * increasing cognitive load. They are reassurance, orientation, and containment.
 */

export type EmptyStateTone = 
  | 'neutral'           // anti_guru - calm, competent, non-judgmental
  | 'encouraging'       // rocket_future - directional, forward motion
  | 'contained-chaos'   // ai_meltdown - acknowledge chaos without becoming chaos

export type EmptyStateSeverity = 
  | 'info'      // Empty-but-expected: new project, no data yet
  | 'warning'   // Recoverable: validation errors, rate limits
  | 'error'     // Hard errors: auth failure, 500s, corrupted state

export type EmptyStateCategory = 
  | 'empty-expected'      // New project, first-time builder
  | 'empty-unexpected'    // Data failed to load, API returned nothing
  | 'recoverable-error'   // Validation errors, rate limits, partial failures
  | 'hard-error'          // Auth failure, 500s, corrupted state

export interface EmptyStateContract {
  tone: EmptyStateTone
  headline: string
  body?: string
  primaryAction?: {
    label: string
    onClick: () => void
  }
  secondaryAction?: {
    label: string
    onClick: () => void
  }
  severity: EmptyStateSeverity
  category: EmptyStateCategory
}

/**
 * Visual expression profile for empty states
 * Derived from UIExpressionProfile
 */
export interface EmptyStateVisuals {
  motionIntensity: 'none' | 'subtle' | 'medium'
  visualNoise: 'minimal' | 'balanced' | 'expressive'
  allowMetaphor: boolean
  allowGlitch: boolean
  iconStyle: 'static' | 'animated'
}

/**
 * Personality bandwidth by category
 * Different categories allow different personality expression
 */
export type PersonalityBandwidth = 
  | 'full'      // Empty-expected: full personality allowed
  | 'reduced'   // Empty-unexpected: reduced personality
  | 'minimal'   // Recoverable-error: minimal personality
  | 'none'      // Hard-error: no personality, pure clarity
