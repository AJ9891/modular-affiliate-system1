/**
 * Personality System - Public API
 * 
 * Clean barrel export for the personality system.
 * Updated to use canonical personality definitions.
 */

// Types
export type {
  BrandMode,
  AuthorityTone,
  HumorDensity,
  MotionProfile,
  OrnamentLevel,
  ContrastBias,
  AnimationBudget,
  SpatialRhythm,
  SoundProfile,
  TrustPosture,
  VocabularyRules,
  InteractionRules,
  ContentGenerationRules,
  VisualBehaviorRules,
  PersonalityProfile,
  PersonalityContext
} from './types';

// Canonical Personality System
export {
  CANONICAL_PERSONALITIES,
  GLITCH_PERSONALITY,
  ANCHOR_PERSONALITY,
  BOOST_PERSONALITY,
  getPersonalityByTrait,
  validatePersonalityContract,
  type PersonalityId
} from './canonical-definitions';

// Canonical AI System
export {
  buildCanonicalAIProfile,
  resolveCanonicalAIProfile,
  buildAIPrompt,
  validateAIPromptAlignment,
  type CanonicalAIProfile
} from './canonical-ai-resolver';

// Brand Brain System
export {
  validateBrandBrainAlignment,
  validateAllPersonalityProfiles,
  checkPersonalityAlignment,
  generateValidationReport
} from '../brand-brain/validation';

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

// Expression resolvers - Components ask: "How should I behave?"
export type {
  VisualTokens,
  MotionTokens
} from './resolvers';

export {
  resolveVisualTokens,
  resolveMotionTokens,
  resolveToneProfile,
  resolveSoundProfile,
  resolveIconStyle,
  getPersonalityContext,
  // Legacy aliases
  resolveVisualProfile,
  resolveMotionProfile
} from './resolvers';

// React integration
export {
  PersonalityProvider,
  usePersonality,
  withPersonality,
  usePersonalityMotion,
  usePersonalitySound,
  usePersonalityValidation,
  usePersonalityExpression // NEW: Context-aware hook for visual/motion/sound
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
