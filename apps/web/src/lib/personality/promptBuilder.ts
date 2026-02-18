/**
 * AI Prompt Builder System
 * 
 * This file implements the missing AI generation functions for the personality cascade system.
 * It bridges the personality system with actual OpenAI API calls.
 */

import { generateAIResponse } from '../openai'
import type { PersonalityProfile, BrandMode } from './types'
import type { HeroBehavior } from './heroBehavior'
import { 
  resolveHeroCopyContract, 
  resolveFeatureCopyContract,
  resolveErrorCopyContract,
  type CopyContract
} from './copyContract'
import { resolveAIPrompt, type AIProfile } from './aiProfile'
import {
  assemblePrompt,
  resolveAIContext,
  bindVoice,
  HeroPromptContract,
  type PromptContract,
  type VoiceId
} from '@modular-affiliate/ai'

// Launchpad-wide guardrails injected into every prompt
const GLOBAL_GUARDRAILS = `
LAUNCHPAD GUARDRAILS (APPLY ALWAYS):
- Prime directive: reduce effort and increase clarity. Never change the user goal. Do not add promises, urgency, scarcity, or income claims unless provided.
- Suggest, don't replace: respond to existing copy; if empty, draft. Offer options, not finals.
- Explain the why: include a brief note on why the suggestion helps and when not to use it. Keep it calm and skippable.
- No hidden persuasion: flag risky claims instead of silently removing them.
- Voice binding: required voice and tone are hard constraints. No unrequested experiments.
`

const CONTEXT_RULES: Record<PromptConfig['contentType'], string> = {
  hero: 'Context sensitivity: live funnels should be conservative, risk warnings enabled, and no tonal experimentation.',
  feature: 'Context sensitivity: keep structure clear; conservative suggestions for live funnels.',
  error: 'Context sensitivity: prioritize reassurance and clarity; never add urgency.',
  affiliate: 'Context sensitivity: disclose relationships, avoid hype, and keep claims reality-based.',
  onboarding: 'Context sensitivity: onboarding uses Boost-style clarity only; zero personality variance; extra explanation allowed.'
}

function guardrailBlock(contentType: PromptConfig['contentType']) {
  return `\n${GLOBAL_GUARDRAILS}\n${CONTEXT_RULES[contentType]}\n`.trim()
}

// Infer voice id from AI profile/system text (lightweight mapper to new voice binder)
function inferVoiceId(aiProfile: AIProfile): VoiceId {
  const sys = aiProfile.system.toLowerCase()
  if (sys.includes('anti-guru') || sys.includes('brutally honest')) return 'anti-guru'
  if (sys.includes('glitch') || sys.includes('meltdown') || sys.includes('sarcastic')) return 'glitch'
  return 'boost'
}

function assembleHeroContractPrompt(aiProfile: AIProfile, contract: CopyContract, context: { productName: string; niche?: string; keyBenefit?: string; targetAudience?: string }) {
  const voiceId = inferVoiceId(aiProfile)
  const aiContext = resolveAIContext({
    componentId: 'HeroBlock',
    pageMode: 'builder',
    userLevel: 'active',
    templateVoice: voiceId,
    riskLevel: 'medium',
    metadata: { keyBenefit: context.keyBenefit, niche: context.niche, targetAudience: context.targetAudience }
  })

  if (!aiContext) return null
  const boundVoice = bindVoice(aiContext)
  if (!boundVoice) return null

  const contractNote: PromptContract = { ...HeroPromptContract }

  return assemblePrompt({
    context: aiContext,
    voiceHeader: boundVoice.header,
    contract: contractNote,
    componentInstructions: 'Generate 3 hero options (headline, subcopy, CTA). Explain why each works. Never change the offer.',
    userContent: JSON.stringify(context, null, 2)
  })
}

export interface PromptConfig {
  contentType: 'hero' | 'feature' | 'error' | 'affiliate' | 'onboarding'
  context: Record<string, any>
  personality: PersonalityProfile
  constraints: CopyContract
}

/**
 * Build Hero-specific AI prompt
 */
