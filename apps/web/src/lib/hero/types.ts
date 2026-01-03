/**
 * Hero Copy Contract
 * 
 * This is not content. This is guardrails.
 * 
 * These constraints govern how AI writes hero copy,
 * resolved from personality and hero behavior.
 * 
 * Notice:
 * - No brand names
 * - No copy strings
 * - Just rules
 */

export type HeroCopyContract = {
  /**
   * Headline length constraint
   * 
   * - short: Fractured, punchy (AI Meltdown style)
   * - medium: Standard confidence-driven headline
   */
  headlineLength: 'short' | 'medium'

  /**
   * Subcopy density
   * 
   * - minimal: Get to the point (Anti-Guru style)
   * - explained: Mentor-style elaboration (Rocket Future)
   */
  subcopyDensity: 'minimal' | 'explained'

  /**
   * Allow sarcastic tone
   * 
   * Comes from behavior.allowGlitch, not from brand name
   */
  allowSarcasm: boolean

  /**
   * Forbid promise-based copy
   * 
   * Universal constraint: we don't promise outcomes
   * This is core brand integrity
   */
  forbidPromises: boolean
}
