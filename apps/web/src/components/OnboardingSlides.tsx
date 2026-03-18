'use client'

import { useState } from 'react'
import { onboardingSlides } from '@/lib/onboardingSlides'
import { supabase } from '@/lib/supabase'

export default function OnboardingSlideshow({ userId }: { userId: string }) {
  const [index, setIndex] = useState(0)

  const slide = onboardingSlides[index]
  const isLastSlide = index === onboardingSlides.length - 1

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
        onboarding_seen: true
      })
      .eq('id', userId)
  }

  const next = async () => {
    if (isLastSlide) {
      await completeOnboarding()
      goToCockpit()
    } else {
      setIndex(i => i + 1)
    }
  }

  const skip = async () => {
    await completeOnboarding()
    goToCockpit()
  }

  return (
    <div className="fixed inset-0 z-50 bg-black text-white flex flex-col justify-center items-center">
      <button
        className="absolute top-4 right-4 text-sm text-orange-300 hover:text-orange-200 transition"
        onClick={skip}
      >
        Skip
      </button>

      <h1 className="text-3xl font-bold mb-6">{slide.title}</h1>
      <p className="max-w-xl text-center text-lg opacity-90">{slide.body}</p>

      <div className="mt-10">
        <button
          onClick={next}
          className="px-6 py-3 bg-orange-700 hover:bg-orange-600 text-white rounded-lg transition"
        >
          {isLastSlide ? 'Go to Cockpit' : (slide.cta ?? 'Next')}
        </button>
      </div>

      <div className="flex gap-2 mt-6">
        {onboardingSlides.map((_, i) => (
          <div
            key={i}
            className={`h-2 w-2 rounded-full ${
              i === index ? 'bg-orange-400' : 'bg-white/30'
            }`}
          />
        ))}
      </div>
    </div>
  )
}