export function buildHeroPrompt(
  aiProfile: AIProfile,
  contract: CopyContract,
  context: {
    productName: string
    niche?: string
    keyBenefit?: string
    targetAudience?: string
  }
): string {
  const sarcasmAllowed = (contract as any).allowSarcasm ?? false
  const forbidPromises = (contract as any).forbidPromises ?? true
  const assembled = assembleHeroContractPrompt(aiProfile, contract, context)

  const legacyPrompt = `
${aiProfile.system}

${guardrailBlock('hero')}

You are writing HERO COPY for a landing page.

CONSTRAINTS:
- Headline length: ${contract.maxHeadlineWords} words
- Subcopy length: ${contract.maxSubcopyWords} words  
- CTA length: ${contract.maxCtaWords} words
- Voice: ${contract.requiredVoice}
- Tone: ${contract.requiredTone}
- Sarcasm allowed: ${sarcasmAllowed}
- Promises forbidden: ${forbidPromises}

CONTEXT:
Product: ${context.productName}
${context.niche ? `Niche: ${context.niche}` : ''}
${context.keyBenefit ? `Key Benefit: ${context.keyBenefit}` : ''}
${context.targetAudience ? `Audience: ${context.targetAudience}` : ''}

PRINCIPLES:
${aiProfile.principles.map(p => `- ${p}`).join('\n')}

FORBIDDEN:
${aiProfile.forbidden.map(f => `- ${f}`).join('\n')}

Return JSON format:
{
  "headline": "Compelling headline that embodies the personality",
  "subcopy": "Supporting copy that maintains voice consistency",
  "cta": "Clear call-to-action aligned with personality"
}
`.trim()

  if (assembled) {
    return `${assembled.prompt}\n\n---\nLEGACY PROMPT\n${legacyPrompt}`.trim()
  }

  return legacyPrompt
}

/**
 * Build Feature-specific AI prompt
 */
export function buildFeaturePrompt(
  aiProfile: AIProfile,
  contract: CopyContract,
  context: {
    featureName: string
    featureDescription?: string
    benefit?: string
  }
): string {
  return `
${aiProfile.system}

${guardrailBlock('feature')}

You are writing FEATURE COPY for a landing page feature section.

CONSTRAINTS:
- Headline: Maximum ${contract.maxHeadlineWords} words
- Description: Maximum ${contract.maxSubcopyWords} words
- Voice: ${contract.requiredVoice}
- Tone: ${contract.requiredTone}

CONTEXT:
Feature: ${context.featureName}
${context.featureDescription ? `Description: ${context.featureDescription}` : ''}
${context.benefit ? `Benefit: ${context.benefit}` : ''}

PRINCIPLES:
${aiProfile.principles.map(p => `- ${p}`).join('\n')}

FORBIDDEN:
${aiProfile.forbidden.map(f => `- ${f}`).join('\n')}

Return JSON format:
{
  "headline": "Feature headline that captures the key value",
  "description": "Clear description of what the feature does and why it matters"
}
`.trim()
}

/**
 * Build Error message AI prompt
 */
export function buildErrorPrompt(
  aiProfile: AIProfile,
  contract: CopyContract,
  context: {
    errorType: string
    technicalDetails?: string
    recoveryAction?: string
  }
): string {
  return `
${aiProfile.system}

${guardrailBlock('error')}

You are writing ERROR MESSAGE COPY for user-facing error states.

CONSTRAINTS:
- Title: Maximum ${contract.maxHeadlineWords} words
- Message: Maximum ${contract.maxSubcopyWords} words
- Action: Maximum ${contract.maxCtaWords} words
- Voice: ${contract.requiredVoice}
- Tone: ${contract.requiredTone}

CONTEXT:
Error Type: ${context.errorType}
${context.technicalDetails ? `Technical Details: ${context.technicalDetails}` : ''}
${context.recoveryAction ? `Recovery Action: ${context.recoveryAction}` : ''}

PRINCIPLES:
${aiProfile.principles.map(p => `- ${p}`).join('\n')}

FORBIDDEN:
${aiProfile.forbidden.map(f => `- ${f}`).join('\n')}

SPECIAL REQUIREMENTS FOR ERROR MESSAGES:
- Be helpful and reassuring
- Don't blame the user
- Provide clear next steps
- Maintain personality while being supportive

Return JSON format:
{
  "title": "Error title that acknowledges the issue",
  "message": "Helpful explanation of what happened", 
  "action": "Clear next step to resolve the issue"
}
`.trim()
}

