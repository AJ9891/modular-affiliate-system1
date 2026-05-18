'use client'

import { useState } from 'react'
import { onboardingSlides } from '@/lib/onboardingSlides'
import { supabase } from '@/lib/supabase'

export default function OnboardingSlideshow({ userId }: { userId: string }) {
  const [index, setIndex] = useState(0)
  const [submitting, setSubmitting] = useState(false)

  const slide = onboardingSlides[index]
  const isLastSlide = index === onboardingSlides.length - 1
  const progressPercent = Math.round(((index + 1) / onboardingSlides.length) * 100)

  const goToOnboardingFlow = () => {
    window.location.href = '/welcome'
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
        goToOnboardingFlow()
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
      goToOnboardingFlow()
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[radial-gradient(circle_at_top,rgba(255,160,64,0.28),rgba(5,10,16,0.95))] p-6 text-white">
      <div className="w-full max-w-3xl rounded-2xl border border-white/15 bg-[rgba(3,8,14,0.86)] p-8 shadow-2xl backdrop-blur-xl md:p-10">
        <div className="mb-8 flex items-start justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-orange-200/80">Welcome Sequence</p>
            <p className="mt-2 text-sm text-slate-300">
              Step {index + 1} of {onboardingSlides.length}
            </p>
          </div>
          <button
            className="rounded-lg border border-white/25 px-3 py-1.5 text-sm text-slate-200 transition hover:border-white/40 hover:text-white disabled:opacity-60"
            onClick={skip}
            disabled={submitting}
          >
            Skip
          </button>
        </div>

        <div className="mb-8 h-1.5 overflow-hidden rounded-full bg-white/10">
          <div className="h-full bg-gradient-to-r from-orange-500 to-amber-300 transition-all duration-500" style={{ width: `${progressPercent}%` }} />
        </div>

        <h1 className="mb-4 text-3xl font-semibold tracking-tight md:text-4xl">{slide.title}</h1>
        <p className="max-w-2xl text-base text-slate-200 md:text-lg">{slide.body}</p>

        <div className="mt-10 flex flex-wrap items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => setIndex((current) => Math.max(0, current - 1))}
            disabled={index === 0 || submitting}
            className="rounded-lg border border-white/20 px-4 py-2 text-sm text-slate-200 transition hover:border-white/35 hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
          >
            Back
          </button>

          <button
            onClick={next}
            disabled={submitting}
            className="rounded-lg bg-orange-600 px-6 py-3 font-semibold text-white transition hover:bg-orange-500 disabled:opacity-60"
          >
            {submitting ? 'Finishing...' : isLastSlide ? 'Complete Onboarding' : (slide.cta ?? 'Next')}
          </button>
        </div>

        <div className="mt-6 flex gap-2">
          {onboardingSlides.map((_, i) => (
            <div
              key={i}
              className={`h-2 rounded-full transition-all ${i === index ? 'w-8 bg-orange-400' : 'w-2 bg-white/25'}`}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
