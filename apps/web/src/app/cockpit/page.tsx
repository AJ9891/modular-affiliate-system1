'use client'

import { Suspense, useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { Sparkles, Rocket, BarChart3, Brain, Gauge, ShieldCheck } from 'lucide-react'
import { CockpitModules } from '@/components/CockpitModules'

const ONBOARDING_COMPLETE = 8

export default function CockpitHome() {
  return (
    <Suspense fallback={<LoadingState />}>
      <CockpitContent />
    </Suspense>
  )
}

function CockpitContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [loading, setLoading] = useState(true)
  const [needsOnboarding, setNeedsOnboarding] = useState(false)

  useEffect(() => {
    const run = async () => {
      // If Supabase isn't configured, fail open so the UI still renders
      if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
        setLoading(false)
        return
      }

      const { data: auth } = await supabase.auth.getUser()
      const user = auth?.user
      if (!user) {
        router.replace('/login?redirectTo=/cockpit')
        return
      }

      const skipFlag =
        typeof window !== 'undefined' &&
        (localStorage.getItem('lp_skip_onboarding') === '1' ||
          searchParams.get('skip_onboarding') === '1')

      const { data, error } = await supabase
        .from('users')
        .select('onboarding_step')
        .eq('id', user.id)
        .maybeSingle()

      if (!error && data && (data.onboarding_step ?? 0) < ONBOARDING_COMPLETE) {
        if (!skipFlag) {
          router.replace('/launchpad')
          return
        }

        if (typeof window !== 'undefined') {
          localStorage.setItem('lp_skip_onboarding', '1')
        }
        setNeedsOnboarding(true)
      }

      setLoading(false)
    }

    run()
  }, [router, searchParams])

  if (loading) {
    return <LoadingState />
  }

  return (
    <main className="theme-orbit text-slate-50">
      <div className="mx-auto max-w-6xl px-6 py-10 space-y-10">
        <header className="flex flex-col gap-2">
          <p className="text-xs uppercase tracking-[0.3em] text-cyan-300/70">Cockpit</p>
          <h1 className="text-3xl font-semibold text-white">Flight Deck Overview</h1>
          <p className="text-sm text-slate-300">
            Funnels, radar, email, billing — all from one deck. Systems nominal.
          </p>
          {needsOnboarding && (
            <div className="mt-3 rounded-lg border border-amber-400/40 bg-amber-500/10 px-3 py-2 text-sm text-amber-100 flex items-center justify-between">
              <span>Complete onboarding to unlock full systems.</span>
              <div className="flex items-center gap-2">
                <a
                  href="/launchpad"
                  className="rounded-md border border-amber-300/60 px-3 py-1 text-amber-50 hover:border-amber-200 transition"
                >
                  Resume Launch
                </a>
                <button
                  onClick={() => {
                    if (typeof window !== 'undefined') {
                      localStorage.setItem('lp_skip_onboarding', '1')
                    }
                    setNeedsOnboarding(true)
                  }}
                  className="rounded-md border border-amber-300/40 px-3 py-1 text-amber-100/80 hover:border-amber-200/80 transition"
                >
                  Skip for now
                </button>
              </div>
            </div>
          )}
        </header>

        {/* Interactive modules map */}
        <div className="relative overflow-hidden rounded-xl border border-white/10 bg-black/30 p-4 backdrop-blur">
          <div
            className="relative w-full overflow-hidden"
            style={{
              aspectRatio: '16 / 9',
              borderRadius: '12px'
            }}
          >
            <div
              className="absolute inset-0 scale-105"
              style={{
                backgroundImage: "url('/Backgrounds/dashboard-dark.png')",
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                filter: 'blur(1.8px) brightness(0.62)',
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-b from-black/45 via-slate-950/55 to-black/65" />
            <CockpitModules />
          </div>
        </div>

        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Card title="Funnels" desc="Build and publish" href="/visual-builder" icon={Rocket} />
          <Card title="AI Generator" desc="Copy & pages" href="/ai-generator" icon={Sparkles} />
          <Card title="Radar" desc="Leads · revenue · conv." href="/radar" icon={BarChart3} />
          <Card title="Optimizer" desc="A/B + guardrails" href="/ai-optimizer" icon={Brain} />
          <Card title="Billing" desc="Stripe & plans" href="/subscription" icon={ShieldCheck} />
          <Card title="Domains" desc="Routing & SSL" href="/domains" icon={Gauge} />
        </section>

        {/* Subtle Vision hint, not the hero */}
        <section className="rounded-xl border border-white/10 bg-gradient-to-r from-slate-900/70 to-slate-900/30 p-5 backdrop-blur">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.25em] text-cyan-200/70">Systems Note</p>
              <h2 className="text-lg font-semibold text-white">A quiet copilot is listening.</h2>
              <p className="text-sm text-slate-300">
                Vision monitors the deck and can surface suggestions when you need them. Find it in the modules, not the spotlight.
              </p>
            </div>
            <a
              href="/launchpad/vision-preview"
              className="mt-3 inline-flex items-center gap-2 rounded-lg border border-cyan-400/50 px-3 py-2 text-sm text-cyan-100 transition hover:border-cyan-300 hover:text-white"
            >
              Open quietly
            </a>
          </div>
        </section>
      </div>
    </main>
  )
}

function LoadingState() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 text-slate-100">
      <div className="text-center">
        <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-b-2 border-cyan-400" />
        <p className="text-sm opacity-80">Preparing cockpit...</p>
      </div>
    </div>
  )
}

function Card({
  title,
  desc,
  href,
  icon: Icon
}: {
  title: string
  desc: string
  href: string
  icon: React.ElementType
}) {
  return (
    <a
      href={href}
      className="group relative overflow-hidden rounded-2xl border border-white/10 bg-slate-900/60 p-5 transition hover:border-cyan-400/40 hover:shadow-[0_0_35px_-15px_rgba(56,189,248,0.55)]"
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(56,189,248,0.08),transparent_30%),radial-gradient(circle_at_80%_0%,rgba(94,234,212,0.08),transparent_28%)] opacity-0 transition group-hover:opacity-100" />
      <div className="relative flex items-center justify-between">
        <div className="flex flex-col gap-1">
          <span className="text-sm font-semibold text-white">{title}</span>
          <span className="text-xs text-slate-300">{desc}</span>
        </div>
        <div className="rounded-full border border-cyan-400/40 bg-slate-900/70 p-2 text-cyan-200">
          <Icon size={18} />
        </div>
      </div>
    </a>
  )
}