/**
 * Build Affiliate page AI prompt
 */
export function buildAffiliatePrompt(
  aiProfile: AIProfile,
  contract: CopyContract,
  context: {
    productName: string
    productCategory: string
    keyFeatures?: string[]
    pricePoint?: string
  }
): string {
  return `
${aiProfile.system}

${guardrailBlock('affiliate')}

You are writing AFFILIATE MARKETING COPY for a product landing page.

CONSTRAINTS:
- Headline: Maximum ${contract.maxHeadlineWords} words
- Description: Maximum ${contract.maxSubcopyWords} words
- CTA: Maximum ${contract.maxCtaWords} words
- Voice: ${contract.requiredVoice}
- Tone: ${contract.requiredTone}

CONTEXT:
Product: ${context.productName}
Category: ${context.productCategory}
${context.keyFeatures ? `Key Features: ${context.keyFeatures.join(', ')}` : ''}
${context.pricePoint ? `Price Point: ${context.pricePoint}` : ''}

PRINCIPLES:
${aiProfile.principles.map(p => `- ${p}`).join('\n')}

FORBIDDEN:
${aiProfile.forbidden.map(f => `- ${f}`).join('\n')}

AFFILIATE MARKETING REQUIREMENTS:
- Be honest about product claims
- Focus on genuine value
- No fake scarcity or income promises
- Disclose affiliate relationship appropriately

Return JSON format:
{
  "headline": "Compelling headline for the affiliate product",
  "description": "Honest description of product value and benefits",
  "cta": "Clear call-to-action for the affiliate link"
}
`.trim()
}

/**
 * Build Onboarding AI prompt
 */
export function buildOnboardingPrompt(
  aiProfile: AIProfile,
  contract: CopyContract,
  context: {
    stepName: string
    stepPurpose: string
    nextAction?: string
  }
): string {
  return `
${aiProfile.system}

${guardrailBlock('onboarding')}

You are writing ONBOARDING COPY for a user interface.

CONSTRAINTS:
- Title: Maximum ${contract.maxHeadlineWords} words
- Instruction: Maximum ${contract.maxSubcopyWords} words
- Next Action: Maximum ${contract.maxCtaWords} words
- Voice: ${contract.requiredVoice}
- Tone: ${contract.requiredTone}

CONTEXT:
Step: ${context.stepName}
Purpose: ${context.stepPurpose}
${context.nextAction ? `Next Action: ${context.nextAction}` : ''}

PRINCIPLES:
${aiProfile.principles.map(p => `- ${p}`).join('\n')}

FORBIDDEN:
${aiProfile.forbidden.map(f => `- ${f}`).join('\n')}

ONBOARDING REQUIREMENTS:
- Be encouraging and supportive
- Make instructions crystal clear
- Reduce cognitive load
- Build confidence

Return JSON format:
{
  "title": "Step title that orients the user",
  "instruction": "Clear instructions for what to do",
  "nextAction": "Next step or button text"
}
`.trim()
}

/**
 * Generic AI generation function that calls OpenAI
 * 
 * This is the core function that actually makes the API call
 */
export async function generateAI<T = any>(prompt: string): Promise<T> {
  try {
    const response = await generateAIResponse({
      systemPrompt: 'You are an expert copywriter specializing in personality-driven content. Always follow the provided constraints and maintain the specified voice and tone.',
      messages: [],
      userMessage: prompt
    })

    // Try to parse as JSON first (most of our prompts expect JSON)
    try {
      return JSON.parse(response) as T
    } catch (parseError) {
      // If JSON parsing fails, return the raw response
      // This handles cases where we might want plain text
      return response as unknown as T
    }
  } catch (error) {
    console.error('AI generation failed:', error)
    
    // Return a fallback response that matches the expected structure
    // This prevents the cascade from breaking when AI is unavailable
    const fallback = {
      headline: 'Generated content unavailable',
      subcopy: 'AI service is currently unavailable. Please try again later.',
      cta: 'Try Again',
      // Additional fallback fields for other content types
      description: 'Content generation is currently unavailable.',
      title: 'Service Unavailable',
      message: 'The content generation service is temporarily unavailable.',
      action: 'Retry',
      instruction: 'Please try again in a moment.',
      nextAction: 'Continue'
    }
    
    return fallback as T
  }
}