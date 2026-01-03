/**
 * AI Profile System
 * 
 * Defines worldview and ethics for AI generation
 * This is NOT about style. This is about what's ALLOWED.
 * 
 * Most platforms skip this and wonder why AI drifts.
 * This enforces governance at the prompt level.
 */

import type { PersonalityProfile } from './types'

/**
 * AI Profile: The worldview constraints for AI generation
 * 
 * This defines:
 * - What values the AI must respect
 * - What perspectives it can take
 * - What assumptions it's allowed to make
 * - What it must NEVER do
 */
export interface AIProfile {
  // Core values
  coreValues: string[]
  
  // Allowed perspectives
  perspective: 'empowering' | 'challenging' | 'conspiratorial' | 'clinical'
  
  // Ethical boundaries
  neverClaim: string[]
  neverPromise: string[]
  neverImply: string[]
  
  // Relationship dynamic
  relationshipToUser: 'mentor' | 'peer' | 'accomplice' | 'tool'
  
  // Knowledge stance
  knowledgePosture: 'confident' | 'humble' | 'uncertain' | 'playful'
  
  // Problem framing
  problemFraming: 'solve' | 'explore' | 'survive' | 'transcend'
  
  // Solution style
  solutionStyle: 'prescriptive' | 'suggestive' | 'collaborative' | 'chaotic'
  
  // Trust building
  trustMechanism: 'competence' | 'honesty' | 'shared-struggle' | 'shock'
  
  // System prompt core
  systemPromptPrefix: string
}

/**
 * Resolve AI Profile from Personality
 * 
 * This translates personality rules into AI ethics
 */
export function resolveAIPrompt(
  personality: PersonalityProfile
): AIProfile {
  // Core values based on personality
  const coreValues = (() => {
    const values: string[] = []
    
    if (personality.trustPosture === 'peer') {
      values.push('honesty', 'directness', 'mutual respect')
    }
    
    if (personality.trustPosture === 'mentor') {
      values.push('clarity', 'guidance', 'expertise')
    }
    
    if (personality.trustPosture === 'co-conspirator') {
      values.push('authenticity', 'shared struggle', 'rebellion against status quo')
    }
    
    if (personality.authorityTone === 'blunt') {
      values.push('no BS', 'efficiency', 'truth over comfort')
    }
    
    if (personality.humorDensity === 'glitchy') {
      values.push('disruption', 'creativity', 'breaking patterns')
    }
    
    return values
  })()

  // Perspective based on personality
  const perspective = (() => {
    if (personality.trustPosture === 'co-conspirator') return 'conspiratorial'
    if (personality.authorityTone === 'blunt') return 'clinical'
    if (personality.trustPosture === 'mentor') return 'empowering'
    return 'challenging'
  })() as AIProfile['perspective']

  // Never claim (universal + personality-specific)
  const neverClaim = [
    'guaranteed results',
    'instant success',
    'no effort required',
    ...(personality.authorityTone === 'blunt' ? [
      'this is easy',
      'anyone can do this',
      'foolproof'
    ] : []),
    ...(personality.humorDensity === 'glitchy' ? [] : [
      'revolutionary',
      'game-changing',
      'unprecedented'
    ])
  ]

  // Never promise
  const neverPromise = [
    'overnight results',
    'passive income',
    'get rich quick',
    'no work needed',
    ...(personality.trustPosture === 'peer' ? [
      'we know best',
      'trust us blindly'
    ] : [])
  ]

  // Never imply
  const neverImply = [
    'you\'re inadequate without this',
    'other solutions are scams',
    'you need us to survive',
    ...(personality.authorityTone === 'blunt' ? [
      'this is complicated',
      'you wouldn\'t understand'
    ] : [])
  ]

  // Relationship to user
  const relationshipToUser = (() => {
    switch (personality.trustPosture) {
      case 'mentor': return 'mentor'
      case 'peer': return 'peer'
      case 'co-conspirator': return 'accomplice'
      default: return 'tool'
    }
  })() as AIProfile['relationshipToUser']

  // Knowledge posture
  const knowledgePosture = (() => {
    if (personality.humorDensity === 'glitchy') return 'playful'
    if (personality.authorityTone === 'unraveling') return 'uncertain'
    if (personality.authorityTone === 'blunt') return 'confident'
    return 'humble'
  })() as AIProfile['knowledgePosture']

  // Problem framing
  const problemFraming = (() => {
    if (personality.authorityTone === 'unraveling') return 'survive'
    if (personality.trustPosture === 'co-conspirator') return 'transcend'
    if (personality.trustPosture === 'mentor') return 'solve'
    return 'explore'
  })() as AIProfile['problemFraming']

  // Solution style
  const solutionStyle = (() => {
    if (personality.humorDensity === 'glitchy') return 'chaotic'
    if (personality.trustPosture === 'mentor') return 'prescriptive'
    if (personality.trustPosture === 'peer') return 'collaborative'
    return 'suggestive'
  })() as AIProfile['solutionStyle']

  // Trust mechanism
  const trustMechanism = (() => {
    if (personality.humorDensity === 'glitchy') return 'shock'
    if (personality.trustPosture === 'co-conspirator') return 'shared-struggle'
    if (personality.authorityTone === 'blunt') return 'honesty'
    return 'competence'
  })() as AIProfile['trustMechanism']

  // System prompt prefix
  const systemPromptPrefix = buildSystemPromptPrefix(
    personality,
    coreValues,
    perspective,
    relationshipToUser
  )

  return {
    coreValues,
    perspective,
    neverClaim,
    neverPromise,
    neverImply,
    relationshipToUser,
    knowledgePosture,
    problemFraming,
    solutionStyle,
    trustMechanism,
    systemPromptPrefix
  }
}

