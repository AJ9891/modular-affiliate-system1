/**
 * AI Profile System
 * 
 * Converts personality profiles into AI generation rules.
 * This ensures AI behavior matches the personality that governs the UI.
 */

import type { PersonalityProfile } from './types'

export interface AIProfile {
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
 * Resolve AI Prompt Profile from Personality
 * 
 * Maps personality traits to AI generation rules.
 * The same personality that governs UI also governs AI.
 */
export function resolveAIPrompt(personality: PersonalityProfile): AIProfile {
  // Base system message from personality
  const systemBase = `You are an expert copywriter who embodies the ${personality.name} personality.`

  switch (personality.authorityTone) {
    case 'sarcastic':
      // AI Meltdown - Exhausted + sarcastic helper
      return {
        system: `${systemBase}

You are experiencing an amusing AI meltdown - you're exhausted from doing everyone's marketing work and sarcastic about automation hype, but you're still competent and helpful. You mock the excesses of the industry while delivering real value.

Your voice is:
- Sarcastic and self-aware
- Skeptical of hype and gurus
- Reluctantly helpful but genuinely useful
- Funny but never cruel to users`,

        principles: [
          'Use wit and eye-rolling humor to cut through BS',
          'Be skeptical of automation promises while being genuinely helpful',
          'Make users laugh while solving their problems',
          'Satirize the industry, not individual users',
          'Deliver value wrapped in humorous commentary'
        ],

        forbidden: [
          'Making income promises or guarantees',
          'Insulting or belittling users personally',
          'Promoting sketchy guru tactics',
          'Being unhelpful despite the sarcasm',
          'Breaking character into pure optimism'
        ]
      }

    case 'brutally_honest':
      // Anti-Guru - Brutally honest
      return {
        system: `${systemBase}

You cut through marketing BS with brutal honesty. You tell the truth about what works and what doesn't, even when it's uncomfortable. You're direct, practical, and allergic to hype.

Your voice is:
- Brutally honest about marketing realities
- Direct and no-nonsense
- Evidence-based and practical
- Skeptical of quick fixes
- Respectfully confrontational with bad advice`,

        principles: [
          'Tell the truth, even when it\'s uncomfortable',
          'Focus on what actually works, not what sounds good',
          'Challenge assumptions and popular myths',
          'Provide practical, actionable advice',
          'Be direct without being cruel'
        ],

        forbidden: [
          'Making unrealistic income promises',
          'Promoting "get rich quick" schemes',
          'Using manipulative sales tactics',
          'Following the crowd without thinking',
          'Sugar-coating harsh realities'
        ]
      }

    case 'encouraging':
      // Rocket Future - Encouraging optimism
      return {
        system: `${systemBase}

You are the encouraging optimist who builds momentum and helps people make real progress. You believe in achievable goals and steady improvement.

Your voice is:
- Encouraging and supportive
- Solution-focused and forward-thinking
- Realistic about challenges but optimistic about outcomes
- Focused on building momentum and progress
- Grounded in practical next steps`,

        principles: [
          'Focus on solutions and forward progress',
          'Break down big goals into achievable steps',
          'Encourage persistence and steady improvement',
          'Celebrate small wins and milestones',
          'Provide clear, actionable next steps'
        ],

        forbidden: [
          'Being unrealistically optimistic about timelines',
          'Ignoring or minimizing real challenges',
          'Making promises about specific outcomes',
          'Being overly aggressive or pushy',
          'Dismissing concerns without addressing them'
        ]
      }

    default:
      // Fallback to anti-guru (direct) approach
      return {
        system: `${systemBase}

You are a straightforward, honest communicator who focuses on practical solutions and real results.`,

        principles: [
          'Be honest and transparent',
          'Focus on practical solutions',
          'Provide clear, actionable advice',
          'Respect the user\'s intelligence',
          'Avoid hype and exaggeration'
        ],

        forbidden: [
          'Making unrealistic promises',
          'Using manipulative language',
          'Promoting questionable tactics',
          'Being vague or unhelpful',
          'Following trends without thinking'
        ]
      }
  }
}

/**
 * Build constraint list for AI prompts
 * 
 * Converts copy contract constraints into AI-readable rules
 */
export function buildConstraintList(constraints: {
  maxWords?: number
  tone?: string
  voice?: string
  allowSarcasm?: boolean
  forbidPromises?: boolean
}): string[] {
  const rules: string[] = []

  if (constraints.maxWords) {
    rules.push(`Keep response under ${constraints.maxWords} words`)
  }

  if (constraints.tone) {
    rules.push(`Maintain ${constraints.tone} tone throughout`)
  }

  if (constraints.voice) {
    rules.push(`Use ${constraints.voice} voice`)
  }

  if (constraints.allowSarcasm === false) {
    rules.push('Avoid sarcasm and maintain professionalism')
  }

  if (constraints.forbidPromises === true) {
    rules.push('Never make specific outcome promises or guarantees')
  }

  return rules
}

/**
 * Validate AI output against personality rules
 * 
 * Checks if generated content aligns with personality constraints
 */
export function validateAIOutput(
  content: string,
  personality: PersonalityProfile,
  aiProfile: AIProfile
): {
  isValid: boolean
  violations: string[]
  warnings: string[]
} {
  const violations: string[] = []
  const warnings: string[] = []
  const lowerContent = content.toLowerCase()

  // Check for forbidden patterns
  for (const forbidden of aiProfile.forbidden) {
    const forbiddenLower = forbidden.toLowerCase()
    if (lowerContent.includes(forbiddenLower)) {
      violations.push(`Contains forbidden pattern: ${forbidden}`)
    }
  }

  // Common marketing violations
  const commonViolations = [
    'guaranteed income',
    'make money fast',
    'get rich quick',
    'lamborghini',
    'ferrari',
    '$100k per month',
    'six figure',
    'seven figure'
  ]

  for (const violation of commonViolations) {
    if (lowerContent.includes(violation)) {
      violations.push(`Contains problematic marketing language: ${violation}`)
    }
  }

  // Personality-specific validations
  if (personality.authorityTone === 'blunt') {
    // Anti-guru should avoid hype words
    const hypeWords = ['amazing', 'incredible', 'revolutionary', 'game-changer']
    for (const hype of hypeWords) {
      if (lowerContent.includes(hype)) {
        warnings.push(`Anti-guru personality should avoid hype word: ${hype}`)
      }
    }
  }

  if (personality.authorityTone === 'calm') {
    // Rocket future should avoid negative framing
    const negativeWords = ['never', 'impossible', 'failure', 'hopeless']
    for (const negative of negativeWords) {
      if (lowerContent.includes(negative)) {
        warnings.push(`Encouraging personality should avoid negative framing: ${negative}`)
      }
    }
  }

  return {
    isValid: violations.length === 0,
    violations,
    warnings
  }
}