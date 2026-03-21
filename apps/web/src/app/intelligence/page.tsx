'use client'

import type { ElementType } from 'react'
import { Brain, Sparkles, Zap } from 'lucide-react'
import { BRAND_MODES, type BrandModeKey, useBrandMode } from '@/contexts/BrandModeContext'
import { getBrandModeTheme } from '@/lib/brand/brandModeTheme'

const PERSONALITY_ORDER: BrandModeKey[] = ['rocket', 'meltdown', 'antiguru']

const PERSONA_META: Record<BrandModeKey, { title: string; icon: ElementType; summary: string }> = {
  rocket: {
    title: 'Rocket Future',
    icon: Sparkles,
    summary: 'Optimistic momentum and launch-first execution.',
  },
  meltdown: {
    title: 'AI Meltdown',
    icon: Brain,
    summary: 'Skeptical AI analyst with a sharper edge.',
  },
  antiguru: {
    title: 'Anti-Guru',
    icon: Zap,
    summary: 'Direct, no-hype operator mode.',
  },
}

export default function IntelligencePage() {
  const { mode, setMode } = useBrandMode()
  const activeTheme = getBrandModeTheme(mode)

  return (
    <main className="page-ai-core min-h-screen">
      <div className="cockpit-container max-w-6xl space-y-8 py-10">
        <header className="hud-panel space-y-3">
          <p className="text-[12px] uppercase tracking-system text-text-secondary">Intelligence Core</p>
          <h1 className="text-[34px] font-semibold tracking-[-0.02em] text-text-primary md:text-[44px]">
            Platform Personality
          </h1>
          <p className="max-w-3xl text-[15px] leading-[1.65] text-text-secondary">
            Choose the platform personality here. Glow color updates live across the platform as soon as you switch.
          </p>
        </header>

        <section className="grid gap-4 md:grid-cols-3">
          {PERSONALITY_ORDER.map((key) => {
            const meta = PERSONA_META[key]
            const Icon = meta.icon
            const selected = mode === key
            const theme = getBrandModeTheme(key)

            return (
              <button
                key={key}
                type="button"
                onClick={() => setMode(key)}
                className="hud-card text-left transition-[transform,border-color,box-shadow] duration-200 hover:-translate-y-0.5"
                style={{
                  borderColor: selected ? theme.borderFocus : undefined,
                  boxShadow: selected ? `0 0 0 1px ${theme.borderFocus}, 0 14px 38px ${theme.accentSoft}` : undefined,
                }}
              >
                <div className="mb-4 flex items-center justify-between">
                  <span
                    className="inline-flex h-10 w-10 items-center justify-center rounded-full border"
                    style={{ borderColor: theme.borderFocus, background: theme.accentSoft, color: theme.accent }}
                  >
                    <Icon size={18} />
                  </span>
                  {selected && (
                    <span
                      className="rounded-full border px-2 py-1 text-[11px] uppercase tracking-system"
                      style={{ borderColor: theme.borderFocus, color: theme.accent }}
                    >
                      Active
                    </span>
                  )}
                </div>

                <h2 className="text-[22px] font-semibold text-text-primary">{meta.title}</h2>
                <p className="mt-1 text-sm text-text-secondary">{meta.summary}</p>
                <p className="mt-4 text-xs leading-5 text-text-secondary">
                  <strong>Voice:</strong> {BRAND_MODES[key].voice}
                </p>
              </button>
            )
          })}
        </section>

        <section className="hud-panel space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm uppercase tracking-system text-text-secondary">Live Glow Status</p>
            <span
              className="inline-flex items-center rounded-full border px-3 py-1 text-xs uppercase tracking-system"
              style={{ borderColor: activeTheme.borderFocus, color: activeTheme.accent, background: activeTheme.accentSoft }}
            >
              {activeTheme.glowLabel}
            </span>
          </div>
          <div className="h-2 w-full rounded-full bg-black/25">
            <div
              className="h-2 rounded-full transition-all duration-300"
              style={{
                width: '100%',
                background: `linear-gradient(90deg, ${activeTheme.accentSoft}, ${activeTheme.accent})`,
              }}
            />
          </div>
          <p className="text-sm text-text-secondary">
            Current platform personality is <strong className="text-text-primary">{PERSONA_META[mode].title}</strong>. This setting is
            persisted and used as your global default.
          </p>
        </section>
      </div>
    </main>
  )
}
