'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import PreflightOnboarding from '@/components/onboarding/PreflightOnboarding'
import { supabase } from '@/lib/supabase'
import {
  ONBOARDING_COMPLETE_STEP,
  createDefaultPreflightState,
  type PreflightState,
} from '@/lib/onboarding/preflight'

export default function WelcomePage() {
  const router = useRouter()
  const [state, setState] = useState<PreflightState | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const bootstrap = async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser()

        if (!user) {
          router.replace('/login?redirectTo=/welcome')
          return
        }

        const response = await fetch('/api/onboarding/state', { cache: 'no-store' })

        if (!response.ok) {
          setState(createDefaultPreflightState())
          return
        }

        const nextState = (await response.json()) as PreflightState

        if (nextState.onboardingComplete || nextState.onboardingStep >= ONBOARDING_COMPLETE_STEP) {
          router.replace('/cockpit')
          return
        }

        if (nextState.preflightComplete || nextState.onboardingSeen) {
          router.replace('/launchpad?first_launch=1')
          return
        }

        setState(nextState)
      } catch {
        setState(createDefaultPreflightState())
      } finally {
        setLoading(false)
      }
    }

    bootstrap()
  }, [router])

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950 text-slate-100">
        <div className="text-sm text-slate-300">Calibrating preflight sequence...</div>
      </div>
    )
  }

  if (!state) {
    return null
  }

  return <PreflightOnboarding initialState={state} onComplete={() => router.replace('/launchpad?first_launch=1')} />
}
