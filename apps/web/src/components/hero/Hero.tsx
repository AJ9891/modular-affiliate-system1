/**
 * Hero Component
 * 
 * One file, no forks. All behavior controlled by personality.
 * Content injected from outside, behavior resolved from personality.
 * 
 * This component:
 * - Does NOT hardcode brand-specific content
 * - Does NOT branch on brand_mode
 * - DOES resolve behavior from personality
 * - DOES apply behavior rules consistently
 */

'use client'

import { usePersonality } from '@/lib/personality'
import { 
  resolveHeroBehavior, 
  getHeroClasses,
  getHeroAnimationVariants,
  getHeroGlitchParams
} from '@/lib/personality/heroBehavior'
import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'

/**
 * Hero props
 * 
 * Content is injected from parent, never hardcoded
 */
interface HeroProps {
  headline: string
  subcopy?: string
  children?: React.ReactNode
  className?: string
}

/**
 * AmbientSound component
 * 
 * Plays background audio when personality allows
 */
function AmbientSound({ enabled }: { enabled: boolean }) {
  useEffect(() => {
    if (!enabled) return
    
    // TODO: Implement actual audio playback
    console.log('[Hero] Ambient sound enabled')
    
    return () => {
      console.log('[Hero] Ambient sound disabled')
    }
  }, [enabled])
  
  return null
}

/**
 * GlitchEffect component
 * 
 * Applies visual glitch effects when personality allows
 */
function GlitchEffect({ 
  enabled, 
  intensity,
  children 
}: { 
  enabled: boolean
  intensity: number
  children: React.ReactNode 
}) {
  const [isGlitching, setIsGlitching] = useState(false)
  
  useEffect(() => {
    if (!enabled) return
    
    // Random glitch intervals based on intensity
    const minInterval = 5000 - (intensity * 4000) // 1-5 seconds
    const maxInterval = 15000 - (intensity * 10000) // 5-15 seconds
    
    const scheduleGlitch = () => {
      const delay = Math.random() * (maxInterval - minInterval) + minInterval
      
      setTimeout(() => {
        setIsGlitching(true)
        setTimeout(() => setIsGlitching(false), 100) // Glitch for 100ms
        scheduleGlitch() // Schedule next glitch
      }, delay)
    }
    
    scheduleGlitch()
  }, [enabled, intensity])
  
  if (!enabled) {
    return <>{children}</>
  }
  
  return (
    <span 
      className={isGlitching ? 'animate-glitch' : ''}
      data-glitch-intensity={intensity}
    >
      {children}
    </span>
  )
}

/**
 * Hero Component
 */
export function Hero({ 
  headline, 
  subcopy, 
  children,
  className = ''
}: HeroProps) {
  // Get personality from context (resolved once at root)
  const { personality } = usePersonality()
  
  // Resolve hero-specific behavior
  const behavior = resolveHeroBehavior(personality)
  
  // Get CSS classes based on behavior
  const classes = getHeroClasses(behavior)
  
  // Get animation variants
  const variants = getHeroAnimationVariants(behavior)
  
  // Get glitch parameters
  const glitchParams = getHeroGlitchParams(behavior)
  
  // Determine if we should use motion
  const shouldAnimate = behavior.animationIntensity > 0
  
  // Choose wrapper based on animation setting
  const Container = shouldAnimate ? motion.section : 'section'
  const HeadlineWrapper = shouldAnimate ? motion.h1 : 'h1'
  const SubcopyWrapper = shouldAnimate ? motion.p : 'p'
  
  return (
    <>
      <Container
        className={`${classes.container} ${className}`}
        {...(shouldAnimate && {
          initial: "hidden",
          animate: "visible",
          variants: variants.container
        })}
      >
        <HeadlineWrapper
          className={classes.headline}
          data-style={behavior.headlineStyle}
          data-glitch={behavior.allowGlitch}
          {...(shouldAnimate && {
            variants: variants.headline
          })}
        >
          <GlitchEffect 
            enabled={glitchParams.enabled}
            intensity={glitchParams.intensity}
          >
            {headline}
          </GlitchEffect>
        </HeadlineWrapper>

        {subcopy && (
          <SubcopyWrapper
            className={classes.subcopy}
            data-style={behavior.subcopyStyle}
            {...(shouldAnimate && {
              variants: variants.subcopy
            })}
          >
            {subcopy}
          </SubcopyWrapper>
        )}

        {children}
      </Container>

      {/* Ambient sound (when personality allows) */}
      <AmbientSound enabled={behavior.allowAmbientSound} />
    </>
  )
}

/**
 * Hero.Skeleton
 * 
 * Loading state for Hero
 */
Hero.Skeleton = function HeroSkeleton() {
  return (
    <section className="hero-root animate-pulse">
      <div className="h-12 bg-gray-200 rounded w-3/4 mb-4" />
      <div className="h-6 bg-gray-200 rounded w-1/2" />
    </section>
  )
}

/**
 * Usage Example:
 * 
 * ```tsx
 * // Content comes from CMS, database, or AI generation
 * const content = await fetchHeroContent(user.niche)
 * 
 * // Component automatically adapts to personality
 * <Hero 
 *   headline={content.headline}
 *   subcopy={content.subcopy}
 * >
 *   <CTAButton />
 * </Hero>
 * ```
 * 
 * The same component works for all personalities:
 * - AI Meltdown: fractured headlines, glitch effects, high tension
 * - Anti-Guru: flat headlines, minimal subcopy, no glitches
 * - Rocket Future: confident headlines, explanatory subcopy, smooth animations
 */
