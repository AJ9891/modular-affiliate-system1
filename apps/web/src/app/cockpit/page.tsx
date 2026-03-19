'use client'

import { Suspense, useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { Sparkles, Rocket, BarChart3, Brain, Gauge, ShieldCheck, SunMoon } from 'lucide-react'
import { CockpitModules } from '@/components/CockpitModules'

const ONBOARDING_COMPLETE = 8
const COCKPIT_THEME_STORAGE_KEY = 'lp_cockpit_theme'
type CockpitTheme = 'dark' | 'light'

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
  const [theme, setTheme] = useState<CockpitTheme>('dark')

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

  useEffect(() => {
    if (typeof window === 'undefined') return
    const storedTheme = window.localStorage.getItem(COCKPIT_THEME_STORAGE_KEY)
    if (storedTheme === 'light' || storedTheme === 'dark') {
      setTheme(storedTheme)
    }
  }, [])

  if (loading) {
    return <LoadingState />
  }

  const toggleTheme = () => {
    setTheme((current) => {
      const next: CockpitTheme = current === 'dark' ? 'light' : 'dark'
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(COCKPIT_THEME_STORAGE_KEY, next)
      }
      return next
    })
  }

  const cockpitBackdropImage =
    theme === 'light' ? '/Backgrounds/dashboard-light.png' : '/Backgrounds/dashboard-dark.png'
  const cockpitBackdropFilter =
    theme === 'light'
      ? 'blur(1.4px) saturate(1.02) brightness(0.95)'
      : 'blur(1.8px) brightness(0.62)'
  const cockpitOverlay =
    theme === 'light'
      ? 'linear-gradient(to bottom, rgba(255, 255, 255, 0.18), rgba(244, 247, 250, 0.7), rgba(235, 241, 246, 0.84))'
      : 'linear-gradient(to bottom, rgba(0, 0, 0, 0.45), rgba(2, 6, 23, 0.55), rgba(0, 0, 0, 0.66))'

  return (
    <main className={`${theme === 'light' ? 'theme-light' : 'theme-dark'} cockpit-shell page-flight-deck`}>
      <div className="cockpit-container max-w-6xl py-10 space-y-8">
        <header className="hud-panel space-y-4">
          <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <div className="space-y-2">
              <p className="text-[12px] uppercase tracking-system text-text-secondary">Cockpit</p>
              <h1 className="text-[32px] font-semibold leading-[1.08] tracking-[-0.02em] text-text-primary md:text-[42px]">
                Flight Deck Overview
              </h1>
              <p className="text-[15px] leading-[1.6] text-text-secondary">
                Funnels, radar, email, billing - all from one deck. Systems nominal.
              </p>
            </div>
            <button
              onClick={toggleTheme}
              className="hud-button-secondary inline-flex min-h-[44px] items-center gap-2 px-4 py-2 text-sm"
              aria-label="Toggle cockpit theme"
            >
              <SunMoon size={16} />
              <span>{theme === 'light' ? 'Switch to Dark' : 'Switch to Light'}</span>
            </button>
          </div>
          {needsOnboarding && (
            <div className="hud-strip mt-1 flex flex-col gap-3 rounded-[10px] border border-amber-300/45 bg-amber-500/10 px-3 py-3 text-sm text-amber-100 md:flex-row md:items-center md:justify-between">
              <span>Complete onboarding to unlock full systems.</span>
              <div className="flex flex-wrap items-center gap-2">
                <a href="/launchpad" className="hud-button-secondary inline-flex min-h-[44px] items-center px-3 py-2 text-xs">
                  Resume Launch
                </a>
                <button
                  onClick={() => {
                    if (typeof window !== 'undefined') {
                      localStorage.setItem('lp_skip_onboarding', '1')
                    }
                    setNeedsOnboarding(true)
                  }}
                  className="hud-button-danger inline-flex min-h-[44px] items-center px-3 py-2 text-xs"
                >
                  Skip for now
                </button>
              </div>
            </div>
          )}
        </header>

        <section className="hud-panel">
          <p className="mb-3 text-[12px] uppercase tracking-system text-text-secondary">Interactive Modules</p>
          <div className="relative w-full overflow-hidden rounded-[12px]" style={{ aspectRatio: '16 / 9' }}>
            <div
              className="absolute inset-0 scale-105"
              style={{
                backgroundImage: `url('${cockpitBackdropImage}')`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                filter: cockpitBackdropFilter,
              }}
            />
            <div className="absolute inset-0" style={{ background: cockpitOverlay }} />
            <CockpitModules />
          </div>
        </section>

        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Card title="Funnels" desc="Build and publish" href="/visual-builder" icon={Rocket} theme={theme} />
          <Card title="AI Generator" desc="Copy and pages" href="/ai-generator" icon={Sparkles} theme={theme} />
          <Card title="Radar" desc="Leads, revenue, conversion" href="/radar" icon={BarChart3} theme={theme} />
          <Card title="Optimizer" desc="A/B and guardrails" href="/ai-optimizer" icon={Brain} theme={theme} />
          <Card title="Billing" desc="Stripe and plans" href="/subscription" icon={ShieldCheck} theme={theme} />
          <Card title="Domains" desc="Routing and SSL" href="/domains" icon={Gauge} theme={theme} />
        </section>

        <section className="hud-panel">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-[12px] uppercase tracking-system text-text-secondary">Systems Note</p>
              <h2 className="text-[28px] font-semibold text-text-primary">A quiet copilot is listening.</h2>
              <p className="text-[15px] leading-[1.6] text-text-secondary">
                Vision monitors the deck and can surface suggestions when you need them. Find it in the modules, not the spotlight.
              </p>
            </div>
            <a href="/launchpad/vision-preview" className="hud-button-secondary mt-2 inline-flex min-h-[44px] items-center px-4 py-2 text-sm">
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
    <div className="theme-dark cockpit-shell page-flight-deck flex min-h-screen items-center justify-center">
      <div className="text-center">
        <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-b-2 border-rocket-500" />
        <p className="text-sm text-text-secondary">Preparing cockpit...</p>
      </div>
    </div>
  )
}

function Card({
  title,
  desc,
  href,
  icon: Icon,
  theme
}: {
  title: string
  desc: string
  href: string
  icon: React.ElementType
  theme: CockpitTheme
}) {
  const iconBorder = theme === 'light' ? 'rgba(31, 199, 167, 0.45)' : 'rgba(46, 230, 194, 0.45)'
  const iconText = theme === 'light' ? '#159C86' : '#8AF5DF'
  const iconBackground = theme === 'light' ? 'rgba(31, 199, 167, 0.08)' : 'rgba(6, 12, 18, 0.62)'

  return (
    <a
      href={href}
      className="hud-card group relative min-h-[44px] overflow-hidden transition-[border-color,box-shadow,transform] duration-200 ease-smooth hover:-translate-y-0.5 hover:border-[rgba(46,230,194,0.35)]"
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(46,230,194,0.08),transparent_32%),radial-gradient(circle_at_80%_0%,rgba(31,199,167,0.08),transparent_32%)] opacity-0 transition duration-200 ease-smooth group-hover:opacity-100" />
      <div className="relative flex items-center justify-between">
        <div className="flex flex-col gap-1">
          <span className="text-[18px] font-medium text-text-primary">{title}</span>
          <span className="text-[15px] leading-[1.6] text-text-secondary">{desc}</span>
        </div>
        <div className="rounded-full p-2" style={{ border: `1px solid ${iconBorder}`, color: iconText, background: iconBackground }}>
          <Icon size={18} />
        </div>
      </div>
    </a>
  )
}
