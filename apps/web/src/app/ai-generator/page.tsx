'use client'

import { FormEvent, useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import {
  Bot,
  ClipboardCopy,
  Eye,
  FileCode2,
  Layers,
  Loader2,
  Save,
  Sparkles,
  Trash2,
  Wand2,
} from 'lucide-react'
import DashboardPanel from '@/components/cockpit/DashboardPanel'
import WorkspacePanel from '@/components/cockpit/WorkspacePanel'
import { CockpitEmptyState } from '@/components/ui/CockpitEmptyState'
import { useAuth } from '@/contexts/AuthContext'
import { useBrandMode } from '@/contexts/BrandModeContext'
import { getBrandModeTheme } from '@/lib/brand/brandModeTheme'

type ContentType = 'headline' | 'subheadline' | 'cta' | 'bullet-points' | 'full-page' | 'email'
type Tone = 'professional' | 'casual' | 'urgent' | 'friendly'
type ViewMode = 'preview' | 'raw'

interface GeneratorFormData {
  niche: string
  productName: string
  audience: string
  tone: Tone
  context: string
}

interface SavedContent {
  id: string
  content: string
  type: ContentType
  timestamp: number
  niche: string
  productName: string
}

interface OutputNotice {
  tone: 'success' | 'error' | 'info'
  text: string
}

interface BenefitItem {
  title: string
  description: string
}

interface PreviewModel {
  headline?: string
  subheadline?: string
  cta?: string
  subject?: string
  preview?: string
  body?: string
  bulletPoints: string[]
  benefits: BenefitItem[]
  fallbackText: string | null
  hasStructuredData: boolean
}

const SAVED_CONTENT_KEY = 'ai-saved-content-v2'

const CONTENT_TYPES: Array<{ value: ContentType; label: string; description: string }> = [
  { value: 'headline', label: 'Headline', description: 'Top-level promise for page hero sections.' },
  { value: 'subheadline', label: 'Subheadline', description: 'Secondary hook that adds specificity.' },
  { value: 'cta', label: 'Call To Action', description: 'High-intent button copy for conversions.' },
  { value: 'bullet-points', label: 'Benefit Bullets', description: 'Fast-scanning list of outcomes.' },
  { value: 'full-page', label: 'Landing Page JSON', description: 'Structured output with headline, benefits, and CTA.' },
  { value: 'email', label: 'Email JSON', description: 'Subject, preview text, body copy, and CTA.' },
]
const CONTENT_TYPE_SET = new Set<ContentType>(CONTENT_TYPES.map((item) => item.value))

const BRIEF_PRESETS: Array<{
  title: string
  type: ContentType
  form: GeneratorFormData
}> = [
  {
    title: 'Lead Magnet Offer',
    type: 'full-page',
    form: {
      niche: 'Affiliate marketing',
      productName: 'Affiliate Funnel Blueprint',
      audience: 'New affiliate marketers with small audiences',
      tone: 'professional',
      context: 'Focus on clarity and quick implementation with no hype claims.',
    },
  },
  {
    title: 'Promo Email',
    type: 'email',
    form: {
      niche: 'Productivity tools',
      productName: 'Automation Starter Kit',
      audience: 'Solo operators managing multiple offers',
      tone: 'friendly',
      context: 'Include urgency tied to limited onboarding support slots.',
    },
  },
  {
    title: 'CTA Refresh',
    type: 'cta',
    form: {
      niche: 'Coaching offers',
      productName: 'Client Acquisition Sprint',
      audience: 'Coaches with inconsistent monthly leads',
      tone: 'urgent',
      context: 'Keep CTA direct and compliance-safe.',
    },
  },
]

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function stringOrUndefined(value: unknown): string | undefined {
  if (typeof value !== 'string') return undefined
  const trimmed = value.trim()
  return trimmed.length > 0 ? trimmed : undefined
}

function toStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return []
  return value
    .map((item) => (typeof item === 'string' ? item.trim() : ''))
    .filter((item) => item.length > 0)
}

