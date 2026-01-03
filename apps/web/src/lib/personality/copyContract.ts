/**
 * Copy Contract System
 * 
 * Translates behavior → language constraints
 * This is the bridge most systems skip.
 * 
 * Without this, AI gets confused about why copy feels "off".
 * With this, AI knows exactly what posture to maintain.
 */

import type { PersonalityProfile } from './types'
import type { HeroBehavior } from './heroBehavior'

/**
 * Copy Contract: Language rules for content generation
 * 
 * This defines HOW copy can be written, not WHAT it says.
 * Think of it as grammar rules for personality.
 */
export interface CopyContract {
  // Structural rules
  maxHeadlineWords: number
  maxSubcopyWords: number
  maxCtaWords: number
  
  // Tone rules
  allowExclamation: boolean
  allowQuestions: boolean
  allowFirstPerson: boolean
  allowSecondPerson: boolean
  
  // Style rules
  requireShortSentences: boolean
  allowFragmentedSentences: boolean
  allowRepetition: boolean
  
  // Emphasis rules
  allowAllCaps: boolean
  allowBoldForEmphasis: boolean
  allowItalicsForEmphasis: boolean
  
  // Content rules
  requireBenefit: boolean
  allowFeatureList: boolean
  allowSocialProof: boolean
  allowUrgency: boolean
  
  // Forbidden patterns
  forbiddenWords: string[]
  forbiddenPhrases: string[]
  
  // Required patterns
  requiredTone: 'urgent' | 'calm' | 'matter-of-fact' | 'conspiratorial'
  requiredVoice: 'authoritative' | 'peer' | 'chaotic'
}

/**
 * Resolve Hero Copy Contract
 * 
 * Takes behavior and personality → generates language constraints
 */
export function resolveHeroCopyContract(
  behavior: HeroBehavior,
  personality: PersonalityProfile
): CopyContract {
  // Headline length rules based on behavior
  const maxHeadlineWords = (() => {
    if (behavior.headlineStyle === 'fractured') return 8
    if (behavior.headlineStyle === 'flat') return 6
    return 12
  })()

  // Subcopy length rules
  const maxSubcopyWords = (() => {
    if (behavior.subcopyStyle === 'minimal') return 15
    if (behavior.subcopyStyle === 'resistant') return 25
    return 40
  })()

  // CTA length rules
  const maxCtaWords = (() => {
    if (behavior.emphasizeUrgency) return 3
    return 4
  })()

  // Tone permissions
  const allowExclamation = personality.humorDensity === 'glitchy' ||
                           behavior.emphasizeUrgency

  const allowQuestions = personality.trustPosture === 'peer' ||
                         personality.trustPosture === 'co-conspirator'

  const allowFirstPerson = personality.trustPosture === 'co-conspirator'
  const allowSecondPerson = true // almost always allowed

  // Style permissions
  const requireShortSentences = personality.authorityTone === 'blunt' ||
                                personality.humorDensity === 'glitchy'

  const allowFragmentedSentences = personality.humorDensity === 'glitchy' ||
                                   behavior.headlineStyle === 'fractured'

  const allowRepetition = behavior.emphasizeUrgency

  // Emphasis rules
  const allowAllCaps = personality.humorDensity === 'glitchy'
  const allowBoldForEmphasis = personality.authorityTone === 'blunt'
  const allowItalicsForEmphasis = personality.authorityTone === 'calm'

  // Content rules
  const requireBenefit = personality.trustPosture === 'peer'
  const allowFeatureList = personality.trustPosture === 'mentor'
  const allowSocialProof = personality.authorityTone !== 'unraveling'
  const allowUrgency = behavior.emphasizeUrgency

  // Forbidden words/phrases from personality vocabulary
  const forbiddenWords = personality.vocabulary?.forbiddenPhrases || []

  // Additional universal forbidden patterns
  const universalForbidden = [
    'click here',
    'sign up now',
    'limited time only',
    'don\'t miss out'
  ]

  const forbiddenPhrases = [...forbiddenWords, ...universalForbidden]

  // Required tone based on personality
  const requiredTone = (() => {
    if (behavior.emphasizeUrgency) return 'urgent'
    if (personality.authorityTone === 'blunt') return 'matter-of-fact'
    if (personality.trustPosture === 'co-conspirator') return 'conspiratorial'
    return 'calm'
  })() as CopyContract['requiredTone']

  // Required voice based on personality
  const requiredVoice = (() => {
    if (personality.authorityTone === 'unraveling') return 'chaotic'
    if (personality.trustPosture === 'mentor') return 'authoritative'
    return 'peer'
  })() as CopyContract['requiredVoice']

  return {
    maxHeadlineWords,
    maxSubcopyWords,
    maxCtaWords,
    allowExclamation,
    allowQuestions,
    allowFirstPerson,
    allowSecondPerson,
    requireShortSentences,
    allowFragmentedSentences,
    allowRepetition,
    allowAllCaps,
    allowBoldForEmphasis,
    allowItalicsForEmphasis,
    requireBenefit,
    allowFeatureList,
    allowSocialProof,
    allowUrgency,
    forbiddenWords,
    forbiddenPhrases,
    requiredTone,
    requiredVoice
  }
}

