'use client'

import { useMemo, useState } from 'react'
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Circle,
  Compass,
  Flag,
  Rocket,
  ShieldCheck,
  Target,
} from 'lucide-react'
import {
  clampPreflightStep,
  type OnboardingIntent,
  type PreflightChecklist,
  type PreflightState,
} from '@/lib/onboarding/preflight'

type PreflightOnboardingProps = {
  initialState: PreflightState
  onComplete: () => void
}

type StepConfig = {
  id: 'identity' | 'intent' | 'campaign' | 'ready'
  title: string
  summary: string
  boost: string
}

const STEPS: StepConfig[] = [
  {
    id: 'identity',
    title: 'Preflight identity check',
    summary: 'Confirm your workspace intent before we arm launch systems.',
    boost: 'You only need one clear direction right now. Keep this first pass simple.',
  },
  {
    id: 'intent',
    title: 'Choose your first objective',
    summary: 'Pick the one motion you want Launchpad to optimize first.',
    boost: 'One focused objective beats three half-starts. Choose the smallest useful win.',
  },
  {
    id: 'campaign',
    title: 'Name your first launch',
    summary: 'Set a stable campaign name so every module tracks the same mission.',
    boost: 'Short, literal names keep your cockpit readable once analytics history grows.',
  },
  {
    id: 'ready',
    title: 'Commit preflight and enter launchpad',
    summary: 'Lock this setup and move into guided launch execution.',
    boost: 'You do not need perfect setup. You need a stable baseline and clean feedback loops.',
  },
]

const OBJECTIVES: Array<{
  id: OnboardingIntent
  title: string
  description: string
}> = [
  {
    id: 'create-funnel',
    title: 'Create funnel',
    description: 'Generate and publish a high-conversion funnel first.',
  },
  {
    id: 'import-traffic',
    title: 'Import traffic',
    description: 'Connect channels and start routing visitors quickly.',
  },
  {
    id: 'setup-email',
    title: 'Setup email',
    description: 'Activate follow-up automation and conversion loops.',
  },
]

function normalizeChecklist(
  checklist: PreflightChecklist,
  state: { currentStep: number; intent: OnboardingIntent | null; campaignName: string },
): PreflightChecklist {
  return {
    identity: checklist.identity || state.currentStep > 1,
    intent: checklist.intent || Boolean(state.intent),
    campaign: checklist.campaign || state.campaignName.trim().length >= 3,
    ready:
      checklist.ready ||
      (checklist.identity || state.currentStep > 1) &&
      (checklist.intent || Boolean(state.intent)) &&
      (checklist.campaign || state.campaignName.trim().length >= 3),
  }
}

