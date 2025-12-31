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
  | 'unraveling'; // Unstable, chaotic

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
  | 'glitchy';  // Unpredictable, absurdist

/**
 * Motion Style: How UI elements move
 */
export type MotionStyle = 
  | 'minimal'       // Only essential transitions
  | 'procedural'    // Algorithmic, generative patterns
  | 'unstable';     // Jittery, glitchy, unpredictable

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
  | 'co-conspirator'; // We're in this together

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
  responseSpeed: 'instant' | 'deliberate' | 'variable';
  verbosity: 'terse' | 'balanced' | 'verbose';
  proactivity: 'reactive' | 'suggestive' | 'pushy';
  errorHandling: 'apologetic' | 'matter-of-fact' | 'encouraging';
}

/**
 * Content Generation Rules: How AI creates content
 */
export interface ContentGenerationRules {
  paragraphLength: 'short' | 'medium' | 'long';
  sentenceStructure: 'simple' | 'varied' | 'complex';
  callToActionStyle: 'soft' | 'direct' | 'urgent';
  storytellingMode: 'none' | 'minimal' | 'narrative-driven';
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
  motionStyle: MotionStyle;
  trustPosture: TrustPosture;
  soundProfile: SoundProfile;

  // Extended rules (optional for deeper customization)
  vocabulary?: VocabularyRules;
  interaction?: InteractionRules;
  contentGeneration?: ContentGenerationRules;

  // System hints (for AI and automation)
  systemPromptSuffix?: string;  // Appended to all AI prompts
  fallbackBehavior?: 'neutral' | 'maintain-character' | 'escalate';
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
