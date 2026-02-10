/**
 * Personality System - Single Source of Truth
 * 
 * This file defines the behavioral rules for the entire platform.
 * It does NOT contain colors, fonts, or images.
 * It contains permission rules for how the platform speaks, moves, and feels.
 */

export type BrandMode = 'ai_meltdown' | 'anti_guru' | 'rocket_future';

/**
 * Authority Tone: How the platform asserts itself
 */
export type AuthorityTone = 
  | 'calm'       // Steady, confident, reassuring
  | 'blunt'      // Direct, no-nonsense
  | 'unraveling' // Unstable, chaotic
  | 'sarcastic'
  | 'brutally_honest'
  | 'encouraging';

/**
 * Confidence Posture: How certain the platform appears
 */
export type ConfidencePosture = 
  | 'absolute'       // Never doubts, always certain
  | 'measured'       // Confident but acknowledges complexity
  | 'exploratory'    // Open-ended, curious
  | 'self-aware';    // Acknowledges its own limitations

/**
 * Humor Density: How much the platform jokes around
 */
export type HumorDensity = 
  | 'none'      // No jokes, all business
  | 'dry'       // Subtle, sarcastic wit
  | 'glitchy'   // Unpredictable, absurdist
  | 'heavy'
  | 'light';

/**
 * Motion Profile: How the interface moves
 * Behavioral primitive, not animation library
 */
export type MotionProfile = 
  | 'calm'          // Deliberate, smooth, predictable
  | 'flat'          // Minimal or no motion
  | 'unstable'      // Jittery, unpredictable, chaotic
  | 'glitchy'
  | 'smooth';

/**
 * Ornament Level: How much visual decoration
 * Not about "style" but about restraint
 */
export type OrnamentLevel = 
  | 'none'          // Brutalist, zero decoration
  | 'light'         // Subtle hints, gentle touches
  | 'expressive'    // Full visual language, layered
  | 'satirical'
  | 'uplifting';

/**
 * Contrast Bias: Visual separation strategy
 * Not about colors, about hierarchy
 */
export type ContrastBias = 
  | 'neutral'       // Standard separation, comfortable
  | 'high'          // Sharp boundaries, clear hierarchy
  | 'broken'        // Intentional clashes, visual tension
  | 'sharp'
  | 'bright';

/**
 * Animation Budget: How much motion is allowed
 * Performance and attention constraint
 */
export type AnimationBudget = 
  | 'zero'          // No animations, instant states
  | 'micro-only'    // Only micro-interactions
  | 'low'           // Essential transitions only
  | 'medium'
  | 'satisfying';

/**
 * Spatial Rhythm: How content flows through space
 */
export type SpatialRhythm = 
  | 'generous'      // Lots of breathing room
  | 'standard'      // Balanced, familiar
  | 'compressed'    // Tight, information-dense
  | 'edgy'
  | 'flowing';

/**
 * Sound Profile: Governed sound behavior
 * Sound is now governed, not sprinkled.
 */
export type SoundProfile = 
  | 'none'                // Silent
  | 'ambient_checklist'   // Subtle task completion sounds
  | 'glitch_comm'         // Digital glitch/interference audio
  | 'procedural_hum';     // Algorithmic ambient hum

/**
 * Trust Posture: The relationship dynamic with the user
 */
export type TrustPosture = 
  | 'mentor'         // Expert guiding you
  | 'peer'           // Equal partner
  | 'co-conspirator' // We're in this together
  | 'skeptical-peer'
  | 'truth-teller'
  | 'supportive-coach';

/**
 * Vocabulary Rules: What language patterns are allowed
 */
export interface VocabularyRules {
  allowEmojis: boolean;
  allowSlang: boolean;
  allowTechJargon: boolean;
  allowMetaphors: boolean;
  forbiddenPhrases: string[];  // e.g., "just", "simply", "obviously"
  preferredPhrases: string[];   // e.g., "here's how", "let's build"
}

/**
 * Interaction Rules: How the platform responds to user actions
 */
