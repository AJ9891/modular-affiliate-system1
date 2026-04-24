'use client'

import { useEffect, useState } from 'react'
import { onboardingSlides } from '@/lib/onboardingSlides'
import { supabase } from '@/lib/supabase'

export default function OnboardingSlideshow({ userId }: { userId: string }) {
  const introCarousel = [
    {
      title: 'Build Faster With a Guided System',
      body: 'Launchpad gives you a clear path from idea to live funnel so you do not waste time guessing the next step.',
      eyebrow: 'Mission Control',
    },
    {
      title: 'Turn Content Into Conversions',
      body: 'Use prebuilt workflows, automation, and conversion-focused blocks to move from setup to results faster.',
      eyebrow: 'Conversion Engine',
    },
    {
      title: 'See Progress in Real Time',
      body: 'Track funnel activity, lead movement, and key metrics while you build so you can make faster decisions.',
      eyebrow: 'Live Analytics',
    },
  ] as const

  const [showOnboarding, setShowOnboarding] = useState(false)
  const [carouselIndex, setCarouselIndex] = useState(0)
  const [index, setIndex] = useState(0)
  const [submitting, setSubmitting] = useState(false)

  const slide = onboardingSlides[index]
  const isLastSlide = index === onboardingSlides.length - 1
  const progressPercent = Math.round(((index + 1) / onboardingSlides.length) * 100)
  const carouselSlide = introCarousel[carouselIndex]

  useEffect(() => {
    if (showOnboarding) return

    const timer = window.setInterval(() => {
      setCarouselIndex((current) => (current + 1) % introCarousel.length)
    }, 4500)

    return () => window.clearInterval(timer)
  }, [showOnboarding, introCarousel.length])

  const goToCockpit = () => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('lp_skip_onboarding', '1')
      document.cookie = 'lp_skip_onboarding=1; Path=/; Max-Age=2592000; SameSite=Lax'
    }
    window.location.href = '/cockpit?skip_onboarding=1'
  }

  const completeOnboarding = async () => {
    await supabase
      .from('users')
      .update({
        onboarding_seen: true,
        onboarding_step: 1,
      })
      .eq('id', userId)
  }

  const next = async () => {
    if (submitting) return

    if (isLastSlide) {
      setSubmitting(true)
      try {
        await completeOnboarding()
        goToCockpit()
      } finally {
        setSubmitting(false)
      }
    } else {
      setIndex((i) => i + 1)
    }
  }

  const skip = async () => {
    if (submitting) return

    setSubmitting(true)
    try {
      await completeOnboarding()
      goToCockpit()
    } finally {
      setSubmitting(false)
    }
  }

  if (!showOnboarding) {
    return (
      <div className="theme-launch cockpit-shell fixed inset-0 z-50 flex items-center justify-center bg-[radial-gradient(circle_at_top,rgba(255,160,64,0.2),rgba(5,10,16,0.95))] p-6">
        <div className="card-premium w-full max-w-3xl rounded-2xl border border-[var(--border-elevated)] bg-[rgba(6,10,16,0.88)] p-8 shadow-2xl backdrop-blur-xl md:p-10">
          <div className="mb-8 flex items-start justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-rocket-500">Welcome Carousel</p>
              <p className="mt-2 text-sm text-text-secondary">Preview Launchpad before onboarding begins.</p>
            </div>
            <button
              className="hud-button-secondary px-3 py-1.5 text-sm"
              onClick={skip}
              disabled={submitting}
            >
              Skip
            </button>
          </div>

          <div className="rounded-xl border border-[var(--border-elevated)] bg-[rgba(10,16,24,0.55)] p-6 md:p-8">
            <p className="text-xs uppercase tracking-[0.18em] text-rocket-500">{carouselSlide.eyebrow}</p>
            <h1 className="mt-3 text-3xl font-semibold tracking-tight text-text-primary md:text-4xl">{carouselSlide.title}</h1>
            <p className="mt-4 max-w-2xl text-base text-text-secondary md:text-lg">{carouselSlide.body}</p>
          </div>

          <div className="mt-8 flex flex-wrap items-center justify-between gap-3">
            <button
              type="button"
              onClick={() => setCarouselIndex((current) => (current - 1 + introCarousel.length) % introCarousel.length)}
              disabled={submitting}
              className="hud-button-secondary px-4 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-40"
            >
              Previous
            </button>

            <div className="flex gap-2">
              {introCarousel.map((_, i) => (
                <button
                  type="button"
                  key={i}
                  onClick={() => setCarouselIndex(i)}
                  disabled={submitting}
                  aria-label={`View carousel slide ${i + 1}`}
                  className={`h-2 rounded-full transition-all ${i === carouselIndex ? 'w-8 bg-rocket-500' : 'w-2 bg-[var(--border-subtle)]'}`}
                />
              ))}
            </div>

            <button
              type="button"
              onClick={() => setShowOnboarding(true)}
              disabled={submitting}
              className="btn-launch-premium px-6 py-3 text-sm disabled:opacity-60"
            >
              Begin Onboarding
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="theme-launch cockpit-shell fixed inset-0 z-50 flex items-center justify-center bg-[radial-gradient(circle_at_top,rgba(255,160,64,0.2),rgba(5,10,16,0.95))] p-6">
      <div className="card-premium w-full max-w-3xl rounded-2xl border border-[var(--border-elevated)] bg-[rgba(6,10,16,0.88)] p-8 shadow-2xl backdrop-blur-xl md:p-10">
        <div className="mb-8 flex items-start justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-rocket-500">Welcome Sequence</p>
            <p className="mt-2 text-sm text-text-secondary">
              Step {index + 1} of {onboardingSlides.length}
            </p>
          </div>
          <button
            className="hud-button-secondary px-3 py-1.5 text-sm"
            onClick={skip}
            disabled={submitting}
          >
            Skip
          </button>
        </div>

        <div className="mb-8 h-1.5 overflow-hidden rounded-full bg-[var(--border-subtle)]">
          <div className="h-full bg-gradient-to-r from-rocket-600 to-rocket-500 transition-all duration-500" style={{ width: `${progressPercent}%` }} />
        </div>

        <h1 className="mb-4 text-3xl font-semibold tracking-tight text-text-primary md:text-4xl">{slide.title}</h1>
        <p className="max-w-2xl text-base text-text-secondary md:text-lg">{slide.body}</p>

        <div className="mt-10 flex flex-wrap items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => setIndex((current) => Math.max(0, current - 1))}
            disabled={index === 0 || submitting}
            className="hud-button-secondary px-4 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-40"
          >
            Back
          </button>

          <button
            onClick={next}
            disabled={submitting}
            className="btn-launch-premium px-6 py-3 text-sm disabled:opacity-60"
          >
            {submitting ? 'Finishing...' : isLastSlide ? 'Go to Cockpit' : (slide.cta ?? 'Next')}
          </button>
        </div>

        <div className="mt-6 flex gap-2">
          {onboardingSlides.map((_, i) => (
            <div
              key={i}
              className={`h-2 rounded-full transition-all ${i === index ? 'w-8 bg-rocket-500' : 'w-2 bg-[var(--border-subtle)]'}`}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
