'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { RocketDrift } from './RocketDrift'
import { useUIExpression } from '@/lib/brand-brain/useUIExpression'

export function HeroSection() {
  const ui = useUIExpression()

  // Determine animation variants based on UI expression profile
  const getMotionVariants = () => {
    switch (ui.hero.motionIntensity) {
      case 'none':
        return {
          initial: {},
          animate: {},
          transition: {}
        }
      case 'low':
        return {
          initial: { opacity: 0, y: 10 },
          animate: { opacity: 1, y: 0 },
          transition: { duration: 0.8, ease: 'easeOut' as const }
        }
      case 'medium':
        return {
          initial: { opacity: 0, y: 30, scale: 0.95 },
          animate: { opacity: 1, y: 0, scale: 1 },
          transition: { duration: 0.6, ease: [0.4, 0, 0.2, 1] as const }
        }
      case 'high':
        return {
          initial: { opacity: 0, y: 50, scale: 0.9, rotate: -2 },
          animate: { opacity: 1, y: 0, scale: 1, rotate: 0 },
          transition: { duration: 0.5, type: 'spring' as const, bounce: 0.4 }
        }
    }
  }

  const motionVariants = getMotionVariants()

  // Determine visual effects based on visual noise
  const shouldShowGlitch = ui.hero.visualNoise === 'expressive' && ui.microInteractions.glitchAllowed
  const shouldShowPulse = ui.hero.visualNoise !== 'none' && ui.microInteractions.pulseAllowed

  // Typography tone classes
  const getTypographyClasses = () => {
    const baseClasses = 'text-4xl sm:text-5xl md:text-7xl font-extrabold mb-6 drop-shadow-2xl break-words px-4 text-center leading-tight flex flex-wrap justify-center items-baseline gap-2'
    
    switch (ui.typography.tone) {
      case 'fractured':
        return `${baseClasses} tracking-tight italic`
      case 'playful':
        return `${baseClasses} tracking-wide`
      case 'confident':
        return `${baseClasses} tracking-normal`
      case 'flat':
      default:
        return `${baseClasses} tracking-normal`
    }
  }

  // Emphasis style for the tagline
  const getEmphasisClasses = () => {
    switch (ui.typography.emphasisStyle) {
      case 'underline':
        return 'underline decoration-brand-cyan decoration-4 underline-offset-4'
      case 'highlight':
        return 'bg-brand-cyan/20 px-2 py-1 rounded'
      case 'strike':
        return 'relative before:absolute before:top-1/2 before:left-0 before:w-full before:h-0.5 before:bg-brand-orange before:transform before:-rotate-2'
      default:
        return ''
    }
  }

  return (
    <section className="flex min-h-screen flex-col items-center justify-center p-8 bg-brand-gradient launch-pad pt-24 md:pt-32 relative overflow-hidden">
      {/* Background effects - intensity based on visual noise */}
      {ui.hero.visualNoise !== 'none' && (
        <>
          <div className="absolute top-20 left-10 w-64 h-64 bg-brand-purple/20 rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-brand-orange/15 rounded-full blur-3xl"></div>
        </>
      )}
      
      {ui.hero.visualNoise === 'expressive' && (
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full h-full bg-gradient-to-t from-brand-orange/10 to-transparent opacity-30"></div>
      )}
      
      {/* Rocket Drift Animation - only if motion allowed */}
      {ui.hero.motionIntensity !== 'none' && ui.hero.variants.includes('rocket') && (
        <div className="absolute top-1/2 right-10 -translate-y-1/2 hidden lg:block z-0 opacity-60">
          <RocketDrift
            src="/images/rocket.png"
            alt="Launchpad rocket lifting off"
          />
        </div>
      )}
      
      <motion.div 
        className="max-w-4xl w-full text-center relative z-10"
        {...motionVariants}
      >
        {/* Hero Title with Typography Tone */}
        <h1 className={getTypographyClasses()}>
          <span className="text-white relative z-20 whitespace-nowrap">Launchpad</span>
          <span className="text-brand-gradient text-5xl sm:text-6xl md:text-8xl relative z-10">4</span>
          <span className="text-white relative z-20 whitespace-nowrap">Success</span>
        </h1>

        {/* Tagline with Emphasis Style */}
        <motion.p 
          className={`text-xl md:text-3xl text-white font-bold mb-8 drop-shadow-lg ${getEmphasisClasses()}`}
          {...(ui.hero.motionIntensity !== 'none' ? {
            initial: { opacity: 0, y: 20 },
            animate: { opacity: 1, y: 0 },
            transition: { delay: 0.2, duration: 0.6 }
          } : {})}
        >
          Build High-Converting Affiliate Funnels in Minutes
        </motion.p>

        <motion.p 
          className="text-lg text-white mb-12 max-w-2xl mx-auto"
          {...(ui.hero.motionIntensity !== 'none' ? {
            initial: { opacity: 0 },
            animate: { opacity: 1 },
            transition: { delay: 0.4, duration: 0.6 }
          } : {})}
        >
          The modular system that lets you create, launch, and scale profitable affiliate marketing campaigns without the technical headaches.
        </motion.p>
        
        {/* CTA Buttons with Hover Effects */}
        <motion.div 
          className="flex flex-col sm:flex-row gap-4 justify-center mb-16"
          {...(ui.hero.motionIntensity !== 'none' ? {
            initial: { opacity: 0, y: 20 },
            animate: { opacity: 1, y: 0 },
            transition: { delay: 0.6, duration: 0.6 }
          } : {})}
        >
          <Link
            href="/get-started"
            className={`btn-launch text-xl px-12 py-6 ${
              ui.microInteractions.hoverAllowed ? 'hover:scale-105' : ''
            } ${
              shouldShowPulse ? 'animate-pulse-slow' : ''
            }`}
          >
            Get Started Now 🚀
          </Link>
          <Link
            href="/pricing"
            className={`px-12 py-6 bg-transparent text-white text-xl font-bold rounded-lg border-2 border-brand-cyan hover:bg-brand-cyan/20 transition-all shadow-xl glow-cyan ${
              ui.microInteractions.hoverAllowed ? 'hover:scale-105' : ''
            }`}
          >
            View Pricing
          </Link>
        </motion.div>

        {/* Feature Grid */}
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16"
          {...(ui.hero.motionIntensity === 'high' ? {
            initial: { opacity: 0, scale: 0.9 },
            animate: { opacity: 1, scale: 1 },
            transition: { delay: 0.8, duration: 0.5, type: 'spring' }
          } : ui.hero.motionIntensity !== 'none' ? {
            initial: { opacity: 0 },
            animate: { opacity: 1 },
            transition: { delay: 0.8, duration: 0.6 }
          } : {})}
        >
          <div className="card-launch">
            <div className="text-5xl mb-4">🚀</div>
            <h2 className="text-2xl font-bold mb-3 text-brand-purple">Swappable Niches</h2>
            <p className="text-brand-purple mb-4">
              Switch between health, finance, tech, and more without starting over
            </p>
            <Link href="/niches" className="text-brand-cyan hover:text-brand-orange font-bold transition-colors inline-block">
              Explore Niches →
            </Link>
          </div>
          
          <div className="card-launch">
            <div className="text-5xl mb-4">⚡</div>
            <h2 className="text-2xl font-bold mb-3 text-brand-purple">Drag & Drop Builder</h2>
            <p className="text-brand-purple mb-4">
              Create stunning funnels with our visual builder - no coding required
            </p>
            <Link href="/builder" className="text-brand-cyan hover:text-brand-orange font-bold transition-colors inline-block">
              Try Builder →
            </Link>
          </div>
          
          <div className="card-launch">
            <div className="text-5xl mb-4">🎯</div>
            <h2 className="text-2xl font-bold mb-3 text-brand-purple">AI-Powered</h2>
            <p className="text-brand-purple mb-4">
              Let AI write your copy and analyze your campaigns automatically
            </p>
            <Link href="/features" className="text-brand-cyan hover:text-brand-orange font-bold transition-colors inline-block">
              See Features →
            </Link>
          </div>
        </motion.div>
      </motion.div>
    </section>
  )
}
