'use client'

import { Suspense, useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { hasAdminAccess } from '@/lib/admin-access'
import { Sparkles, Rocket, Brain, SunMoon, Radar, Settings2, MessageSquare, Flame, Compass, BarChart3, ExternalLink, X } from 'lucide-react'
import { COCKPIT_MODULES, type CockpitModule } from '@/config/cockpitModules'

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

function isHiddenModule(module: CockpitModule) {
  const id = module.id.toLowerCase()
  const name = module.name.toLowerCase()
  return id === 'photo' || id === 'cockpit' || name === 'photo' || name === 'cockpit'
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
  const [selectedModule, setSelectedModule] = useState<CockpitModule | null>(null)

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
        .select('onboarding_step, onboarding_complete, is_admin, role')
        .eq('id', user.id)
        .maybeSingle()

      const isAdmin = hasAdminAccess(data)
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

  useEffect(() => {
    if (!selectedModule) return

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setSelectedModule(null)
      }
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [selectedModule])

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

  const visibleModules = COCKPIT_MODULES.filter((module) => !isHiddenModule(module))
  const selectedMeta = selectedModule
    ? MODULE_META[selectedModule.id] || { description: 'Module access panel.', icon: Sparkles }
    : null

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
          {visibleModules.map((module) => {
            const meta = MODULE_META[module.id] || { description: 'Module access panel.', icon: Sparkles }
            return (
              <Card
                key={module.id}
                title={module.name}
                desc={meta.description}
                icon={meta.icon}
                theme={theme}
                onOpen={() => setSelectedModule(module)}
              />
            )
          })}
        </section>
      </div>

      {selectedModule && selectedMeta && (
        <div
          className="fixed inset-0 z-[70] flex items-center justify-center bg-black/65 px-4 backdrop-blur-sm"
          onClick={() => setSelectedModule(null)}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="module-overlay-title"
            className="glass-tile relative w-full max-w-[580px] border-white/20 bg-[rgba(8,14,24,0.86)] p-0 shadow-[0_26px_80px_rgba(0,0,0,0.52)]"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="pointer-events-none absolute inset-0 rounded-[14px] bg-[radial-gradient(circle_at_12%_0%,rgba(46,230,194,0.16),transparent_46%),radial-gradient(circle_at_92%_100%,rgba(31,199,167,0.14),transparent_42%)]" />
            <div className="relative space-y-4 p-5 sm:p-6">
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-2">
                  <p className="text-[12px] uppercase tracking-system text-text-secondary">Module Overlay</p>
                  <h2 id="module-overlay-title" className="text-[24px] font-semibold leading-tight text-text-primary">
                    {selectedModule.name}
                  </h2>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedModule(null)}
                  className="inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-lg border border-white/20 text-text-secondary transition hover:text-text-primary"
                  aria-label="Close module overlay"
                >
                  <X size={16} />
                </button>
              </div>

              <p className="text-[14px] leading-relaxed text-text-secondary">{selectedMeta.description}</p>
              <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-white/12 bg-black/25 px-3 py-3">
                <span className="text-xs uppercase tracking-system text-text-secondary">Destination</span>
                <span className="font-mono text-xs text-text-primary">{selectedModule.route}</span>
              </div>

              <div className="flex flex-wrap justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setSelectedModule(null)}
                  className="hud-button-secondary inline-flex min-h-[44px] items-center px-4 py-2 text-sm"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => {
                    router.push(selectedModule.route)
                    setSelectedModule(null)
                  }}
                  className="hud-button-primary inline-flex min-h-[44px] items-center gap-2 px-4 py-2 text-sm"
                >
                  <ExternalLink size={14} />
                  Open Module
                </button>
              </div>
            </div>
          </section>
        </div>
      )}
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
  icon: Icon,
  theme,
  onOpen,
}: {
  title: string
  desc: string
  icon: React.ElementType
  theme: CockpitTheme
  onOpen: () => void
}) {
  const iconBorder = theme === 'light' ? 'rgba(31, 199, 167, 0.45)' : 'rgba(46, 230, 194, 0.45)'
  const iconText = theme === 'light' ? '#159C86' : '#8AF5DF'
  const iconBackground = theme === 'light' ? 'rgba(31, 199, 167, 0.08)' : 'rgba(6, 12, 18, 0.62)'

  return (
    <button
      type="button"
      onClick={onOpen}
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
    </button>
  )
}
