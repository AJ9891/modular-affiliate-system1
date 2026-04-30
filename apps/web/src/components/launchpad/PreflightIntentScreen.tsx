'use client'

import { Rocket, Compass, Sparkles } from 'lucide-react'
import type { LaunchpadIntentId, LaunchpadIntentOption } from '@/lib/launchpad/preflight'

interface PreflightIntentScreenProps {
  options: readonly LaunchpadIntentOption[]
  selectedIntent: LaunchpadIntentId
  onSelectIntent: (intent: LaunchpadIntentId) => void
  onContinue: () => void
}

export default function PreflightIntentScreen({
  options,
  selectedIntent,
  onSelectIntent,
  onContinue,
}: PreflightIntentScreenProps) {
  return (
    <div className="cockpit-container min-h-screen py-12">
      <div className="mx-auto max-w-4xl px-4 py-12">
        <section className="card-premium rounded-3xl border border-[var(--border-elevated)] p-8 md:p-12">
          <div className="mb-8 text-center">
            <div className="mx-auto mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full border border-cyan-300/35 bg-cyan-500/12">
              <Rocket className="text-cyan-100" size={28} />
            </div>
            <p className="text-xs uppercase tracking-system text-text-secondary">Mission Control</p>
            <h1 className="mt-2 text-3xl font-semibold text-text-primary md:text-4xl">
              Welcome to Launchpad
            </h1>
            <p className="mx-auto mt-3 max-w-2xl text-sm text-text-secondary md:text-base">
              We will help you reach value fast. First, tell us your launch destination and we will
              tailor the path.
            </p>
          </div>

          <div className="mb-6 rounded-xl border border-[var(--border-subtle)] bg-[rgba(10,16,24,0.5)] p-4">
            <div className="flex items-center gap-2 text-sm text-cyan-100">
              <Sparkles size={14} />
              <span>Engines warming... tell us your launch destination.</span>
            </div>
            <div className="mt-3 h-2 overflow-hidden rounded-full bg-[rgba(255,255,255,0.12)]">
              <div className="h-2 w-2/3 animate-pulse rounded-full bg-gradient-to-r from-cyan-300 to-rocket-500" />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3">
            {options.map((option) => {
              const selected = option.id === selectedIntent
              return (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => onSelectIntent(option.id)}
                  className={`rounded-xl border p-4 text-left transition ${
                    selected
                      ? 'border-rocket-500 bg-[var(--accent-soft)]'
                      : 'border-[var(--border-subtle)] hover:border-[var(--border-focus)]'
                  }`}
                >
                  <p className="font-medium text-text-primary">{option.label}</p>
                  <p className="mt-1 text-sm text-text-secondary">{option.description}</p>
                </button>
              )
            })}
          </div>

          <div className="mt-8 flex flex-wrap items-center justify-between gap-3 border-t border-[var(--border-subtle)] pt-5">
            <p className="inline-flex items-center gap-2 text-xs text-text-secondary">
              <Compass size={14} />
              Calm start, guided next steps.
            </p>
            <button
              type="button"
              onClick={onContinue}
              className="btn-launch-premium rounded-lg px-5 py-2.5 text-sm font-semibold"
            >
              Set Destination
            </button>
          </div>
        </section>
      </div>
    </div>
  )
}

