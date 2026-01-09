/**
 * Complete Cascade Pattern Implementation
 * 
 * This file demonstrates the full cascade from personality → AI generation
 * for every major content type in the system.
 * 
 * UPDATED: Now uses canonical personality system for alignment
 */

import { resolvePersonality } from './resolvePersonality'
import { resolveHeroBehavior } from './heroBehavior'
import { 
  resolveHeroCopyContract, 
  resolveFeatureCopyContract,
  resolveErrorCopyContract 
} from './copyContract'
import { 
  resolveCanonicalAIProfile,
  buildAIPrompt,
  type CanonicalAIProfile
} from './canonical-ai-resolver'
import type { BrandMode, PersonalityProfile } from './types'

/**
 * ============================================================================
 * HERO SECTION GENERATION
 * ============================================================================
 */

export interface HeroContent {
  headline: string
  subcopy: string
  cta: string
}

/**
 * Generate Hero Copy (Full Cascade)
 * 
 * Updated to use canonical personality system:
 * personality → behavior → contract → canonical AI profile → prompt → AI
 */
export async function generateHeroCopy(
  brandMode: BrandMode,
  context: {
    productName: string
    niche?: string
    keyBenefit?: string
    targetAudience?: string
  }
): Promise<HeroContent> {
  // 1. Resolve personality from brand_mode
  const personality = resolvePersonality(brandMode)

  // 2. Resolve behavior from personality
  const heroBehavior = resolveHeroBehavior(personality)

  // 3. Resolve copy contract from behavior
  const heroContract = resolveHeroCopyContract(heroBehavior, personality)

  // 4. Resolve canonical AI profile from brand mode
  const aiProfile = resolveCanonicalAIProfile(brandMode)

  // 5. Build prompt from canonical profile + context
  const prompt = buildAIPrompt(aiProfile, {
    contentType: 'hero',
    ...context
  })

  // 6. Generate with AI (placeholder - integrate with your AI service)
  console.log('Generated AI prompt:', prompt)
  
  // Return mock data for now - replace with actual AI call
  return {
    headline: `${aiProfile.primaryTrait} headline for ${context.productName}`,
    subcopy: `Generated with ${personality.name} personality`,
    cta: `${aiProfile.primaryTrait} call-to-action`
  }
}

/**
 * ============================================================================
 * FEATURE SECTION GENERATION
 * ============================================================================
 */

export interface FeatureContent {
  headline: string
  description: string
}

/**
 * Generate Feature Copy (Same Pattern)
 */
export async function generateFeatureCopy(
  brandMode: BrandMode,
  context: {
    featureName: string
    featureDescription?: string
    benefit?: string
  }
): Promise<FeatureContent> {
  // Same cascade, different resolvers
  const personality = resolvePersonality(brandMode)
  const featureContract = resolveFeatureCopyContract(personality)
  const aiProfile = resolveAIPrompt(personality)
  const prompt = buildFeaturePrompt(aiProfile, featureContract, context)
  
  return await generateAI<FeatureContent>(prompt)
}

/**
 * ============================================================================
 * ERROR MESSAGE GENERATION
 * ============================================================================
 */

export interface ErrorContent {
  title: string
  message: string
  action: string
}

/**
 * Generate Error Copy (Same Pattern)
 */
export async function generateErrorCopy(
  brandMode: BrandMode,
  context: {
    errorType: string
    technicalDetails?: string
    recoveryAction?: string
  }
): Promise<ErrorContent> {
  const personality = resolvePersonality(brandMode)
  const errorContract = resolveErrorCopyContract(personality)
  const aiProfile = resolveAIPrompt(personality)
  const prompt = buildErrorPrompt(aiProfile, errorContract, context)
  
  return await generateAI<ErrorContent>(prompt)
}

/**
 * ============================================================================
 * AFFILIATE PAGE GENERATION
 * ============================================================================
 */

export interface AffiliateContent {
  headline: string
  description: string
  cta: string
}

/**
 * Generate Affiliate Copy (Same Pattern)
 */
export async function generateAffiliateCopy(
  brandMode: BrandMode,
  context: {
    productName: string
    productCategory: string
    keyFeatures?: string[]
    pricePoint?: string
  }
): Promise<AffiliateContent> {
  const personality = resolvePersonality(brandMode)
  
  // Affiliate pages use hero-like contracts (attention-grabbing)
  const behavior = resolveHeroBehavior(personality)
  const contract = resolveHeroCopyContract(behavior, personality)
  
  const aiProfile = resolveAIPrompt(personality)
  const prompt = buildAffiliatePrompt(aiProfile, contract, context)
  
  return await generateAI<AffiliateContent>(prompt)
}

/**
 * ============================================================================
 * ONBOARDING FLOW GENERATION
 * ============================================================================
 */

export interface OnboardingContent {
  title: string
  instruction: string
  nextAction: string
}

