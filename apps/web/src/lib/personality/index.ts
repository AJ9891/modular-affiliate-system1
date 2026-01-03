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
  getHeroClasses
} from './heroBehavior';

// Copy Contract System
export type {
  CopyContract
} from './copyContract';

export {
  resolveHeroCopyContract,
  resolveFeatureCopyContract,
  resolveErrorCopyContract,
  validateCopy
} from './copyContract';

// AI Profile System
export type {
  AIProfile
} from './aiProfile';

export {
  resolveAIPrompt,
  buildConstraintList,
  validateAIOutput
} from './aiProfile';

// Prompt Builder System
export type {
  PromptConfig
} from './promptBuilder';

export {
  buildHeroPrompt,
  buildFeaturePrompt,
  buildErrorPrompt,
  buildAffiliatePrompt,
  buildOnboardingPrompt,
  generateAI
} from './promptBuilder';

// Complete Cascade Pattern
export type {
  HeroContent,
  FeatureContent,
  ErrorContent,
  AffiliateContent,
  OnboardingContent,
  EmptyStateContent
} from './cascade';

export {
  generateHeroCopy,
  generateFeatureCopy,
  generateErrorCopy,
  generateAffiliateCopy,
  generateOnboardingCopy,
  generateEmptyStateCopy,
  generateCompleteFunnel,
  previewCascade,
  getCascadeSummary
} from './cascade';

// Additional hero utilities
export {
  getHeroAnimationVariants,
  getHeroGlitchParams
} from './heroBehavior';

// Route-based personality (use sparingly)
export {
  getRoutePersonality,
  hasRouteOverride,
  getRouteOverrides
} from './routePersonality';

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
