'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  BarChart3,
  Brain,
  Compass,
  Flame,
  MessageSquare,
  Radar,
  Rocket,
  Settings2,
  Sparkles,
  SunMoon,
} from 'lucide-react'
import { COCKPIT_MODULES } from '@/config/cockpitModules'

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

export default function SystemPage() {
  const [theme, setTheme] = useState<Theme>('dark')

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
          {COCKPIT_MODULES.map((module) => {
            const meta = MODULE_META[module.id] || {
              description: 'Module access panel.',
              icon: Sparkles,
            }

            return (
              <ModuleCard
                key={module.id}
                title={module.name}
                description={meta.description}
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

function ModuleCard({
  title,
  description,
  href,
  icon: Icon,
  theme,
}: {
  title: string
  description: string
  href: string
  icon: React.ElementType
  theme: Theme
}) {
  const iconBorder = theme === 'light' ? 'rgba(31, 199, 167, 0.3)' : 'rgba(46, 230, 194, 0.25)'
  const iconText = theme === 'light' ? '#1f6f63' : '#9bf9df'
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
          <span className="text-[14px] leading-[1.5] text-text-secondary">{description}</span>
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