/**
 * Generate Onboarding Copy (Same Pattern)
 */
export async function generateOnboardingCopy(
  brandMode: BrandMode,
  context: {
    stepName: string
    stepPurpose: string
    nextAction?: string
  }
): Promise<OnboardingContent> {
  const personality = resolvePersonality(brandMode)
  
  // Onboarding needs feature-like clarity
  const contract = resolveFeatureCopyContract(personality)
  
  const aiProfile = resolveAIPrompt(personality)
  const prompt = buildOnboardingPrompt(aiProfile, contract, context)
  
  return await generateAI<OnboardingContent>(prompt)
}

/**
 * ============================================================================
 * EMPTY STATE GENERATION
 * ============================================================================
 */

export interface EmptyStateContent {
  headline: string
  message: string
  cta: string
}

/**
 * Generate Empty State Copy
 */
export async function generateEmptyStateCopy(
  brandMode: BrandMode,
  context: {
    entityType: string // "funnels", "products", etc.
    firstAction: string // "Create your first funnel"
  }
): Promise<EmptyStateContent> {
  const personality = resolvePersonality(brandMode)
  const contract = resolveFeatureCopyContract(personality)
  const aiProfile = resolveAIPrompt(personality)
  
  const prompt = buildOnboardingPrompt(aiProfile, contract, {
    stepName: `No ${context.entityType} yet`,
    stepPurpose: 'Encourage user to create their first item',
    nextAction: context.firstAction
  })
  
  const content = await generateAI<OnboardingContent>(prompt)
  
  return {
    headline: content.title,
    message: content.instruction,
    cta: content.nextAction
  }
}

/**
 * ============================================================================
 * BATCH GENERATION
 * ============================================================================
 */

/**
 * Generate multiple content types at once
 * 
 * Useful for generating an entire funnel or page in one go
 */
export async function generateCompleteFunnel(
  brandMode: BrandMode,
  context: {
    productName: string
    niche: string
    keyBenefit: string
    features: Array<{ name: string; description: string }>
  }
) {
  const [hero, ...features] = await Promise.all([
    generateHeroCopy(brandMode, {
      productName: context.productName,
      niche: context.niche,
      keyBenefit: context.keyBenefit
    }),
    ...context.features.map(feature =>
      generateFeatureCopy(brandMode, {
        featureName: feature.name,
        featureDescription: feature.description
      })
    )
  ])

  return {
    hero,
    features
  }
}

/**
 * ============================================================================
 * UTILITIES
 * ============================================================================
 */

/**
 * Preview cascade without calling AI
 * 
 * Useful for debugging or showing users what constraints will apply
 */
export function previewCascade(brandMode: BrandMode, contentType: 'hero' | 'feature' | 'error') {
  const personality = resolvePersonality(brandMode)
  const aiProfile = resolveAIPrompt(personality)
  
  let behavior, contract, prompt
  
  switch (contentType) {
    case 'hero':
      behavior = resolveHeroBehavior(personality)
      contract = resolveHeroCopyContract(behavior, personality)
      prompt = buildHeroPrompt(aiProfile, contract, {
        productName: 'Example Product'
      })
      break
      
    case 'feature':
      contract = resolveFeatureCopyContract(personality)
      prompt = buildFeaturePrompt(aiProfile, contract, {
        featureName: 'Example Feature'
      })
      break
      
    case 'error':
      contract = resolveErrorCopyContract(personality)
      prompt = buildErrorPrompt(aiProfile, contract, {
        errorType: 'Example Error'
      })
      break
  }
  
  return {
    personality,
    behavior,
    contract,
    aiProfile,
    prompt
  }
}

/**
 * Get cascade summary for debugging
 */
export function getCascadeSummary(brandMode: BrandMode) {
  const personality = resolvePersonality(brandMode)
  const behavior = resolveHeroBehavior(personality)
  const contract = resolveHeroCopyContract(behavior, personality)
  const aiProfile = resolveAIPrompt(personality)
  
  return {
    brandMode,
    personality: {
      name: personality.name,
      authorityTone: personality.authorityTone,
      trustPosture: personality.trustPosture,
      humorDensity: personality.humorDensity
    },
    behavior: {
      headlineStyle: behavior.headlineStyle,
      visualTension: behavior.visualTension,
      emphasizeUrgency: behavior.emphasizeUrgency
    },
    contract: {
      maxWords: {
        headline: contract.maxHeadlineWords,
        subcopy: contract.maxSubcopyWords,
        cta: contract.maxCtaWords
      },
      requiredTone: contract.requiredTone,
      requiredVoice: contract.requiredVoice
    },
    aiProfile: {
      perspective: aiProfile.perspective,
      relationshipToUser: aiProfile.relationshipToUser,
      knowledgePosture: aiProfile.knowledgePosture,
      coreValues: aiProfile.coreValues
    }
  }
}
