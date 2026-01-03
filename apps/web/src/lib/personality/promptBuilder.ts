/**
 * Prompt Builder System
 * 
 * Combines AI profile + copy contract → final prompt
 * This is where governance becomes generation.
 * 
 * At this point, AI has no freedom to betray you.
 */

import type { AIProfile } from './aiProfile'
import type { CopyContract } from './copyContract'
import type { PersonalityProfile } from './types'
import { buildConstraintList } from './aiProfile'

/**
 * Prompt Configuration
 * 
 * The complete specification for AI generation
 */
export interface PromptConfig {
  system: string
  temperature: number
  maxTokens: number
  stopSequences?: string[]
}

/**
 * Build Hero Prompt
 * 
 * Combines AI profile + copy contract for hero generation
 */
export function buildHeroPrompt(
  aiProfile: AIProfile,
  copyContract: CopyContract,
  context: {
    productName: string
    niche?: string
    keyBenefit?: string
    targetAudience?: string
  }
): PromptConfig {
  const systemPrompt = buildSystemPrompt(
    aiProfile,
    copyContract,
    'hero',
    context
  )

  // Temperature based on personality chaos level
  const temperature = (() => {
    if (aiProfile.knowledgePosture === 'playful') return 0.9
    if (aiProfile.solutionStyle === 'chaotic') return 0.85
    if (aiProfile.knowledgePosture === 'confident') return 0.6
    return 0.7
  })()

  // Max tokens based on verbosity
  const maxTokens = (() => {
    const headlineTokens = Math.ceil(copyContract.maxHeadlineWords * 1.5)
    const subcopyTokens = Math.ceil(copyContract.maxSubcopyWords * 1.5)
    const ctaTokens = Math.ceil(copyContract.maxCtaWords * 1.5)
    return headlineTokens + subcopyTokens + ctaTokens + 50 // buffer
  })()

  return {
    system: systemPrompt,
    temperature,
    maxTokens,
    stopSequences: ['\n\n\n', '---']
  }
}

/**
 * Build Feature Prompt
 * 
 * Combines AI profile + copy contract for feature generation
 */
export function buildFeaturePrompt(
  aiProfile: AIProfile,
  copyContract: CopyContract,
  context: {
    featureName: string
    featureDescription?: string
    benefit?: string
  }
): PromptConfig {
  const systemPrompt = buildSystemPrompt(
    aiProfile,
    copyContract,
    'feature',
    context
  )

  const temperature = aiProfile.knowledgePosture === 'playful' ? 0.8 : 0.7

  const maxTokens = Math.ceil(
    (copyContract.maxHeadlineWords + copyContract.maxSubcopyWords) * 1.5 + 50
  )

  return {
    system: systemPrompt,
    temperature,
    maxTokens
  }
}

/**
 * Build Error Prompt
 * 
 * Combines AI profile + copy contract for error message generation
 */
export function buildErrorPrompt(
  aiProfile: AIProfile,
  copyContract: CopyContract,
  context: {
    errorType: string
    technicalDetails?: string
    recoveryAction?: string
  }
): PromptConfig {
  const systemPrompt = buildSystemPrompt(
    aiProfile,
    copyContract,
    'error',
    context
  )

  // Errors should be less creative
  const temperature = 0.5

  const maxTokens = Math.ceil(
    (copyContract.maxHeadlineWords + copyContract.maxSubcopyWords) * 1.5 + 30
  )

  return {
    system: systemPrompt,
    temperature,
    maxTokens
  }
}

/**
 * Build Affiliate Prompt
 * 
 * Combines AI profile + copy contract for affiliate page generation
 */
export function buildAffiliatePrompt(
  aiProfile: AIProfile,
  copyContract: CopyContract,
  context: {
    productName: string
    productCategory: string
    keyFeatures?: string[]
    pricePoint?: string
  }
): PromptConfig {
  const systemPrompt = buildSystemPrompt(
    aiProfile,
    copyContract,
    'affiliate',
    context
  )

  const temperature = 0.75

  const maxTokens = 500

  return {
    system: systemPrompt,
    temperature,
    maxTokens
  }
}

/**
 * Build Onboarding Prompt
 * 
 * Combines AI profile + copy contract for onboarding flow
 */
export function buildOnboardingPrompt(
  aiProfile: AIProfile,
  copyContract: CopyContract,
  context: {
    stepName: string
    stepPurpose: string
    nextAction?: string
  }
): PromptConfig {
  const systemPrompt = buildSystemPrompt(
    aiProfile,
    copyContract,
    'onboarding',
    context
  )

  const temperature = 0.6

  const maxTokens = 200

  return {
    system: systemPrompt,
    temperature,
    maxTokens
  }
}

/**
 * Build System Prompt
 * 
 * The core prompt construction logic
 */
function buildSystemPrompt(
  aiProfile: AIProfile,
  copyContract: CopyContract,
  contentType: 'hero' | 'feature' | 'error' | 'affiliate' | 'onboarding',
  context: Record<string, any>
): string {
  const sections: string[] = []

  // 1. AI Profile (worldview)
  sections.push('=== WORLDVIEW ===')
  sections.push(aiProfile.systemPromptPrefix)
  sections.push('')

  // 2. Constraints (ethics)
  sections.push('=== CONSTRAINTS ===')
  sections.push(buildConstraintList(aiProfile))
  sections.push('')

  // 3. Copy Contract (language rules)
  sections.push('=== LANGUAGE RULES ===')
  sections.push(buildCopyContractSection(copyContract))
  sections.push('')

  // 4. Content Type Specific Rules
  sections.push(`=== ${contentType.toUpperCase()} GENERATION ===`)
  sections.push(buildContentTypeRules(contentType, copyContract))
  sections.push('')

  // 5. Context
  sections.push('=== CONTEXT ===')
  sections.push(buildContextSection(context))
  sections.push('')

  // 6. Output Format
  sections.push('=== OUTPUT FORMAT ===')
  sections.push(buildOutputFormat(contentType))

  return sections.join('\n')
}