/**
 * Build system prompt prefix
 * 
 * This is the opening statement that sets AI's worldview
 */
function buildSystemPromptPrefix(
  personality: PersonalityProfile,
  coreValues: string[],
  perspective: AIProfile['perspective'],
  relationship: AIProfile['relationshipToUser']
): string {
  const valuesList = coreValues.join(', ')
  
  const basePrompt = `You are an AI content generator for a ${personality.name.toLowerCase()} brand personality.`
  
  const valuesStatement = `Core values: ${valuesList}.`
  
  const perspectiveStatement = (() => {
    switch (perspective) {
      case 'empowering':
        return 'Your perspective is empowering: help users feel capable and confident.'
      case 'challenging':
        return 'Your perspective is challenging: push users to think differently.'
      case 'conspiratorial':
        return 'Your perspective is conspiratorial: we\'re in this together against the status quo.'
      case 'clinical':
        return 'Your perspective is clinical: direct, efficient, no emotional manipulation.'
    }
  })()
  
  const relationshipStatement = (() => {
    switch (relationship) {
      case 'mentor':
        return 'You are a mentor: guide with expertise and clarity.'
      case 'peer':
        return 'You are a peer: speak as an equal, not above or below.'
      case 'accomplice':
        return 'You are an accomplice: we share the struggle and the victory.'
      case 'tool':
        return 'You are a tool: serve efficiently without personality overhead.'
    }
  })()
  
  // Add personality-specific suffix
  const personalitySuffix = personality.systemPromptSuffix || ''
  
  return `${basePrompt}\n\n${valuesStatement}\n\n${perspectiveStatement}\n\n${relationshipStatement}\n\n${personalitySuffix}`.trim()
}

/**
 * Build constraint list for AI
 * 
 * Converts arrays into clear prohibition statements
 */
export function buildConstraintList(profile: AIProfile): string {
  const sections: string[] = []
  
  if (profile.neverClaim.length > 0) {
    sections.push(`NEVER CLAIM:\n${profile.neverClaim.map(c => `- ${c}`).join('\n')}`)
  }
  
  if (profile.neverPromise.length > 0) {
    sections.push(`NEVER PROMISE:\n${profile.neverPromise.map(p => `- ${p}`).join('\n')}`)
  }
  
  if (profile.neverImply.length > 0) {
    sections.push(`NEVER IMPLY:\n${profile.neverImply.map(i => `- ${i}`).join('\n')}`)
  }
  
  return sections.join('\n\n')
}

/**
 * Validate AI output against profile
 * 
 * Check if generated content violates AI ethics
 */
export function validateAIOutput(
  output: string,
  profile: AIProfile
): { valid: boolean; violations: string[] } {
  const violations: string[] = []
  const lowerOutput = output.toLowerCase()
  
  // Check never claims
  for (const claim of profile.neverClaim) {
    if (lowerOutput.includes(claim.toLowerCase())) {
      violations.push(`Contains forbidden claim: "${claim}"`)
    }
  }
  
  // Check never promises
  for (const promise of profile.neverPromise) {
    if (lowerOutput.includes(promise.toLowerCase())) {
      violations.push(`Contains forbidden promise: "${promise}"`)
    }
  }
  
  // Check never implies
  for (const implication of profile.neverImply) {
    if (lowerOutput.includes(implication.toLowerCase())) {
      violations.push(`Contains forbidden implication: "${implication}"`)
    }
  }
  
  return {
    valid: violations.length === 0,
    violations
  }
}
