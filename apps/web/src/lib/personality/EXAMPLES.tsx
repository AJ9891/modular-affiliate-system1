/**
 * CASCADE PATTERN - Complete Example
 * 
 * This demonstrates the full personality-driven AI generation cascade.
 * Use this as a reference for implementing content generation anywhere in the app.
 */

import {
  generateHeroCopy,
  generateFeatureCopy,
  generateErrorCopy,
  generateAffiliateCopy,
  generateOnboardingCopy,
  previewCascade,
  getCascadeSummary
} from '@/lib/personality'
import type { BrandMode } from '@/lib/personality'

/**
 * ============================================================================
 * EXAMPLE 1: Hero Section Generation
 * ============================================================================
 */

async function exampleHeroGeneration() {
  // Single decision point: brand mode
  const brandMode: BrandMode = 'anti_guru'

  // Everything downstream is obedient
  const heroCopy = await generateHeroCopy(brandMode, {
    productName: 'FunnelForge',
    niche: 'SaaS tools',
    keyBenefit: 'Build funnels without the BS',
    targetAudience: 'indie makers tired of bloated marketing tools'
  })

  console.log(heroCopy)
  // {
  //   headline: "Build funnels. Skip the guru nonsense.",
  //   subcopy: "No upsells. No webinars. Just a tool that works.",
  //   cta: "Start building"
  // }

  // Want a different vibe? Change one line:
  const chaosMode: BrandMode = 'ai_meltdown'
  const chaosCopy = await generateHeroCopy(chaosMode, {
    productName: 'FunnelForge',
    niche: 'SaaS tools',
    keyBenefit: 'Build funnels without the BS',
    targetAudience: 'indie makers tired of bloated marketing tools'
  })

  console.log(chaosCopy)
  // {
  //   headline: "FUNNEL OVERLOAD INCOMING",
  //   subcopy: "Too much speed. Maximum efficiency. Your brain can barely keep up.",
  //   cta: "GO NOW"
  // }
}

/**
 * ============================================================================
 * EXAMPLE 2: Feature Section Generation
 * ============================================================================
 */

async function exampleFeatureGeneration() {
  const brandMode: BrandMode = 'rocket_future'

  const features = [
    { name: 'AI Copy Generation', description: 'Writes your landing pages' },
    { name: 'Drag & Drop Builder', description: 'Visual funnel construction' },
    { name: 'Analytics Dashboard', description: 'Track every conversion' }
  ]

  const featureCopy = await Promise.all(
    features.map(feature =>
      generateFeatureCopy(brandMode, {
        featureName: feature.name,
        featureDescription: feature.description,
        benefit: 'Saves you hours of work'
      })
    )
  )

  console.log(featureCopy)
  // [
  //   { headline: "AI writes your copy", description: "Generate landing pages in seconds, not hours" },
  //   { headline: "Build visually", description: "Drag blocks, see results instantly" },
  //   { headline: "Know what works", description: "Every click, every conversion, tracked" }
  // ]
}

/**
 * ============================================================================
 * EXAMPLE 3: Error Message Generation
 * ============================================================================
 */

async function exampleErrorGeneration() {
  const brandMode: BrandMode = 'anti_guru'

  const errorCopy = await generateErrorCopy(brandMode, {
    errorType: 'payment_failed',
    technicalDetails: 'Card declined',
    recoveryAction: 'Try a different payment method'
  })

  console.log(errorCopy)
  // {
  //   title: "Payment didn't go through",
  //   message: "Your card was declined. Try another one.",
  //   action: "Update payment"
  // }
}

/**
 * ============================================================================
 * EXAMPLE 4: Affiliate Page Generation
 * ============================================================================
 */

async function exampleAffiliateGeneration() {
  const brandMode: BrandMode = 'rocket_future'

  const affiliateCopy = await generateAffiliateCopy(brandMode, {
    productName: 'ConvertKit',
    productCategory: 'email marketing',
    keyFeatures: ['automation', 'landing pages', 'subscriber tagging'],
    pricePoint: '$29/month'
  })

  console.log(affiliateCopy)
  // {
  //   headline: "Email automation that actually works",
  //   description: "ConvertKit handles your email sequences while you focus on creating. Automation, landing pages, subscriber management—all in one place.",
  //   cta: "Try ConvertKit"
  // }
}

/**
 * ============================================================================
 * EXAMPLE 5: Onboarding Flow Generation
 * ============================================================================
 */

async function exampleOnboardingGeneration() {
  const brandMode: BrandMode = 'anti_guru'

  const steps = [
    { name: 'Choose niche', purpose: 'Select your market', next: 'Pick your niche' },
    { name: 'Set goals', purpose: 'Define success metrics', next: 'Set targets' },
    { name: 'Build funnel', purpose: 'Create your first funnel', next: 'Start building' }
  ]

  const onboardingCopy = await Promise.all(
    steps.map(step =>
      generateOnboardingCopy(brandMode, {
        stepName: step.name,
        stepPurpose: step.purpose,
        nextAction: step.next
      })
    )
  )

  console.log(onboardingCopy)
  // [
  //   { title: "Pick your niche", instruction: "What market are you targeting?", nextAction: "Choose niche" },
  //   { title: "Define success", instruction: "What does winning look like?", nextAction: "Set goals" },
  //   { title: "Build something", instruction: "Create your first funnel.", nextAction: "Get started" }
  // ]
}

