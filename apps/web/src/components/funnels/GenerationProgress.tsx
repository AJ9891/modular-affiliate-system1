'use client'

import { CheckCircle2, Loader2, AlertCircle, Circle } from 'lucide-react'

export type GenerationStageKey = 'fetch' | 'analyze' | 'landing' | 'emails' | 'save'

interface GenerationProgressProps {
  status: 'idle' | 'running' | 'complete' | 'error'
  currentStage: GenerationStageKey
  errorMessage?: string | null
}

const STAGES: Array<{ key: GenerationStageKey; label: string; detail: string }> = [
  { key: 'fetch', label: 'Fetch URL', detail: 'Pulling page content and metadata.' },
  { key: 'analyze', label: 'Analyze Offer', detail: 'Extracting audience, niche, and value signals.' },
  { key: 'landing', label: 'Generate Landing Copy', detail: 'Building headline, value stack, and CTA.' },
  { key: 'emails', label: 'Generate Email Sequence', detail: 'Drafting three follow-up emails.' },
  { key: 'save', label: 'Save Funnel', detail: 'Persisting generated assets to your funnel workspace.' },
]

const STAGE_ORDER = new Map(STAGES.map((stage, index) => [stage.key, index]))

function getProgressValue(status: GenerationProgressProps['status'], currentStage: GenerationStageKey): number {
  if (status === 'idle') return 0
  if (status === 'complete') return 100

  const index = STAGE_ORDER.get(currentStage) || 0
  return Math.max(10, Math.round(((index + 1) / STAGES.length) * 100))
}

export default function GenerationProgress({ status, currentStage, errorMessage }: GenerationProgressProps) {
  const activeIndex = STAGE_ORDER.get(currentStage) || 0
  const progress = getProgressValue(status, currentStage)

  return (
    <div className="space-y-4 rounded-xl border border-[var(--border-subtle)] bg-[rgba(10,16,24,0.55)] p-4">
      <div className="flex items-center justify-between">
        <p className="text-xs uppercase tracking-system text-text-secondary">Generation Progress</p>
        <p className="text-xs text-text-secondary">{progress}%</p>
      </div>

      <div className="h-1.5 overflow-hidden rounded-full bg-[rgba(20,32,46,0.95)]">
        <div className="h-full bg-gradient-to-r from-rocket-600 via-rocket-500 to-cyan-400 transition-all duration-500" style={{ width: `${progress}%` }} />
      </div>

      <ul className="space-y-3">
        {STAGES.map((stage, index) => {
          const isDone = status === 'complete' || (status !== 'idle' && index < activeIndex)
          const isActive = status === 'running' && index === activeIndex
          const isError = status === 'error' && index === activeIndex

          return (
            <li key={stage.key} className="flex items-start gap-3">
              <span className="mt-0.5 text-text-secondary">
                {isDone ? (
                  <CheckCircle2 className="size-4 text-emerald-300" />
                ) : isActive ? (
                  <Loader2 className="size-4 animate-spin text-rocket-400" />
                ) : isError ? (
                  <AlertCircle className="size-4 text-red-300" />
                ) : (
                  <Circle className="size-4" />
                )}
              </span>
              <div>
                <p className="text-sm font-medium text-text-primary">{stage.label}</p>
                <p className="text-xs text-text-secondary">{stage.detail}</p>
              </div>
            </li>
          )
        })}
      </ul>

      {status === 'error' && errorMessage && <p className="text-sm text-red-200">{errorMessage}</p>}
    </div>
  )
}
