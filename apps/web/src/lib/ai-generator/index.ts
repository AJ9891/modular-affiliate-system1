/**
 * AI Generator - Public API
 * 
 * Personality-governed AI content generation
 */

// New API (recommended)
export type {
  AIPromptProfile,
  AIGenerationRequest,
  AIGenerationResponse
} from './types';

export { resolveAIPrompt } from './promptResolver';
export { buildHeroPrompt } from './generateHeroCopy';

export { aiMeltdown } from './brandModes/aiMeltdown';
export { antiGuru } from './brandModes/antiGuru';
export { rocketFuture } from './brandModes/rocketFuture';

// Legacy API (deprecated)
export type {
  BrandModeId,
  BrandPersonality,
  PromptContext,
  ResolvedPrompt
} from './types';

export { resolvePrompt } from './promptResolver';
export { getBrandPersonality } from './personalityResolver';
