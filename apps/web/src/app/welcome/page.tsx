'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import OnboardingSlideshow from '@/components/OnboardingSlides'
import { supabase } from '@/lib/supabase'

const ONBOARDING_COMPLETE = 8

export default function WelcomePage() {
  const router = useRouter()
  const [userId, setUserId] = useState<string | null>(null)
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

        const { data: profile, error } = await supabase
          .from('users')
          .select('onboarding_seen, onboarding_step, onboarding_complete, is_admin')
          .eq('id', user.id)
          .maybeSingle()

        if (!error && profile) {
          const isAdmin = Boolean(profile.is_admin)
          const step = Number(profile.onboarding_step ?? 0)
          const onboardingComplete = Boolean(profile.onboarding_complete) || step >= ONBOARDING_COMPLETE

          if (isAdmin || onboardingComplete) {
            router.replace('/cockpit')
            return
          }

          if (profile.onboarding_seen) {
            router.replace('/launchpad')
            return
          }

          return
        }

        setUserId(user.id)
      } finally {
        setLoading(false)
      }
    }

    bootstrap()
  }, [router])

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950 text-slate-100">
        <div className="text-sm text-slate-300">Preparing welcome sequence...</div>
      </div>
    )
  }

  if (!userId) {
    return null
  }

  return <OnboardingSlideshow userId={userId} />
}
