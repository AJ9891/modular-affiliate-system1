/**
 * Personality System - Public API
 * 
 * Clean barrel export for the personality system.
 * Import everything you need from here.
 */

// Types
export type {
  BrandMode,
  AuthorityTone,
  HumorDensity,
  MotionStyle,
  SoundProfile,
  TrustPosture,
  VocabularyRules,
  InteractionRules,
  ContentGenerationRules,
  PersonalityProfile
} from './types';

export { 
  isBrandMode, 
  DEFAULT_BRAND_MODE 
} from './types';

// Resolver
export {
  resolvePersonality,
  getAllPersonalities,
  validateContent,
  getSystemPrompt
} from './resolvePersonality';

// React integration
export {
  PersonalityProvider,
  usePersonality,
  withPersonality,
  usePersonalityMotion,
  usePersonalitySound,
  usePersonalityValidation
} from './PersonalityContext';

// Domain-specific resolvers
export type {
  HeroBehavior
} from './heroBehavior';

export {
  resolveHeroBehavior,
  getHeroClasses,
  getHeroAnimationVariants,
  getHeroGlitchParams
} from './heroBehavior';

// Sound system
export type {
  SoundBehavior,
  SoundTrigger
} from './soundBehavior';

export {
  resolveSoundBehavior,
  shouldPlaySound,
  getSoundFilePath
} from './soundBehavior';
