'use client'

import Link from 'next/link'
import { Suspense, useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { Sparkles, Rocket, Brain, SunMoon, Radar, Settings2, MessageSquare, Flame, Compass, BarChart3 } from 'lucide-react'
import { COCKPIT_MODULES } from '@/config/cockpitModules'

const ONBOARDING_COMPLETE = 8
const COCKPIT_THEME_STORAGE_KEY = 'lp_cockpit_theme'
type CockpitTheme = 'dark' | 'light'

const MODULE_META: Record<string, { description: string; icon: React.ElementType }> = {
  vision: { description: 'Strategic view and system intent.', icon: Sparkles },
  radar: { description: 'Signal tracking and performance scans.', icon: Radar },
  settings: { description: 'Core system preferences and controls.', icon: Settings2 },
  communications: { description: 'Messages and campaign communication.', icon: MessageSquare },
  fuel: { description: 'Plans, billing, and monetization systems.', icon: Flame },
  navigation: { description: 'Routing and direction across the stack.', icon: Compass },
  propulsion: { description: 'Funnels and launch execution engine.', icon: Rocket },
  intelligence: { description: 'AI workflows and reasoning controls.', icon: Brain },
  telemetry: { description: 'Live metrics and operational telemetry.', icon: BarChart3 },
}

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
        .select('onboarding_step, onboarding_complete, is_admin')
        .eq('id', user.id)
        .maybeSingle()

      const isAdmin = Boolean(data?.is_admin)
      const onboardingStep = Number(data?.onboarding_step ?? 0)
      const onboardingComplete = Boolean(data?.onboarding_complete) || onboardingStep >= ONBOARDING_COMPLETE

      if (!error && data && !isAdmin && !onboardingComplete) {
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

        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {COCKPIT_MODULES.map((module) => {
            const meta = MODULE_META[module.id] || { description: 'Module access panel.', icon: Sparkles }
            return (
              <Card
                key={module.id}
                title={module.name}
                desc={meta.description}
                href={module.route}
                icon={meta.icon}
                theme={theme}
              />
            )
          })}
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
    <Link
      href={href}
      className="glass-tile group relative min-h-[44px] overflow-hidden border-white/12 bg-white/[0.045] backdrop-blur-xl transition-[border-color,box-shadow,transform] duration-200 ease-smooth hover:-translate-y-0.5 hover:border-[rgba(46,230,194,0.35)] hover:shadow-[0_14px_38px_rgba(0,0,0,0.28)]"
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(46,230,194,0.08),transparent_34%),radial-gradient(circle_at_80%_0%,rgba(31,199,167,0.08),transparent_34%)] opacity-0 transition duration-200 ease-smooth group-hover:opacity-100" />
      <div className="relative flex items-center justify-between gap-4">
        <div className="flex min-w-0 flex-col gap-1">
          <span className="text-[18px] font-medium text-text-primary">{title}</span>
          <span className="text-[14px] leading-[1.5] text-text-secondary">{desc}</span>
        </div>
        <div
          className="rounded-full p-2.5"
          style={{ border: `1px solid ${iconBorder}`, color: iconText, background: iconBackground }}
        >
          <Icon size={17} />
        </div>
      </div>
    </Link>
  )
}
