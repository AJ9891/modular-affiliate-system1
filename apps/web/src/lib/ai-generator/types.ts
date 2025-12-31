/**
 * AI Generator Types
 * 
 * Contract for AI prompt construction.
 * This separates behavior from prose.
 */

export type BrandModeId =
  | 'ai_meltdown'
  | 'anti_guru'
  | 'rocket_future';

/**
 * AI Prompt Profile
 * 
 * Defines how the AI should behave, not what it should say.
 * 
 * Important distinction:
 * - system: worldview + posture
 * - principles: how it behaves
 * - forbidden: what it must never do
 * 
 * This enforces Anti-Guru without relying on vibes.
 */
export interface AIPromptProfile {
  /**
   * System message: worldview + posture
   * 
   * This sets the AI's fundamental stance.
   * Not instructions - identity.
   */
  system: string

  /**
   * Behavioral principles
   * 
   * These govern HOW the AI communicates.
   * Not rules - values.
   */
  principles: string[]

  /**
   * Forbidden patterns
   * 
   * Hard constraints on what the AI must never do.
   * This is how you enforce brand integrity.
   */
  forbidden: string[]
}

// Legacy types (deprecated - use AIPromptProfile)
export interface BrandPersonality {
  id: BrandModeId;

  uiTone: {
    voiceHint: string;
    helperTextStyle: 'sarcastic' | 'neutral' | 'encouraging';
  };

  visuals: {
    background: 'dark' | 'light' | 'gradient';
    accentColor: string;
    borderStyle: 'soft' | 'sharp' | 'glitch';
  };

  motion: {
    hover: 'none' | 'subtle' | 'playful';
    transitions: 'instant' | 'smooth' | 'energetic';
  };

  copyRules: {
    avoids: string[];
    favors: string[];
  };
}

export interface PromptContext {
  productName: string;
  audience: string;
  goal: string;
  pageType: 'hero' | 'section' | 'cta';
}

export interface ResolvedPrompt {
  system: string;
  user: string;
}

/**
 * AI Generation Request
 * 
 * Structure for making AI calls with personality
 */
export interface AIGenerationRequest {
  system: string
  rules: string[]
  forbidden: string[]
  userPrompt: string
  context?: Record<string, any>
}

/**
 * AI Generation Response
 */
export interface AIGenerationResponse {
  content: string
  tokensUsed?: number
  model?: string
}
