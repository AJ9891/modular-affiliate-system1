'use client'

import { Gauge, CheckCircle2 } from 'lucide-react'
import {
  STARTUP_FUNNEL_OPTIONS,
  STARTUP_TRAFFIC_GOAL_OPTIONS,
  type StartupChecklistField,
  type StartupFunnelType,
  type StartupTrafficGoal,
} from '@/lib/launchpad/startupChecklist'

interface StartupChecklistScreenProps {
  campaignName: string
  funnelType: StartupFunnelType | ''
  trafficGoal: StartupTrafficGoal | ''
  missingFields: StartupChecklistField[]
  throttleLabel: string
  onCampaignNameChange: (value: string) => void
  onFunnelTypeChange: (value: StartupFunnelType) => void
  onTrafficGoalChange: (value: StartupTrafficGoal) => void
  onContinue: () => void
}

export default function StartupChecklistScreen({
  campaignName,
  funnelType,
  trafficGoal,
  missingFields,
  throttleLabel,
  onCampaignNameChange,
  onFunnelTypeChange,
  onTrafficGoalChange,
  onContinue,
}: StartupChecklistScreenProps) {
  const missing = new Set(missingFields)

  return (
    <div className="cockpit-container min-h-screen py-12">
      <div className="mx-auto max-w-4xl px-4 py-12">
        <section className="card-premium rounded-3xl border border-[var(--border-elevated)] p-8 md:p-12">
          <div className="mb-6 text-center">
            <p className="text-xs uppercase tracking-system text-text-secondary">Startup Checklist</p>
            <h1 className="mt-2 text-3xl font-semibold text-text-primary md:text-4xl">Get To Value Fast</h1>
            <p className="mx-auto mt-3 max-w-2xl text-sm text-text-secondary md:text-base">
              You are on the runway. These three steps put motion under your wings.
            </p>
          </div>

          <div className="mb-6 rounded-xl border border-[var(--border-subtle)] bg-[rgba(10,16,24,0.5)] p-4">
            <div className="mb-2 flex items-center justify-between text-sm">
              <span className="inline-flex items-center gap-2 text-text-primary">
                <Gauge size={16} />
                {throttleLabel}
              </span>
              <span className="text-text-secondary">Time-to-Value Checklist</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-[rgba(255,255,255,0.12)]">
              <div
                className="h-2 rounded-full bg-gradient-to-r from-rocket-500 to-cyan-300 transition-all"
                style={{
                  width: missing.size === 3 ? '0%' : missing.size === 2 ? '33%' : missing.size === 1 ? '66%' : '100%',
                }}
              />
            </div>
          </div>

          <div className="space-y-5">
            <div>
              <label className="text-sm font-medium text-text-primary">1. Name your first campaign</label>
              <input
                value={campaignName}
                onChange={(event) => onCampaignNameChange(event.target.value)}
                placeholder="Example: Spring Offer Sprint"
                className="hud-input mt-2 w-full"
              />
              {missing.has('campaignName') ? (
                <p className="mt-2 text-xs text-amber-200">Tip: A clear campaign name helps you track results without confusion later.</p>
              ) : (
                <p className="mt-2 inline-flex items-center gap-1 text-xs text-emerald-200">
                  <CheckCircle2 size={12} /> Campaign name locked
                </p>
              )}
            </div>

            <div>
              <p className="text-sm font-medium text-text-primary">2. Choose a funnel type</p>
              <div className="mt-2 grid grid-cols-1 gap-2 md:grid-cols-2">
                {STARTUP_FUNNEL_OPTIONS.map((option) => (
                  <button
                    key={option.id}
                    type="button"
                    onClick={() => onFunnelTypeChange(option.id)}
                    className={`rounded-lg border p-3 text-left transition ${
                      funnelType === option.id
                        ? 'border-rocket-500 bg-[var(--accent-soft)]'
                        : 'border-[var(--border-subtle)] hover:border-[var(--border-focus)]'
                    }`}
                  >
                    <p className="text-sm font-semibold text-text-primary">{option.label}</p>
                    <p className="mt-1 text-xs text-text-secondary">{option.description}</p>
                  </button>
                ))}
              </div>
              {missing.has('funnelType') ? (
                <p className="mt-2 text-xs text-amber-200">Tip: Pick the type that matches your nearest win, not your final architecture.</p>
              ) : null}
            </div>

            <div>
              <p className="text-sm font-medium text-text-primary">3. Set a traffic goal</p>
              <div className="mt-2 grid grid-cols-1 gap-2 md:grid-cols-3">
                {STARTUP_TRAFFIC_GOAL_OPTIONS.map((option) => (
                  <button
                    key={option.id}
                    type="button"
                    onClick={() => onTrafficGoalChange(option.id)}
                    className={`rounded-lg border p-3 text-left transition ${
                      trafficGoal === option.id
                        ? 'border-rocket-500 bg-[var(--accent-soft)]'
                        : 'border-[var(--border-subtle)] hover:border-[var(--border-focus)]'
                    }`}
                  >
                    <p className="text-sm font-semibold text-text-primary">{option.label}</p>
                    <p className="mt-1 text-xs text-text-secondary">{option.description}</p>
                  </button>
                ))}
              </div>
              {missing.has('trafficGoal') ? (
                <p className="mt-2 text-xs text-amber-200">Tip: Set one measurable target so your first week has a clear success condition.</p>
              ) : null}
            </div>
          </div>

          <div className="mt-8 flex justify-end border-t border-[var(--border-subtle)] pt-5">
            <button type="button" onClick={onContinue} className="btn-launch-premium rounded-lg px-5 py-2.5 text-sm font-semibold">
              Continue To Guided Launch
            </button>
          </div>
        </section>
      </div>
    </div>
  )
}

