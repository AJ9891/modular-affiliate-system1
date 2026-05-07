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
    summary: 'Confirm your workspace intent before we arm the launch systems.',
    boost: 'You only need one clear direction right now. We will keep the rest lightweight.',
  },
  {
    id: 'intent',
    title: 'Choose your first objective',
    summary: 'Pick the one motion you want Launchpad to optimize first.',
    boost: 'One focused objective beats three half-starts. Pick the smallest path to momentum.',
  },
  {
    id: 'campaign',
    title: 'Name your first launch',
    summary: 'Set the campaign label so every module references the same mission.',
    boost: 'Short, literal names keep the cockpit readable when analytics and AI logs pile up.',
  },
  {
    id: 'ready',
    title: 'Commit preflight and enter launchpad',
    summary: 'Lock this setup and move into guided launch execution.',
    boost: 'You do not need perfection. You need a stable first pass with clear feedback loops.',
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
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,rgba(34,211,238,0.16),rgba(10,14,26,0.95)_55%)] px-4 py-8 text-slate-100 sm:px-6 lg:px-8">
      <div className="mx-auto grid w-full max-w-6xl gap-5 lg:grid-cols-[1.1fr_2fr_1.2fr]">
        <section className="rounded-2xl border border-cyan-300/20 bg-slate-950/65 p-5 shadow-2xl backdrop-blur">
          <div className="mb-4 flex items-center gap-2 text-cyan-200">
            <Compass size={18} />
            <p className="text-xs uppercase tracking-[0.18em]">Preflight Checklist</p>
          </div>

          <div className="mb-4 h-2 overflow-hidden rounded-full bg-slate-800">
            <div
              className="h-full bg-gradient-to-r from-cyan-400 to-emerald-300 transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>

          <div className="space-y-3">
            {STEPS.map((item, idx) => {
              const complete = derivedChecklist[item.id]
              const active = idx + 1 === currentStep

              return (
                <div
                  key={item.id}
                  className={`rounded-xl border px-3 py-3 transition ${
                    active
                      ? 'border-cyan-300/50 bg-cyan-500/10'
                      : 'border-slate-800 bg-slate-900/55'
                  }`}
                >
                  <p className="flex items-center gap-2 text-sm font-medium text-slate-100">
                    {complete ? <CheckCircle2 size={16} className="text-emerald-300" /> : <Circle size={16} className="text-slate-500" />}
                    Step {idx + 1}
                  </p>
                  <p className="mt-1 text-xs text-slate-300">{item.title}</p>
                </div>
              )
            })}
          </div>
        </section>

        <section className="rounded-2xl border border-white/10 bg-slate-950/75 p-7 shadow-2xl backdrop-blur">
          <div className="mb-6">
            <p className="text-xs uppercase tracking-[0.2em] text-slate-400">First Launch Experience</p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight text-white">{step.title}</h1>
            <p className="mt-2 max-w-xl text-sm text-slate-300">{step.summary}</p>
          </div>

          {step.id === 'identity' && (
            <div className="rounded-xl border border-slate-700 bg-slate-900/60 p-5">
              <p className="mb-3 text-sm text-slate-200">This cockpit will coordinate your launch modules:</p>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-lg border border-slate-700 bg-slate-900 px-3 py-3 text-sm text-slate-300">Templates and page builder</div>
                <div className="rounded-lg border border-slate-700 bg-slate-900 px-3 py-3 text-sm text-slate-300">Offer wiring and tracking</div>
                <div className="rounded-lg border border-slate-700 bg-slate-900 px-3 py-3 text-sm text-slate-300">Email sequences and automation</div>
                <div className="rounded-lg border border-slate-700 bg-slate-900 px-3 py-3 text-sm text-slate-300">Analytics and optimization loops</div>
              </div>
            </div>
          )}

          {step.id === 'intent' && (
            <div className="grid gap-3">
              {OBJECTIVES.map((objective) => {
                const selected = intent === objective.id

                return (
                  <button
                    key={objective.id}
                    type="button"
                    onClick={() => handleObjectiveSelect(objective.id)}
                    disabled={saving}
                    className={`rounded-xl border px-4 py-4 text-left transition ${
                      selected
                        ? 'border-cyan-300/60 bg-cyan-500/10 text-white'
                        : 'border-slate-700 bg-slate-900/60 text-slate-300 hover:border-slate-500'
                    }`}
                  >
                    <p className="text-sm font-semibold">{objective.title}</p>
                    <p className="mt-1 text-xs text-slate-300">{objective.description}</p>
                  </button>
                )
              })}
            </div>
          )}

          {step.id === 'campaign' && (
            <div className="rounded-xl border border-slate-700 bg-slate-900/65 p-4">
              <label htmlFor="campaignName" className="mb-2 block text-sm font-medium text-slate-200">
                Campaign name
              </label>
              <input
                id="campaignName"
                type="text"
                maxLength={80}
                value={campaignName}
                onChange={(event) => setCampaignName(event.target.value)}
                placeholder="Example: spring-ai-audit"
                className="w-full rounded-lg border border-slate-600 bg-slate-950 px-3 py-2 text-sm text-slate-100 outline-none transition focus:border-cyan-300"
              />
              <p className="mt-2 text-xs text-slate-400">Use 3-80 characters. Keep it literal and searchable.</p>
            </div>
          )}

          {step.id === 'ready' && (
            <div className="rounded-xl border border-emerald-300/30 bg-emerald-500/10 p-5">
              <p className="text-sm text-emerald-100">Preflight checks complete. Continue to launchpad and execute your first guided build.</p>
            </div>
          )}

          {error && (
            <p className="mt-5 rounded-lg border border-red-300/35 bg-red-500/10 px-3 py-2 text-sm text-red-100">{error}</p>
          )}

          <div className="mt-8 flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={handleBack}
              disabled={currentStep === 1 || saving}
              className="inline-flex items-center gap-2 rounded-lg border border-slate-600 px-4 py-2 text-sm text-slate-200 transition hover:border-slate-400 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <ArrowLeft size={16} />
              Back
            </button>

            <button
              type="button"
              onClick={handleContinue}
              disabled={saving}
              className="inline-flex items-center gap-2 rounded-lg bg-cyan-400 px-5 py-2 text-sm font-semibold text-slate-950 transition hover:bg-cyan-300 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving ? 'Saving...' : step.id === 'ready' ? 'Continue to Launchpad' : 'Continue'}
              <ArrowRight size={16} />
            </button>
          </div>
        </section>

        <section className="rounded-2xl border border-emerald-300/25 bg-emerald-500/10 p-5 shadow-2xl backdrop-blur">
          <div className="mb-4 flex items-center gap-2 text-emerald-200">
            <Rocket size={17} />
            <p className="text-xs uppercase tracking-[0.18em]">Boost Guidance</p>
          </div>

          <p className="rounded-xl border border-emerald-300/25 bg-emerald-500/10 px-4 py-4 text-sm leading-relaxed text-emerald-50">
            {step.boost}
          </p>

          <div className="mt-4 space-y-2 text-xs text-emerald-100/90">
            <p className="flex items-start gap-2"><Target size={14} className="mt-0.5" /> Keep one clear objective for this session.</p>
            <p className="flex items-start gap-2"><Flag size={14} className="mt-0.5" /> Save state after each step so context follows you.</p>
            <p className="flex items-start gap-2"><ShieldCheck size={14} className="mt-0.5" /> You can revise details later without breaking routing.</p>
          </div>
        </section>
      </div>
    </main>
  )
}