export default function PreflightOnboarding({ initialState, onComplete }: PreflightOnboardingProps) {
  const [currentStep, setCurrentStep] = useState(clampPreflightStep(initialState.currentStep))
  const [intent, setIntent] = useState<OnboardingIntent | null>(initialState.intent)
  const [campaignName, setCampaignName] = useState(initialState.campaignName)
  const [checklist, setChecklist] = useState<PreflightChecklist>(initialState.checklist)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const step = STEPS[currentStep - 1]
  const derivedChecklist = useMemo(
    () => normalizeChecklist(checklist, { currentStep, intent, campaignName }),
    [checklist, currentStep, intent, campaignName],
  )

  const progressPercent = Math.round((currentStep / STEPS.length) * 100)

  const saveState = async (payload: {
    currentStep: number
    intent: OnboardingIntent | null
    campaignName: string
    checklist: PreflightChecklist
    preflightComplete: boolean
  }): Promise<PreflightState | null> => {
    setSaving(true)
    setError(null)

    try {
      const response = await fetch('/api/onboarding/state', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        const body = (await response.json().catch(() => ({}))) as { error?: string }
        throw new Error(body.error ?? 'Unable to persist preflight state')
      }

      const next = (await response.json()) as PreflightState
      setCurrentStep(clampPreflightStep(next.currentStep))
      setIntent(next.intent)
      setCampaignName(next.campaignName)
      setChecklist(next.checklist)

      return next
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : 'Unable to persist preflight state')
      return null
    } finally {
      setSaving(false)
    }
  }

  const handleObjectiveSelect = async (nextIntent: OnboardingIntent) => {
    setIntent(nextIntent)
    const nextChecklist = { ...derivedChecklist, intent: true }
    setChecklist(nextChecklist)

    await saveState({
      currentStep,
      intent: nextIntent,
      campaignName,
      checklist: nextChecklist,
      preflightComplete: false,
    })
  }

  const handleBack = async () => {
    if (currentStep === 1 || saving) return

    const nextStep = clampPreflightStep(currentStep - 1)
    setCurrentStep(nextStep)

    await saveState({
      currentStep: nextStep,
      intent,
      campaignName,
      checklist: derivedChecklist,
      preflightComplete: false,
    })
  }

  const handleContinue = async () => {
    if (saving) return

    if (currentStep === 2 && !intent) {
      setError('Select an objective before continuing.')
      return
    }

    if (currentStep === 3 && campaignName.trim().length < 3) {
      setError('Campaign name must be at least 3 characters.')
      return
    }

    if (currentStep === 4) {
      const finalChecklist = { ...derivedChecklist, ready: true }
      setChecklist(finalChecklist)

      const saved = await saveState({
        currentStep: 4,
        intent,
        campaignName,
        checklist: finalChecklist,
        preflightComplete: true,
      })

      if (saved?.preflightComplete) {
        onComplete()
      }

      return
    }

    const nextStep = clampPreflightStep(currentStep + 1)
    const nextChecklist = {
      ...derivedChecklist,
      identity: derivedChecklist.identity || currentStep >= 1,
      campaign: currentStep === 3 ? campaignName.trim().length >= 3 : derivedChecklist.campaign,
    }

    setChecklist(nextChecklist)
    setCurrentStep(nextStep)

    await saveState({
      currentStep: nextStep,
      intent,
      campaignName,
      checklist: nextChecklist,
      preflightComplete: false,
    })
  }

  return (
    <main className="theme-dark cockpit-shell page-flight-deck">
      <div className="cockpit-container max-w-6xl py-6 sm:py-8">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-[11px] uppercase tracking-[0.2em] text-text-secondary">First Launch Experience</p>
            <h1 className="mt-2 text-2xl font-semibold tracking-[-0.02em] text-text-primary sm:text-3xl">Launchpad Preflight</h1>
          </div>
          <div className="hud-strip rounded-full px-3 py-1 text-xs text-text-secondary">Step {currentStep} of {STEPS.length}</div>
        </div>

        <div className="grid gap-4 lg:grid-cols-[17rem_minmax(0,1fr)_18rem]">
          <section className="hud-panel p-4 sm:p-5 lg:sticky lg:top-5 lg:h-fit">
            <div className="mb-4 flex items-center gap-2 text-text-secondary">
              <Compass size={16} className="text-rocket-500" />
              <p className="text-xs uppercase tracking-[0.18em]">Checklist</p>
            </div>

            <div className="mb-4 h-2 overflow-hidden rounded-full bg-[rgba(10,16,24,0.72)]">
              <div
                className="h-full bg-gradient-to-r from-rocket-600 to-rocket-500 transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              />
            </div>

            <div className="space-y-2">
              {STEPS.map((item, idx) => {
                const complete = derivedChecklist[item.id]
                const active = idx + 1 === currentStep

                return (
                  <div
                    key={item.id}
                    className={`rounded-lg border px-3 py-3 transition ${
                      active
                        ? 'border-[var(--border-focus)] bg-[var(--accent-soft)]'
                        : 'border-[var(--border-subtle)] bg-[rgba(12,18,28,0.45)]'
                    }`}
                  >
                    <p className="flex items-center gap-2 text-xs font-medium uppercase tracking-[0.08em] text-text-secondary">
                      {complete ? <CheckCircle2 size={15} className="text-rocket-500" /> : <Circle size={15} className="text-text-muted" />}
                      Step {idx + 1}
                    </p>
                    <p className="mt-1 text-sm text-text-primary">{item.title}</p>
                  </div>
                )
              })}
            </div>
          </section>

          <section className="hud-panel p-5 sm:p-6">
            <div className="mb-5">
              <p className="text-xs uppercase tracking-[0.2em] text-text-secondary">Current Step</p>
              <h2 className="mt-2 text-2xl font-semibold tracking-[-0.02em] text-text-primary">{step.title}</h2>
              <p className="mt-2 max-w-2xl text-sm leading-relaxed text-text-secondary">{step.summary}</p>
            </div>

            {step.id === 'identity' && (
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="hud-card-tight text-sm text-text-secondary">Templates and page builder</div>
                <div className="hud-card-tight text-sm text-text-secondary">Offer wiring and tracking</div>
                <div className="hud-card-tight text-sm text-text-secondary">Email automation loops</div>
                <div className="hud-card-tight text-sm text-text-secondary">Telemetry and optimization</div>
              </div>
            )}

            {step.id === 'intent' && (
              <div className="grid gap-2.5">
                {OBJECTIVES.map((objective) => {
                  const selected = intent === objective.id

                  return (
                    <button
                      key={objective.id}
                      type="button"
                      onClick={() => handleObjectiveSelect(objective.id)}
                      disabled={saving}
                      className={`rounded-lg border px-4 py-3 text-left transition ${
                        selected
                          ? 'border-[var(--border-focus)] bg-[var(--accent-soft)] text-text-primary'
                          : 'border-[var(--border-subtle)] bg-[rgba(12,18,28,0.42)] text-text-secondary hover:border-[var(--border-elevated)] hover:text-text-primary'
                      }`}
                    >
                      <p className="text-sm font-semibold">{objective.title}</p>
                      <p className="mt-1 text-xs text-text-muted">{objective.description}</p>
                    </button>
                  )
                })}
              </div>
            )}

            {step.id === 'campaign' && (
              <div className="rounded-lg border border-[var(--border-elevated)] bg-[var(--hud-input-bg)] p-4">
                <label htmlFor="campaignName" className="mb-2 block text-sm font-medium text-text-primary">
                  Campaign name
                </label>
                <input
                  id="campaignName"
                  type="text"
                  maxLength={80}
                  value={campaignName}
                  onChange={(event) => setCampaignName(event.target.value)}
                  placeholder="example: spring-ai-audit"
                  className="w-full rounded-lg border border-[var(--border-subtle)] bg-[rgba(8,12,20,0.62)] px-3 py-2 text-sm text-text-primary outline-none transition focus:border-[var(--border-focus)]"
                />
                <p className="mt-2 text-xs text-text-muted">Use 3-80 characters. Keep it literal and searchable.</p>
              </div>
            )}

            {step.id === 'ready' && (
              <div className="rounded-lg border border-[var(--border-focus)] bg-[var(--accent-soft)] p-4">
                <p className="text-sm text-text-primary">Preflight checks are complete. Continue to Launchpad to execute your first guided build.</p>
              </div>
            )}

            {error && (
              <p className="mt-5 rounded-lg border border-red-500/40 bg-red-500/10 px-3 py-2 text-sm text-red-100">{error}</p>
            )}

            <div className="mt-7 flex flex-col-reverse gap-2 border-t border-[var(--border-subtle)] pt-4 sm:flex-row sm:items-center sm:justify-between">
              <button
                type="button"
                onClick={handleBack}
                disabled={currentStep === 1 || saving}
                className="inline-flex min-h-[42px] items-center justify-center gap-2 rounded-lg border border-[var(--border-elevated)] px-4 py-2 text-sm text-text-secondary transition hover:border-[var(--border-focus)] hover:text-text-primary disabled:cursor-not-allowed disabled:opacity-50"
              >
                <ArrowLeft size={16} />
                Back
              </button>

              <button
                type="button"
                onClick={handleContinue}
                disabled={saving}
                className="inline-flex min-h-[42px] items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-rocket-600 to-rocket-500 px-5 py-2 text-sm font-semibold text-[var(--bg-primary)] transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {saving ? 'Saving...' : step.id === 'ready' ? 'Continue to Launchpad' : 'Continue'}
                <ArrowRight size={16} />
              </button>
            </div>
          </section>

          <section className="hud-panel p-4 sm:p-5 lg:sticky lg:top-5 lg:h-fit">
            <div className="mb-3 flex items-center gap-2 text-text-secondary">
              <Rocket size={16} className="text-rocket-500" />
              <p className="text-xs uppercase tracking-[0.18em]">Boost Guidance</p>
            </div>

            <p className="rounded-lg border border-[var(--border-subtle)] bg-[rgba(12,18,28,0.45)] px-3 py-3 text-sm leading-relaxed text-text-primary">
              {step.boost}
            </p>

            <div className="mt-4 space-y-2 text-xs text-text-secondary">
              <p className="flex items-start gap-2"><Target size={14} className="mt-0.5 text-rocket-500" /> Keep one objective for this session.</p>
              <p className="flex items-start gap-2"><Flag size={14} className="mt-0.5 text-rocket-500" /> Save progress after each step so context follows you.</p>
              <p className="flex items-start gap-2"><ShieldCheck size={14} className="mt-0.5 text-rocket-500" /> You can revise details later without breaking routing.</p>
            </div>
          </section>
        </div>
      </div>
    </main>
  )
}