function toBenefits(value: unknown): BenefitItem[] {
  if (!Array.isArray(value)) return []

  const results: BenefitItem[] = []

  for (const item of value) {
    if (typeof item === 'string' && item.trim().length > 0) {
      results.push({ title: item.trim(), description: '' })
      continue
    }

    if (isRecord(item)) {
      const title = stringOrUndefined(item.title) ?? 'Benefit'
      const description = stringOrUndefined(item.description) ?? ''
      results.push({ title, description })
    }
  }

  return results
}

function isContentType(value: string | undefined): value is ContentType {
  if (!value) return false
  return CONTENT_TYPE_SET.has(value as ContentType)
}

function parsePreviewModel(content: string): PreviewModel {
  const fallback = content.trim()
  if (fallback.length === 0) {
    return {
      bulletPoints: [],
      benefits: [],
      fallbackText: null,
      hasStructuredData: false,
    }
  }

  try {
    const parsed: unknown = JSON.parse(content)
    if (!isRecord(parsed)) {
      return {
        bulletPoints: [],
        benefits: [],
        fallbackText: fallback,
        hasStructuredData: false,
      }
    }

    const bulletPoints = toStringArray(parsed.bulletPoints)
    const lineBullets = toStringArray(parsed.bullets)
    const normalizedBullets = bulletPoints.length > 0 ? bulletPoints : lineBullets

    const model: PreviewModel = {
      headline: stringOrUndefined(parsed.headline),
      subheadline: stringOrUndefined(parsed.subheadline),
      cta: stringOrUndefined(parsed.cta),
      subject: stringOrUndefined(parsed.subject),
      preview: stringOrUndefined(parsed.preview),
      body: stringOrUndefined(parsed.body),
      bulletPoints: normalizedBullets,
      benefits: toBenefits(parsed.benefits),
      fallbackText: fallback,
      hasStructuredData: true,
    }

    return model
  } catch {
    const lines = fallback
      .split('\n')
      .map((line) => line.trim())
      .filter((line) => line.length > 0)
    const hasBulletSyntax = lines.some((line) => /^[-*•]|\d+[.)]\s/.test(line))
    const bulletPoints = hasBulletSyntax || lines.length >= 3 ? lines.map((line) => line.replace(/^[-*•\d.)\s]+/, '').trim()) : []

    return {
      bulletPoints,
      benefits: [],
      fallbackText: fallback,
      hasStructuredData: false,
    }
  }
}

function formatTimestamp(epochMs: number): string {
  try {
    return new Date(epochMs).toLocaleString()
  } catch {
    return 'Unknown time'
  }
}