/**
 * ============================================================================
 * EXAMPLE 6: Preview Cascade (Debug Tool)
 * ============================================================================
 */

function exampleCascadePreview() {
  // Preview the cascade without calling AI
  const preview = previewCascade('ai_meltdown', 'hero')

  console.log('Personality:', preview.personality?.name)
  console.log('Behavior:', preview.behavior)
  console.log('Contract:', preview.contract)
  console.log('AI Profile:', preview.aiProfile)
  const promptPreview = typeof preview.prompt === 'string'
    ? preview.prompt.slice(0, 200)
    : (preview.prompt as any)?.system?.slice(0, 200)
  console.log('Prompt (first 200 chars):', promptPreview)

  // Get a summary for debugging
  const summary = getCascadeSummary('ai_meltdown')
  console.log('Cascade Summary:', JSON.stringify(summary, null, 2))
}

/**
 * ============================================================================
 * EXAMPLE 7: Using in React Components
 * ============================================================================
 */

import { useState } from 'react'

function HeroGenerator() {
  const [brandMode, setBrandMode] = useState<BrandMode>('anti_guru')
  const [copy, setCopy] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  const handleGenerate = async () => {
    setLoading(true)
    try {
      const result = await generateHeroCopy(brandMode, {
        productName: 'My Product',
        keyBenefit: 'Solves a real problem'
      })
      setCopy(result)
    } catch (error) {
      console.error('Generation failed:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <select 
        value={brandMode} 
        onChange={(e) => setBrandMode(e.target.value as BrandMode)}
      >
        <option value="anti_guru">Anti-Guru</option>
        <option value="ai_meltdown">AI Meltdown</option>
        <option value="rocket_future">Rocket Future</option>
      </select>

      <button onClick={handleGenerate} disabled={loading}>
        {loading ? 'Generating...' : 'Generate Hero'}
      </button>

      {copy && (
        <div>
          <h1>{copy.headline}</h1>
          <p>{copy.subcopy}</p>
          <button>{copy.cta}</button>
        </div>
      )}
    </div>
  )
}

/**
 * ============================================================================
 * EXAMPLE 8: Using in API Routes
 * ============================================================================
 */

import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  const { brandMode, productName, niche } = await request.json()

  try {
    const heroCopy = await generateHeroCopy(brandMode, {
      productName,
      niche,
      keyBenefit: 'Generated benefit'
    })

    return NextResponse.json({ success: true, copy: heroCopy })
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Generation failed' },
      { status: 500 }
    )
  }
}

/**
 * ============================================================================
 * EXAMPLE 9: Batch Generation for Complete Funnel
 * ============================================================================
 */

import { generateCompleteFunnel } from '@/lib/personality'

async function exampleCompleteFunnelGeneration() {
  const funnel = await generateCompleteFunnel('rocket_future', {
    productName: 'TaskFlow Pro',
    niche: 'productivity software',
    keyBenefit: 'Organize your chaos',
    features: [
      { name: 'Smart Lists', description: 'AI-powered task organization' },
      { name: 'Team Sync', description: 'Real-time collaboration' },
      { name: 'Time Blocking', description: 'Calendar integration' }
    ]
  })

  console.log('Hero:', funnel.hero)
  console.log('Features:', funnel.features)

  // Use this to generate an entire landing page
  return {
    hero: funnel.hero,
    features: funnel.features.map((f, i) => ({
      id: i,
      headline: f.headline,
      description: f.description
    }))
  }
}

/**
 * ============================================================================
 * WHY THIS PATTERN IS POWERFUL
 * ============================================================================
 * 
 * 1. Single Decision Point
 *    Change brandMode → everything regenerates correctly
 * 
 * 2. No AI Freedom to Drift
 *    Constraints are enforced at the prompt level
 * 
 * 3. Fully Testable
 *    Each layer can be tested independently
 * 
 * 4. Reusable Everywhere
 *    Same pattern works for: hero, features, errors, onboarding, affiliates
 * 
 * 5. Hand-Edit Safe
 *    You always know what constraints were intended
 * 
 * 6. Model Agnostic
 *    Swap OpenAI for Claude, prompt structure stays the same
 * 
 * 7. Designer Friendly
 *    Change personality, preview cascade, see what will generate
 * 
 * 8. Audit Trail
 *    Every piece of copy knows its governance chain
 */

/**
 * ============================================================================
 * ANTI-PATTERNS TO AVOID
 * ============================================================================
 * 
 * ❌ DON'T: Call OpenAI directly with manual prompts
 * ✅ DO: Use generateHeroCopy() and let the cascade handle it
 * 
 * ❌ DON'T: Check brandMode in your component and branch
 * ✅ DO: Let the cascade resolve behavior automatically
 * 
 * ❌ DON'T: Mix style rules with behavior rules
 * ✅ DO: Keep personality separate from visual design
 * 
 * ❌ DON'T: Hardcode copy constraints in prompts
 * ✅ DO: Let copyContract derive constraints from behavior
 * 
 * ❌ DON'T: Generate content without validation
 * ✅ DO: Use validateCopy() and validateAIOutput()
 */

export {
  exampleHeroGeneration,
  exampleFeatureGeneration,
  exampleErrorGeneration,
  exampleAffiliateGeneration,
  exampleOnboardingGeneration,
  exampleCascadePreview,
  exampleCompleteFunnelGeneration,
  HeroGenerator
}
