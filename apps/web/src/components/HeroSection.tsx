'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { Check } from 'lucide-react'
import { useUIExpression } from '@/lib/brand-brain/useUIExpression'

const tiers = [
  {
    name: 'Starter',
    price: '$30/mo',
    description: 'For solo operators validating first offers.',
    cta: '/checkout?plan=starter',
    features: [
      '1 Active Funnel',
      'Basic Templates',
      'Analytics Dashboard',
      'Email Support',
    ],
  },
  {
    name: 'Pro',
    price: '$45/mo',
    description: 'For serious growth with AI workflows and velocity.',
    cta: '/checkout?plan=pro',
    featured: true,
    features: [
      'Unlimited Funnels',
      'Premium Templates',
      'AI Content Generation',
      'Advanced Analytics',
      'Priority Support',
    ],
  },
  {
    name: 'Agency',
    price: '$60/mo',
    description: 'For teams running multiple offers and client systems.',
    cta: '/checkout?plan=agency',
    features: [
      'Everything in Pro',
      'White Label Options',
      'Team Collaboration',
      'API Access',
      'Dedicated Support',
    ],
  },
]

export function HeroSection() {
  const ui = useUIExpression()
  const motionEnabled = ui.hero.motionIntensity !== 'none'

  return (
    <section className="flex min-h-screen flex-col justify-center px-6 pb-12 pt-24 md:px-10 md:pt-32">
      <div className="mx-auto flex w-full max-w-6xl flex-col items-center gap-10">
        <motion.div
          className="hud-panel mission-console text-center"
          initial={motionEnabled ? { opacity: 0, y: 14 } : false}
          animate={motionEnabled ? { opacity: 1, y: 0 } : false}
          transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
        >
          <p className="system-ready justify-center">System Ready</p>
          <h1 className="mt-5 text-[42px] font-semibold leading-[1.1] tracking-[-0.02em] text-text-primary">
            Launchpad 4 Success
          </h1>
          <p className="mx-auto mt-3 max-w-[36ch] text-[15px] leading-[1.6] text-text-secondary">
            AI-native, quietly self-aware flight deck that builds, watches, and adapts with you.
          </p>
          <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
            <Link href="/get-started" className="btn-launch-premium px-7 py-3 text-sm">
              Initiate Launch
            </Link>
            <Link href="/builder-v2" className="btn-secondary-premium px-7 py-3 text-sm">
              View Demo
            </Link>
          </div>
        </motion.div>

        <motion.div
          id="tiers"
          className="grid w-full max-w-5xl gap-4 md:grid-cols-3"
          initial={motionEnabled ? { opacity: 0 } : false}
          animate={motionEnabled ? { opacity: 1 } : false}
          transition={{ duration: 0.25, delay: 0.1, ease: [0.4, 0, 0.2, 1] }}
        >
          {tiers.map((tier) => (
            <article
              key={tier.name}
              className={`hud-panel flex h-full flex-col ${
                tier.featured ? 'border border-brand-orange/60 shadow-[0_0_28px_rgba(249,115,22,0.22)]' : ''
              }`}
            >
              <div className="mb-4 flex items-center justify-between">
                <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-text-secondary">{tier.name}</p>
                {tier.featured ? (
                  <span className="rounded-full border border-brand-orange/60 bg-brand-orange/20 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-orange-200">
                    Popular
                  </span>
                ) : null}
              </div>
              <h2 className="text-3xl font-semibold text-text-primary">{tier.price}</h2>
              <p className="mt-2 text-[14px] leading-[1.6] text-text-secondary">{tier.description}</p>
              <ul className="mt-5 space-y-2 text-[14px] text-text-secondary">
                {tier.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-brand-orange" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
              <Link
                href={tier.cta}
                className={`mt-6 inline-flex items-center justify-center rounded-lg px-4 py-2.5 text-sm font-semibold transition ${
                  tier.featured ? 'btn-launch-premium' : 'btn-secondary-premium'
                }`}
              >
                Choose {tier.name}
              </Link>
            </article>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