export default function AIGeneratorPage() {
  const { loading: authLoading } = useAuth()
  const { mode } = useBrandMode()
  const theme = getBrandModeTheme(mode)

  const [generating, setGenerating] = useState(false)
  const [generatedContent, setGeneratedContent] = useState('')
  const [viewMode, setViewMode] = useState<ViewMode>('preview')
  const [contentType, setContentType] = useState<ContentType>('headline')
  const [savedContent, setSavedContent] = useState<SavedContent[]>([])
  const [notice, setNotice] = useState<OutputNotice | null>(null)
  const [formData, setFormData] = useState<GeneratorFormData>({
    niche: '',
    productName: '',
    audience: '',
    tone: 'professional',
    context: '',
  })

  const previewModel = useMemo(() => parsePreviewModel(generatedContent), [generatedContent])
  const selectedType = CONTENT_TYPES.find((item) => item.value === contentType) ?? CONTENT_TYPES[0]

  useEffect(() => {
    try {
      const raw = localStorage.getItem(SAVED_CONTENT_KEY)
      if (!raw) return

      const parsed: unknown = JSON.parse(raw)
      if (!Array.isArray(parsed)) return

      const restored: SavedContent[] = parsed
        .map((item): SavedContent | null => {
          if (!isRecord(item)) return null

          const id = stringOrUndefined(item.id)
          const content = stringOrUndefined(item.content)
          const typeValue = stringOrUndefined(item.type)
          const timestamp = typeof item.timestamp === 'number' ? item.timestamp : Date.now()
          const niche = stringOrUndefined(item.niche) ?? ''
          const productName = stringOrUndefined(item.productName) ?? ''

          if (!id || !content || !isContentType(typeValue)) return null
          const type = typeValue
          return { id, content, type, timestamp, niche, productName }
        })
        .filter((item): item is SavedContent => item !== null)

      setSavedContent(restored.slice(0, 20))
    } catch (error) {
      console.error('Failed to restore saved AI content:', error)
    }
  }, [])

  useEffect(() => {
    try {
      localStorage.setItem(SAVED_CONTENT_KEY, JSON.stringify(savedContent))
    } catch (error) {
      console.error('Failed persisting saved AI content:', error)
    }
  }, [savedContent])

  async function handleGenerate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setGenerating(true)
    setNotice({ tone: 'info', text: 'Generating copy from your mission brief...' })

    try {
      const response = await fetch('/api/ai/generate-content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: contentType,
          ...formData,
        }),
      })

      const payload = (await response.json()) as { content?: string; error?: string }

      if (!response.ok || !payload.content) {
        throw new Error(payload.error || 'Failed to generate content')
      }

      setGeneratedContent(payload.content)
      setViewMode('preview')
      setNotice({ tone: 'success', text: 'Generation complete. Review and ship your best version.' })
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to generate content'
      setNotice({ tone: 'error', text: message })
    } finally {
      setGenerating(false)
    }
  }

  function applyPreset(preset: (typeof BRIEF_PRESETS)[number]) {
    setContentType(preset.type)
    setFormData(preset.form)
    setNotice({ tone: 'info', text: `Loaded preset: ${preset.title}` })
  }

  async function handleCopy() {
    if (!generatedContent) return

    try {
      await navigator.clipboard.writeText(generatedContent)
      setNotice({ tone: 'success', text: 'Copied generated content to clipboard.' })
    } catch (error) {
      console.error('Clipboard copy failed:', error)
      setNotice({ tone: 'error', text: 'Clipboard access failed. Copy manually from Raw view.' })
    }
  }

  function handleSave() {
    if (!generatedContent) return

    const entry: SavedContent = {
      id: Date.now().toString(),
      content: generatedContent,
      type: contentType,
      timestamp: Date.now(),
      niche: formData.niche,
      productName: formData.productName,
    }

    setSavedContent((current) => [entry, ...current].slice(0, 20))
    setNotice({ tone: 'success', text: 'Saved to mission library.' })
  }

  function handleLoadSaved(entry: SavedContent) {
    setGeneratedContent(entry.content)
    setContentType(entry.type)
    if (entry.niche || entry.productName) {
      setFormData((current) => ({
        ...current,
        niche: entry.niche || current.niche,
        productName: entry.productName || current.productName,
      }))
    }
    setViewMode('preview')
    setNotice({ tone: 'info', text: 'Loaded saved output into the console.' })
  }

  function handleDeleteSaved(id: string) {
    setSavedContent((current) => current.filter((entry) => entry.id !== id))
  }

  function handleClearBrief() {
    setFormData({
      niche: '',
      productName: '',
      audience: '',
      tone: 'professional',
      context: '',
    })
    setNotice({ tone: 'info', text: 'Mission brief reset.' })
  }

  if (authLoading) {
    return (
      <main className="page-ai-core min-h-screen">
        <div className="cockpit-container flex min-h-[60vh] items-center justify-center py-10">
          <div className="hud-card flex items-center gap-3">
            <Loader2 className="animate-spin text-text-secondary" size={18} />
            <p className="text-sm text-text-secondary">Loading AI generator controls...</p>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="cockpit-shell page-ai-core py-8">
      <div className="cockpit-container max-w-7xl space-y-6">
        <header className="hud-panel">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-system text-text-secondary">Intelligence Core</p>
              <h1 className="mt-1 text-3xl font-semibold text-text-primary md:text-4xl">AI Content Generator</h1>
              <p className="mt-2 max-w-3xl text-sm text-text-secondary">
                Build a mission brief, generate conversion copy, and ship validated content directly into your funnel workflow.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <span
                className="inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs uppercase tracking-system"
                style={{
                  borderColor: theme.borderFocus,
                  color: theme.accent,
                  background: theme.accentSoft,
                }}
              >
                <Sparkles size={14} />
                {theme.glowLabel}
              </span>
              <Link href="/templates" className="hud-button-secondary px-3 py-2 text-xs">
                Templates
              </Link>
              <Link href="/intelligence" className="hud-button-secondary px-3 py-2 text-xs">
                Personality
              </Link>
            </div>
          </div>
        </header>

        {notice && (
          <section
            className={`rounded-lg border px-4 py-3 text-sm ${
              notice.tone === 'error'
                ? 'border-red-400/40 bg-red-500/10 text-red-100'
                : notice.tone === 'success'
                  ? 'border-emerald-400/35 bg-emerald-500/10 text-emerald-100'
                  : 'border-[var(--border-elevated)] bg-[rgba(14,22,30,0.6)] text-text-secondary'
            }`}
          >
            {notice.text}
          </section>
        )}

        <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <DashboardPanel title="Active Profile" icon={<Sparkles size={15} />} value={theme.glowLabel} tone="info">
            <p className="text-xs text-text-secondary">Personality glow inherited from Intelligence settings.</p>
          </DashboardPanel>
          <DashboardPanel title="Output Type" icon={<Layers size={15} />} value={selectedType.label}>
            <p className="text-xs text-text-secondary">{selectedType.description}</p>
          </DashboardPanel>
          <DashboardPanel title="Mission Library" icon={<Save size={15} />} value={savedContent.length} valueLabel="Saved drafts" tone="success">
            <p className="text-xs text-text-secondary">Last 20 saved generations are available for reload.</p>
          </DashboardPanel>
          <DashboardPanel title="Generation Status" icon={<Bot size={15} />} value={generating ? 'Running' : generatedContent ? 'Ready' : 'Idle'} tone="warning">
            <p className="text-xs text-text-secondary">{generating ? 'AI engine is processing your brief.' : 'Console ready for next mission.'}</p>
          </DashboardPanel>
        </section>

        <section className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]">
          <WorkspacePanel
            title="Mission Brief"
            description="Step 1: define audience, offer, and intent before generation."
            icon={<Wand2 size={16} />}
            actions={
              <button type="button" onClick={handleClearBrief} className="hud-button-secondary px-3 py-2 text-xs">
                Reset Brief
              </button>
            }
          >
            <div className="mb-4 flex flex-wrap gap-2">
              {BRIEF_PRESETS.map((preset) => (
                <button
                  key={preset.title}
                  type="button"
                  onClick={() => applyPreset(preset)}
                  className="rounded-md border border-[var(--border-subtle)] px-2.5 py-1.5 text-xs text-text-secondary transition hover:border-[var(--border-focus)] hover:text-text-primary"
                >
                  {preset.title}
                </button>
              ))}
            </div>

            <form onSubmit={handleGenerate} className="space-y-4">
              <div>
                <label className="mb-2 block text-xs uppercase tracking-system text-text-secondary">Output Type</label>
                <select
                  value={contentType}
                  onChange={(event) => setContentType(event.target.value as ContentType)}
                  className="hud-select"
                >
                  {CONTENT_TYPES.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-2 block text-xs uppercase tracking-system text-text-secondary">Niche</label>
                <input
                  value={formData.niche}
                  onChange={(event) => setFormData((current) => ({ ...current, niche: event.target.value }))}
                  placeholder="Affiliate marketing, SaaS, coaching..."
                  className="hud-input"
                  required
                />
              </div>

              <div>
                <label className="mb-2 block text-xs uppercase tracking-system text-text-secondary">Product / Offer</label>
                <input
                  value={formData.productName}
                  onChange={(event) => setFormData((current) => ({ ...current, productName: event.target.value }))}
                  placeholder="Name of the primary offer"
                  className="hud-input"
                  required
                />
              </div>

              <div>
                <label className="mb-2 block text-xs uppercase tracking-system text-text-secondary">Audience</label>
                <input
                  value={formData.audience}
                  onChange={(event) => setFormData((current) => ({ ...current, audience: event.target.value }))}
                  placeholder="Who this copy must convert"
                  className="hud-input"
                  required
                />
              </div>

              <div>
                <label className="mb-2 block text-xs uppercase tracking-system text-text-secondary">Tone</label>
                <select
                  value={formData.tone}
                  onChange={(event) => setFormData((current) => ({ ...current, tone: event.target.value as Tone }))}
                  className="hud-select"
                >
                  <option value="professional">Professional</option>
                  <option value="casual">Casual</option>
                  <option value="urgent">Urgent</option>
                  <option value="friendly">Friendly</option>
                </select>
              </div>

              <div>
                <label className="mb-2 block text-xs uppercase tracking-system text-text-secondary">Context Notes</label>
                <textarea
                  value={formData.context}
                  onChange={(event) => setFormData((current) => ({ ...current, context: event.target.value }))}
                  placeholder="Specific angle, objections to handle, compliance constraints..."
                  rows={4}
                  className="hud-textarea"
                />
              </div>

              <button type="submit" disabled={generating} className="hud-button-primary inline-flex w-full items-center justify-center gap-2">
                {generating ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles size={16} />
                    Generate Content
                  </>
                )}
              </button>
            </form>
          </WorkspacePanel>

          <WorkspacePanel
            title="Output Console"
            description="Step 2: inspect generated copy in preview or raw mode."
            icon={<Bot size={16} />}
            actions={
              <div className="flex items-center gap-2">
                <div className="hud-card-tight flex items-center gap-1 p-1">
                  <button
                    type="button"
                    onClick={() => setViewMode('preview')}
                    className={`rounded-md px-2.5 py-1.5 text-xs transition ${viewMode === 'preview' ? 'border border-[var(--border-focus)] bg-[var(--accent-soft)] text-text-primary' : 'text-text-secondary'}`}
                  >
                    <span className="inline-flex items-center gap-1">
                      <Eye size={12} />
                      Preview
                    </span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setViewMode('raw')}
                    className={`rounded-md px-2.5 py-1.5 text-xs transition ${viewMode === 'raw' ? 'border border-[var(--border-focus)] bg-[var(--accent-soft)] text-text-primary' : 'text-text-secondary'}`}
                  >
                    <span className="inline-flex items-center gap-1">
                      <FileCode2 size={12} />
                      Raw
                    </span>
                  </button>
                </div>
                <button type="button" onClick={handleCopy} disabled={!generatedContent} className="hud-button-secondary px-3 py-2 text-xs disabled:cursor-not-allowed disabled:opacity-50">
                  <span className="inline-flex items-center gap-1">
                    <ClipboardCopy size={13} />
                    Copy
                  </span>
                </button>
                <button type="button" onClick={handleSave} disabled={!generatedContent} className="hud-button-secondary px-3 py-2 text-xs disabled:cursor-not-allowed disabled:opacity-50">
                  <span className="inline-flex items-center gap-1">
                    <Save size={13} />
                    Save
                  </span>
                </button>
              </div>
            }
          >
            {generating ? (
              <div className="space-y-3">
                <div className="h-9 animate-pulse rounded-md bg-[rgba(174,183,194,0.18)]" />
                <div className="h-24 animate-pulse rounded-md bg-[rgba(174,183,194,0.14)]" />
                <div className="h-24 animate-pulse rounded-md bg-[rgba(174,183,194,0.1)]" />
              </div>
            ) : generatedContent ? (
              <div className="rounded-xl border border-[var(--border-elevated)] bg-[rgba(8,13,20,0.74)] p-4">
                {viewMode === 'raw' ? (
                  <pre className="max-h-[500px] overflow-auto whitespace-pre-wrap break-words text-sm text-text-primary">
                    {generatedContent}
                  </pre>
                ) : (
                  <div className="space-y-4">
                    {previewModel.headline && <h2 className="text-2xl font-semibold text-text-primary">{previewModel.headline}</h2>}

                    {previewModel.subheadline && <p className="text-base text-text-secondary">{previewModel.subheadline}</p>}

                    {previewModel.subject && (
                      <div className="rounded-lg border border-[var(--border-subtle)] bg-[rgba(14,22,30,0.5)] p-3">
                        <p className="text-xs uppercase tracking-system text-text-secondary">Subject</p>
                        <p className="mt-1 text-sm text-text-primary">{previewModel.subject}</p>
                        {previewModel.preview && (
                          <>
                            <p className="mt-3 text-xs uppercase tracking-system text-text-secondary">Preview Text</p>
                            <p className="mt-1 text-sm text-text-primary">{previewModel.preview}</p>
                          </>
                        )}
                      </div>
                    )}

                    {previewModel.benefits.length > 0 && (
                      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                        {previewModel.benefits.map((benefit, index) => (
                          <article key={`${benefit.title}-${index}`} className="rounded-lg border border-[var(--border-subtle)] bg-[rgba(14,22,30,0.52)] p-3">
                            <p className="text-sm font-semibold text-text-primary">{benefit.title}</p>
                            {benefit.description && <p className="mt-1 text-sm text-text-secondary">{benefit.description}</p>}
                          </article>
                        ))}
                      </div>
                    )}

                    {previewModel.bulletPoints.length > 0 && (
                      <ul className="space-y-2">
                        {previewModel.bulletPoints.map((line, index) => (
                          <li key={`${line}-${index}`} className="flex items-start gap-2 text-sm text-text-primary">
                            <span className="mt-[3px] inline-block h-2 w-2 rounded-full bg-[var(--accent)]" />
                            <span>{line}</span>
                          </li>
                        ))}
                      </ul>
                    )}

                    {previewModel.body && <p className="whitespace-pre-wrap text-sm leading-6 text-text-primary">{previewModel.body}</p>}

                    {previewModel.cta && (
                      <button type="button" className="hud-button-primary px-4 py-2 text-sm">
                        {previewModel.cta}
                      </button>
                    )}

                    {!previewModel.hasStructuredData && previewModel.fallbackText && (
                      <div className="rounded-lg border border-[var(--border-subtle)] bg-[rgba(14,22,30,0.5)] p-3">
                        <p className="whitespace-pre-wrap text-sm text-text-primary">{previewModel.fallbackText}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ) : (
              <CockpitEmptyState
                title="No generated output yet"
                description="Step 2 begins after you submit a mission brief. Use a preset for a fast first run."
                icon={<Bot size={30} />}
                compact
              />
            )}
          </WorkspacePanel>
        </section>

        <section className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.95fr)]">
          <WorkspacePanel title="Mission Library" description="Step 3: reload, compare, and reuse your strongest outputs." icon={<Save size={16} />} expandable>
            {savedContent.length === 0 ? (
              <CockpitEmptyState
                compact
                title="Mission library is empty"
                description="Save generated outputs to keep reusable headlines, emails, and full-page drafts."
              />
            ) : (
              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                {savedContent.map((entry) => (
                  <article key={entry.id} className="rounded-lg border border-[var(--border-subtle)] bg-[rgba(12,18,28,0.56)] p-3">
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-xs uppercase tracking-system text-text-secondary">{entry.type}</p>
                      <p className="text-[11px] text-text-muted">{formatTimestamp(entry.timestamp)}</p>
                    </div>
                    <p className="mt-2 line-clamp-3 text-sm text-text-primary">{entry.content}</p>
                    {(entry.productName || entry.niche) && (
                      <p className="mt-2 text-xs text-text-secondary">
                        {entry.productName || 'Untitled offer'}
                        {entry.niche ? ` · ${entry.niche}` : ''}
                      </p>
                    )}
                    <div className="mt-3 flex items-center gap-2">
                      <button type="button" onClick={() => handleLoadSaved(entry)} className="hud-button-secondary px-3 py-1.5 text-xs">
                        Load
                      </button>
                      <button type="button" onClick={() => handleDeleteSaved(entry.id)} className="hud-button-danger inline-flex items-center gap-1 px-2.5 py-1.5 text-xs">
                        <Trash2 size={12} />
                        Delete
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </WorkspacePanel>

          <WorkspacePanel title="Operator Notes" description="High-signal rules for better generation quality." icon={<Sparkles size={16} />} expandable>
            <ul className="space-y-2 text-sm text-text-secondary">
              <li>Anchor your brief around one target audience and one desired action.</li>
              <li>Use context notes for compliance constraints and proof points, not extra hype.</li>
              <li>Generate 2-3 variants, save top lines, then compose final copy manually.</li>
              <li>Use Raw view whenever you need exact JSON for builders or API workflows.</li>
            </ul>
          </WorkspacePanel>
        </section>
      </div>
    </main>
  )
}
