'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Radar, Sparkles, Link2 } from 'lucide-react'
import WorkspacePanel from '@/components/cockpit/WorkspacePanel'
import DashboardPanel from '@/components/cockpit/DashboardPanel'
import { CockpitEmptyState } from '@/components/ui/CockpitEmptyState'
import LinkIngestionForm, { type LinkIngestionPayload } from '@/components/funnels/LinkIngestionForm'
import GenerationProgress, { type GenerationStageKey } from '@/components/funnels/GenerationProgress'
import GeneratedAssetsTabs from '@/components/funnels/GeneratedAssetsTabs'
import FunnelPreviewDialog from '@/components/funnels/FunnelPreviewDialog'
import type { GeneratedFunnelAssets } from '@/lib/ai/tasks/generateFunnelFromOffer'

interface GenerationResult {
  warnings?: string[]
  source: {
    url: string
    host: string
    title: string
    description: string
    headings: string[]
  }
  signals: {
    productName: string
    niche: string
    audience: string
    offerSummary: string
    keyBenefits: string[]
  }
  assets: GeneratedFunnelAssets
}

interface PersistedFunnel {
  funnel_id: string
  slug: string
  name: string
}

interface GenerateFromUrlResponse {
  generation: GenerationResult
  funnel: PersistedFunnel | null
}

const PROGRESS_STAGES: GenerationStageKey[] = ['fetch', 'analyze', 'landing', 'emails', 'save']

export default function LinkFunnelPage() {
  const [generating, setGenerating] = useState(false)
  const [stageStatus, setStageStatus] = useState<'idle' | 'running' | 'complete' | 'error'>('idle')
  const [currentStage, setCurrentStage] = useState<GenerationStageKey>('fetch')
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [result, setResult] = useState<GenerateFromUrlResponse | null>(null)
  const [lastPayload, setLastPayload] = useState<LinkIngestionPayload | null>(null)

  const runGeneration = async (payload: LinkIngestionPayload) => {
    if (generating) return

    setLastPayload(payload)
    setGenerating(true)
    setStageStatus('running')
    setCurrentStage('fetch')
    setErrorMessage(null)

    let stageIndex = 0
    const intervalId = window.setInterval(() => {
      stageIndex = Math.min(stageIndex + 1, PROGRESS_STAGES.length - 1)
      setCurrentStage(PROGRESS_STAGES[stageIndex])
    }, 1000)

    try {
      const response = await fetch('/api/funnels/generate-from-url', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      let body: Partial<GenerateFromUrlResponse> & { error?: string } = {}
      try {
        body = (await response.json()) as Partial<GenerateFromUrlResponse> & { error?: string }
      } catch {
        body = {}
      }

      if (!response.ok) {
        throw new Error(body.error || `Failed to generate funnel from URL (${response.status})`)
      }

      if (!body.generation) {
        throw new Error('Generation response missing required content')
      }

      setCurrentStage('save')
      setResult({
        generation: body.generation,
        funnel: body.funnel || null,
      })
      setStageStatus('complete')
    } catch (error) {
      setStageStatus('error')
      setErrorMessage(error instanceof Error ? error.message : 'Generation failed')
    } finally {
      window.clearInterval(intervalId)
      setGenerating(false)
    }
  }

  const summaryValue = result ? `${result.generation.signals.keyBenefits.length}` : '0'
  const sourceLabel = result ? result.generation.source.host : 'N/A'

  return (
    <main className="cockpit-shell page-ai-core py-8">
      <div className="cockpit-container max-w-7xl space-y-6">
        <section className="hud-panel flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs uppercase tracking-system text-text-secondary">FunnelHive Reverse Engineering</p>
            <h1 className="text-3xl font-semibold text-text-primary md:text-4xl">Link Funnel Generator</h1>
            <p className="mt-1 text-sm text-text-secondary">
              Ingest one affiliate URL, extract offer signals, and generate a launch-ready funnel + email sequence.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link href="/funnels" className="hud-button-secondary px-4 py-2">
              Funnels Workspace
            </Link>
            <Link href="/ai-generator" className="hud-button-secondary px-4 py-2">
              Prompt Builder
            </Link>
          </div>
        </section>

        <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <DashboardPanel title="Status" icon={<Radar size={16} />} value={stageStatus.toUpperCase()} tone={stageStatus === 'error' ? 'warning' : 'info'}>
            <p className="text-xs text-text-secondary">Current generation lifecycle state.</p>
          </DashboardPanel>
          <DashboardPanel title="Signal Count" icon={<Sparkles size={16} />} value={summaryValue} tone="success">
            <p className="text-xs text-text-secondary">Inferred benefit signals from source page.</p>
          </DashboardPanel>
          <DashboardPanel title="Source Host" icon={<Link2 size={16} />} value={sourceLabel} tone="neutral">
            <p className="text-xs text-text-secondary">Origin host for latest analyzed URL.</p>
          </DashboardPanel>
          <DashboardPanel
            title="Saved Funnel"
            icon={<Radar size={16} />}
            value={
              result?.funnel?.slug ? (
                <FunnelPreviewDialog
                  slug={result.funnel.slug}
                  name={result.funnel.name}
                  triggerLabel={`/${result.funnel.slug}`}
                  triggerClassName="text-2xl font-semibold leading-tight text-rocket-300 hover:text-rocket-200"
                />
              ) : (
                'Not saved'
              )
            }
            tone="warning"
          >
            <p className="text-xs text-text-secondary">Draft funnel created from generated assets. Click slug to preview.</p>
          </DashboardPanel>
        </section>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1.05fr_1.35fr]">
          <WorkspacePanel
            title="Offer Intake"
            description="Submit affiliate/product URL and optional guidance for better targeting."
            expandable
          >
            <div className="space-y-4">
              <LinkIngestionForm generating={generating} defaultValues={lastPayload || undefined} onGenerate={runGeneration} />
              <GenerationProgress status={stageStatus} currentStage={currentStage} errorMessage={errorMessage} />
            </div>
          </WorkspacePanel>

          <WorkspacePanel
            title="Generated Assets"
            description="Landing copy + three-email follow-up sequence from the source offer."
            expandable
          >
            {result ? (
              <GeneratedAssetsTabs
                assets={result.generation.assets}
                signals={result.generation.signals}
                sourceUrl={result.generation.source.url}
                warnings={result.generation.warnings}
                funnel={result.funnel}
                onRegenerate={async () => {
                  if (!lastPayload) return
                  await runGeneration(lastPayload)
                }}
                regenerating={generating}
              />
            ) : (
              <CockpitEmptyState
                title="No generation yet"
                description="Run the link ingestion flow to produce landing copy and a complete three-email sequence."
                primaryAction={{
                  label: 'Use Example URL',
                  onClick: () => runGeneration({ url: 'https://example.com', tone: 'professional' }),
                }}
              />
            )}
          </WorkspacePanel>
        </div>
      </div>
    </main>
  )
}