/**
 * Resolve Feature Copy Contract
 * 
 * Features need different constraints than heroes
 */
export function resolveFeatureCopyContract(
  personality: PersonalityProfile
): CopyContract {
  // Features are more explanatory, allow longer copy
  const maxHeadlineWords = personality.authorityTone === 'blunt' ? 5 : 8
  const maxSubcopyWords = personality.interaction?.verbosity === 'terse' ? 30 : 60
  const maxCtaWords = 5

  return {
    maxHeadlineWords,
    maxSubcopyWords,
    maxCtaWords,
    allowExclamation: personality.humorDensity !== 'none',
    allowQuestions: personality.trustPosture === 'peer',
    allowFirstPerson: false,
    allowSecondPerson: true,
    requireShortSentences: personality.interaction?.verbosity === 'terse',
    allowFragmentedSentences: personality.humorDensity === 'glitchy',
    allowRepetition: false,
    allowAllCaps: personality.humorDensity === 'glitchy',
    allowBoldForEmphasis: true,
    allowItalicsForEmphasis: false,
    requireBenefit: true,
    allowFeatureList: true,
    allowSocialProof: true,
    allowUrgency: false,
    forbiddenWords: personality.vocabulary?.forbiddenPhrases || [],
    forbiddenPhrases: personality.vocabulary?.forbiddenPhrases || [],
    requiredTone: personality.authorityTone === 'blunt' ? 'matter-of-fact' : 'calm',
    requiredVoice: personality.trustPosture === 'mentor' ? 'authoritative' : 'peer'
  }
}

/**
 * Resolve Error Copy Contract
 * 
 * Errors need empathy constraints
 */
export function resolveErrorCopyContract(
  personality: PersonalityProfile
): CopyContract {
  return {
    maxHeadlineWords: 6,
    maxSubcopyWords: 20,
    maxCtaWords: 3,
    allowExclamation: false,
    allowQuestions: false,
    allowFirstPerson: personality.trustPosture === 'co-conspirator',
    allowSecondPerson: true,
    requireShortSentences: true,
    allowFragmentedSentences: false,
    allowRepetition: false,
    allowAllCaps: false,
    allowBoldForEmphasis: false,
    allowItalicsForEmphasis: false,
    requireBenefit: false,
    allowFeatureList: false,
    allowSocialProof: false,
    allowUrgency: false,
    forbiddenWords: ['error', 'failed', 'broken', 'wrong'],
    forbiddenPhrases: ['something went wrong', 'oops', 'try again'],
    requiredTone: personality.interaction?.errorHandling === 'matter-of-fact' 
      ? 'matter-of-fact' 
      : 'calm',
    requiredVoice: 'peer'
  }
}

/**
 * Validate copy against contract
 * 
 * Check if generated copy follows the contract rules
 */
export function validateCopy(
  copy: string,
  contract: CopyContract,
  type: 'headline' | 'subcopy' | 'cta'
): { valid: boolean; violations: string[] } {
  const violations: string[] = []

  // Check word count
  const wordCount = copy.split(/\s+/).length
  const maxWords = type === 'headline' 
    ? contract.maxHeadlineWords
    : type === 'subcopy'
    ? contract.maxSubcopyWords
    : contract.maxCtaWords

  if (wordCount > maxWords) {
    violations.push(`Exceeds maximum ${maxWords} words (got ${wordCount})`)
  }

  // Check forbidden patterns
  const lowerCopy = copy.toLowerCase()
  for (const phrase of contract.forbiddenPhrases) {
    if (lowerCopy.includes(phrase.toLowerCase())) {
      violations.push(`Contains forbidden phrase: "${phrase}"`)
    }
  }

  // Check exclamation
  if (!contract.allowExclamation && copy.includes('!')) {
    violations.push('Exclamation marks not allowed')
  }

  // Check all caps (excluding acronyms)
  if (!contract.allowAllCaps) {
    const words = copy.split(/\s+/)
    const allCapsWords = words.filter(w => 
      w.length > 3 && w === w.toUpperCase() && /^[A-Z]+$/.test(w)
    )
    if (allCapsWords.length > 0) {
      violations.push(`All caps not allowed: ${allCapsWords.join(', ')}`)
    }
  }

  // Check questions
  if (!contract.allowQuestions && copy.includes('?')) {
    violations.push('Questions not allowed')
  }

  return {
    valid: violations.length === 0,
    violations
  }
}
