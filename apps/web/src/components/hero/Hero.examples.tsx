/**
 * Hero Usage Examples
 * 
 * Demonstrates how to use the personality-aware Hero component
 */

import { Hero } from './Hero'

/**
 * Example 1: Basic Usage
 * Content from CMS/database
 */
export function BasicHeroExample() {
  return (
    <Hero 
      headline="Build Your Affiliate Empire"
      subcopy="No BS. No guru hype. Just systems that work."
    />
  )
}

/**
 * Example 2: With Children (CTA)
 */
export function HeroWithCTAExample() {
  return (
    <Hero 
      headline="Stop Wasting Time on Bad Funnels"
      subcopy="Launch profitable campaigns in minutes, not months."
    >
      <div className="flex gap-4">
        <button className="btn-primary">Get Started</button>
        <button className="btn-secondary">Watch Demo</button>
      </div>
    </Hero>
  )
}

/**
 * Example 3: Dynamic Content from AI
 */
export async function AIDrivenHeroExample({ 
  niche, 
  brandMode 
}: { 
  niche: string
  brandMode: string 
}) {
  // AI generates content based on niche and personality
  const content = await generateHeroContent(niche, brandMode)
  
  return (
    <Hero 
      headline={content.headline}
      subcopy={content.subcopy}
    />
  )
}

/**
 * Example 4: A/B Testing
 */
export function ABTestHeroExample({ variant }: { variant: 'A' | 'B' }) {
  const content = {
    A: {
      headline: "Build Your Future",
      subcopy: "Start today with our proven system."
    },
    B: {
      headline: "Stop Dreaming, Start Building",
      subcopy: "Your future starts with one funnel."
    }
  }
  
  return (
    <Hero 
      headline={content[variant].headline}
      subcopy={content[variant].subcopy}
    />
  )
}

/**
 * Example 5: Loading State
 */
export function LoadingHeroExample() {
  const isLoading = true // from your loading state
  
  if (isLoading) {
    return <Hero.Skeleton />
  }
  
  return <Hero headline="..." subcopy="..." />
}

/**
 * Mock AI generation function
 */
async function generateHeroContent(niche: string, brandMode: string) {
  // In real implementation, this calls your AI service
  return {
    headline: `Transform Your ${niche} Business`,
    subcopy: 'Real results, no fluff.'
  }
}

/**
 * Key Point: Same Component, Different Behaviors
 * 
 * The Hero component automatically adapts based on personality:
 * 
 * AI Meltdown:
 * - Fractured headlines with glitch effects
 * - High visual tension
 * - Ambient sound enabled
 * - Urgent tone
 * 
 * Anti-Guru:
 * - Flat, direct headlines
 * - Minimal subcopy
 * - No animations or glitches
 * - Silent, focused
 * 
 * Rocket Future:
 * - Confident headlines
 * - Explanatory subcopy
 * - Smooth animations
 * - Ambient soundscape
 * 
 * No branching. No if statements. Pure behavior resolution.
 */
