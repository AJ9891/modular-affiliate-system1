'use client'

import { useState } from 'react'
import { onboardingSlides } from '@/lib/onboardingSlides'
import { supabase } from '@/lib/supabase'

export default function OnboardingSlideshow({ userId }: { userId: string }) {
  const [index, setIndex] = useState(0)

  const slide = onboardingSlides[index]

  const completeOnboarding = async () => {
    await supabase
      .from('users')
      .update({ 
        onboarding_seen: true
      })
      .eq('id', userId)
  }

  const next = async () => {
    if (index === onboardingSlides.length - 1) {
      await completeOnboarding()
      window.location.href = '/launchpad'
    } else {
      setIndex(i => i + 1)
    }
  }

  const skip = async () => {
    await completeOnboarding()
  }

  return (
    <div className="fixed inset-0 z-50 bg-black text-white flex flex-col justify-center items-center">
      <button
        className="absolute top-4 right-4 text-sm opacity-70"
        onClick={skip}
      >
        Skip
      </button>

      <h1 className="text-3xl font-bold mb-6">{slide.title}</h1>
      <p className="max-w-xl text-center text-lg opacity-90">{slide.body}</p>

      <div className="mt-10">
        <button
          onClick={next}
          className="px-6 py-3 bg-brand-cyan text-black rounded-lg"
        >
          {slide.cta ?? 'Next'}
        </button>
      </div>

      <div className="flex gap-2 mt-6">
        {onboardingSlides.map((_, i) => (
          <div
            key={i}
            className={`h-2 w-2 rounded-full ${
              i === index ? 'bg-white' : 'bg-white/30'
            }`}
          />
        ))}
      </div>
    </div>
  )
}