export interface InteractionRules {
  responseSpeed: 'instant' | 'deliberate' | 'variable' | 'witty' | 'energetic';
  verbosity: 'terse' | 'balanced' | 'verbose' | 'conversational' | 'direct' | 'encouraging';
  proactivity: 'reactive' | 'suggestive' | 'pushy' | 'satirical' | 'confrontational' | 'motivational';
  errorHandling: 'apologetic' | 'matter-of-fact' | 'encouraging' | 'sarcastic-acknowledgment' | 'brutally-honest' | 'solution-focused';
}

/**
 * Content Generation Rules: How AI creates content
 */
export interface ContentGenerationRules {
  paragraphLength: 'short' | 'medium' | 'long';
  sentenceStructure: 'simple' | 'varied' | 'complex' | 'conversational' | 'direct' | 'energetic';
  callToActionStyle: 'soft' | 'direct' | 'urgent' | 'reverse-psychology' | 'brutally-honest' | 'momentum-focused';
  storytellingMode: 'none' | 'minimal' | 'narrative-driven' | 'satirical' | 'reality-check' | 'progress-driven';
}

/**
 * Visual Behavior Rules: How the interface appears and feels
 * 
 * CRITICAL: These are behavioral primitives, not CSS values.
 * They describe HOW to behave, not WHAT colors to use.
 * 
 * Visual personality:
 * - Changes how things appear
 * - Reinforces the tone user chose
 * - Makes platform feel cohesive
 * 
 * Visual personality NEVER:
 * - Changes user data
 * - Changes funnel logic
 * - Changes AI output rules
 */
export interface VisualBehaviorRules {
  motionProfile: MotionProfile;         // How things move
  ornamentLevel: OrnamentLevel;         // How much decoration
  contrastBias: ContrastBias;           // Visual separation strategy
  animationBudget: AnimationBudget;     // How much motion allowed
  spatialRhythm: SpatialRhythm;         // Content flow through space
}

/**
 * PersonalityProfile: The complete behavioral blueprint
 * 
 * This is the single source of truth for how the platform behaves.
 * Every system (UI, AI, motion, sound) reads from this object.
 * 
 * Simplified: Focus on core behavioral rules that govern everything.
 */
export interface PersonalityProfile {
  // Core identity
  mode: BrandMode;
  name: string;
  description: string;

  // Core behavioral rules
  authorityTone: AuthorityTone;
  humorDensity: HumorDensity;
  trustPosture: TrustPosture;
  soundProfile: SoundProfile;

  // Visual behavior (ambient agreement with chosen tone)
  visuals: VisualBehaviorRules;

  // Extended rules (optional for deeper customization)
  vocabulary?: VocabularyRules;
  interaction?: InteractionRules;
  contentGeneration?: ContentGenerationRules;

  // System hints (for AI and automation)
  systemPromptSuffix?: string;  // Appended to all AI prompts
  fallbackBehavior?: 'neutral' | 'maintain-character' | 'escalate' | 'maintain-sarcasm' | 'maintain-brutal-honesty' | 'maintain-encouragement';
}

/**
 * Type guard to check if a string is a valid BrandMode
 */
export function isBrandMode(value: unknown): value is BrandMode {
  return (
    typeof value === 'string' &&
    ['ai_meltdown', 'anti_guru', 'rocket_future'].includes(value)
  );
}

/**
 * Default personality when brand_mode is null or unknown
 */
export const DEFAULT_BRAND_MODE: BrandMode = 'anti_guru';

/**
 * Personality Context: Route-aware modulation
 * 
 * This tells the UI how much personality to express based on WHERE the user is.
 * Context modulates personality, it doesn't replace it.
 * 
 * visualWeight: How much personality should show
 * - 'none': Invisible, pure function
 * - 'low': Minimal hints, respectful
 * - 'medium': Balanced expression
 * - 'high': Full personality presence
 * 
 * motionAllowed: Can UI elements animate?
 * soundAllowed: Can sounds play?
 * forceBrandMode: Hard override (use sparingly, only for sacred zones)
 */
export type PersonalityContext = {
  visualWeight: 'none' | 'low' | 'medium' | 'high';
  motionAllowed: boolean;
  soundAllowed: boolean;
  forceBrandMode?: BrandMode;
};