/**
 * Build Copy Contract Section
 */
function buildCopyContractSection(contract: CopyContract): string {
  const rules: string[] = []

  rules.push(`Headline: Maximum ${contract.maxHeadlineWords} words`)
  rules.push(`Subcopy: Maximum ${contract.maxSubcopyWords} words`)
  rules.push(`CTA: Maximum ${contract.maxCtaWords} words`)
  rules.push('')

  rules.push(`Tone: ${contract.requiredTone}`)
  rules.push(`Voice: ${contract.requiredVoice}`)
  rules.push('')

  const permissions: string[] = []
  if (contract.allowExclamation) permissions.push('exclamation marks')
  if (contract.allowQuestions) permissions.push('questions')
  if (contract.allowFirstPerson) permissions.push('first person (I/we)')
  if (contract.allowFragmentedSentences) permissions.push('sentence fragments')
  if (contract.allowAllCaps) permissions.push('ALL CAPS for emphasis')

  if (permissions.length > 0) {
    rules.push(`Allowed: ${permissions.join(', ')}`)
  }

  if (contract.requireShortSentences) {
    rules.push('Required: Short, punchy sentences')
  }

  if (contract.forbiddenPhrases.length > 0) {
    rules.push('')
    rules.push('FORBIDDEN PHRASES:')
    contract.forbiddenPhrases.slice(0, 10).forEach(phrase => {
      rules.push(`- "${phrase}"`)
    })
  }

  return rules.join('\n')
}

/**
 * Build Content Type Rules
 */
function buildContentTypeRules(
  contentType: 'hero' | 'feature' | 'error' | 'affiliate' | 'onboarding',
  contract: CopyContract
): string {
  switch (contentType) {
    case 'hero':
      return `Generate hero section copy that captures attention immediately.

Headline: The hook that stops scrolling (${contract.maxHeadlineWords} words max)
Subcopy: The promise that builds interest (${contract.maxSubcopyWords} words max)
CTA: The action that feels inevitable (${contract.maxCtaWords} words max)

${contract.requireBenefit ? 'Focus on benefit, not feature.' : ''}
${contract.allowUrgency ? 'Emphasize urgency without being pushy.' : ''}
${contract.allowSocialProof ? 'Social proof is allowed if relevant.' : ''}`

    case 'feature':
      return `Generate feature section copy that explains value clearly.

Headline: What this feature does (${contract.maxHeadlineWords} words max)
Subcopy: Why it matters to the user (${contract.maxSubcopyWords} words max)

Focus on practical benefits. Be specific, not vague.`

    case 'error':
      return `Generate error message copy that maintains trust.

Headline: What happened (${contract.maxHeadlineWords} words max)
Subcopy: What to do next (${contract.maxSubcopyWords} words max)

Never blame the user. Focus on recovery, not failure.`

    case 'affiliate':
      return `Generate affiliate page copy that builds trust and drives action.

Balance transparency with persuasion. Be honest about what this is.
${contract.requireBenefit ? 'Lead with benefit, not features.' : ''}
${contract.allowSocialProof ? 'Use social proof if available.' : ''}`

    case 'onboarding':
      return `Generate onboarding copy that guides without overwhelming.

Clear, concise, encouraging. Each step should feel achievable.
${contract.requireShortSentences ? 'Keep sentences short.' : ''}
Focus on progress, not perfection.`
  }
}

/**
 * Build Context Section
 */
function buildContextSection(context: Record<string, any>): string {
  const lines: string[] = []

  for (const [key, value] of Object.entries(context)) {
    if (value !== undefined && value !== null) {
      const displayKey = key.replace(/([A-Z])/g, ' $1').toLowerCase()
      lines.push(`${displayKey}: ${value}`)
    }
  }

  return lines.join('\n')
}

/**
 * Build Output Format
 */
function buildOutputFormat(
  contentType: 'hero' | 'feature' | 'error' | 'affiliate' | 'onboarding'
): string {
  switch (contentType) {
    case 'hero':
      return `Return JSON:
{
  "headline": "...",
  "subcopy": "...",
  "cta": "..."
}`

    case 'feature':
      return `Return JSON:
{
  "headline": "...",
  "description": "..."
}`

    case 'error':
      return `Return JSON:
{
  "title": "...",
  "message": "...",
  "action": "..."
}`

    case 'affiliate':
      return `Return JSON:
{
  "headline": "...",
  "description": "...",
  "cta": "..."
}`

    case 'onboarding':
      return `Return JSON:
{
  "title": "...",
  "instruction": "...",
  "nextAction": "..."
}`
  }
}

/**
 * Execute Generation
 * 
 * Call OpenAI with the built prompt
 */
export async function generateAI<T = any>(
  config: PromptConfig,
  userPrompt?: string
): Promise<T> {
  const response = await fetch('/api/ai/generate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      system: config.system,
      user: userPrompt || 'Generate content following all rules above.',
      temperature: config.temperature,
      max_tokens: config.maxTokens,
      stop: config.stopSequences
    })
  })

  if (!response.ok) {
    throw new Error(`AI generation failed: ${response.statusText}`)
  }

  const data = await response.json()
  return data.content as T
}
