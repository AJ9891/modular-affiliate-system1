/**
 * AI Generator Types
 * 
 * Contract for AI prompt construction.
 * This separates behavior from prose.
 */

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
