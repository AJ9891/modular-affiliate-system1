'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  BarChart3,
  Brain,
  Compass,
  ExternalLink,
  Flame,
  MessageSquare,
  Radar,
  Rocket,
  Settings2,
  Sparkles,
  SunMoon,
  X,
} from 'lucide-react'
import { COCKPIT_MODULES, type CockpitModule } from '@/config/cockpitModules'

type Theme = 'dark' | 'light'

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

export default function SystemPage() {
  const router = useRouter()
  const [theme, setTheme] = useState<Theme>('dark')
  const [selectedModule, setSelectedModule] = useState<CockpitModule | null>(null)
  const visibleModules = COCKPIT_MODULES.filter((module) => !isHiddenModule(module))
  const selectedMeta = selectedModule
    ? MODULE_META[selectedModule.id] || { description: 'Module access panel.', icon: Sparkles }
    : null

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

  return (
    <main className={`${theme === 'light' ? 'theme-light' : 'theme-dark'} cockpit-shell page-flight-deck min-h-screen`}>
      <div className="cockpit-container max-w-6xl space-y-8 py-10">
        <header className="hud-panel flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-system text-text-secondary">System Navigation</p>
            <h1 className="mt-2 text-3xl font-semibold text-text-primary md:text-4xl">Platform Modules</h1>
            <p className="mt-2 text-sm text-text-secondary">
              Open any module directly from this system panel.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'))}
            className="hud-pill inline-flex items-center gap-2 border-white/25 text-xs"
            aria-label="Toggle system theme"
          >
            <SunMoon size={14} />
            {theme === 'dark' ? 'Dark Theme' : 'Light Theme'}
          </button>
        </header>

        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {visibleModules.map((module) => {
            const meta = MODULE_META[module.id] || {
              description: 'Module access panel.',
              icon: Sparkles,
            }

            return (
              <ModuleCard
                key={module.id}
                title={module.name}
                description={meta.description}
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
            aria-labelledby="system-module-overlay-title"
            className="glass-tile relative w-full max-w-[580px] border-white/20 bg-[rgba(8,14,24,0.86)] p-0 shadow-[0_26px_80px_rgba(0,0,0,0.52)]"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="pointer-events-none absolute inset-0 rounded-[14px] bg-[radial-gradient(circle_at_12%_0%,rgba(46,230,194,0.16),transparent_46%),radial-gradient(circle_at_92%_100%,rgba(31,199,167,0.14),transparent_42%)]" />
            <div className="relative space-y-4 p-5 sm:p-6">
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-2">
                  <p className="text-[12px] uppercase tracking-system text-text-secondary">Module Overlay</p>
                  <h2 id="system-module-overlay-title" className="text-[24px] font-semibold leading-tight text-text-primary">
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

function ModuleCard({
  title,
  description,
  icon: Icon,
  theme,
  onOpen,
}: {
  title: string
  description: string
  icon: React.ElementType
  theme: Theme
  onOpen: () => void
}) {
  const iconBorder = theme === 'light' ? 'rgba(31, 199, 167, 0.3)' : 'rgba(46, 230, 194, 0.25)'
  const iconText = theme === 'light' ? '#1f6f63' : '#9bf9df'
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
          <span className="text-[14px] leading-[1.5] text-text-secondary">{description}</span>
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
