'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Layers, Shapes, Mail } from 'lucide-react'
import type { BrandVoice, TemplateCategory } from '@/config/funnelTemplates'
import { getTemplateGallery } from '@/lib/api/templates'
import { createFunnel } from '@/lib/api/funnels'
import DashboardPanel from '@/components/cockpit/DashboardPanel'
import WorkspacePanel from '@/components/cockpit/WorkspacePanel'
import { CockpitEmptyState } from '@/components/ui/CockpitEmptyState'
import SystemExplanationToggle from '@/components/ui/SystemExplanationToggle'
import TemplatesSkeleton from './TemplatesSkeleton'

const voiceOptions: Array<'all' | BrandVoice> = ['all', 'glitch', 'anchor', 'boost']
const categoryOptions: Array<'all' | TemplateCategory> = ['all', 'lead_magnet', 'product_launch', 'webinar', 'affiliate_review', 'sales_page']

function getParodyLabel(template: FunnelTemplate) {
  if (template.brandVoice === 'glitch') return 'Glitch AI'
  if (template.brandVoice === 'anchor') return 'Anti-guru / Deadpan'
  return 'Parody Adjacent'
}

export default function TemplatesWorkspace() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [voice, setVoice] = useState<'all' | BrandVoice>('all')
  const [category, setCategory] = useState<'all' | TemplateCategory>('all')
  const [gallery, setGallery] = useState<Awaited<ReturnType<typeof getTemplateGallery>> | null>(null)
  const [creatingTemplateId, setCreatingTemplateId] = useState<string | null>(null)
  const [previewLandingId, setPreviewLandingId] = useState<string | null>(null)
  const [previewEmailKey, setPreviewEmailKey] = useState<string | null>(null)

  useEffect(() => {
    let active = true

    async function load() {
      try {
        setLoading(true)
        setError(null)
        const query: TemplateQuery = {
          brandVoice: voice === 'all' ? undefined : voice,
          category: category === 'all' ? undefined : category,
        }
        const data = await getTemplateGallery(query)
        if (active) {
          setGallery(data)
        }
      } catch (err) {
        if (active) {
          setError(err instanceof Error ? err.message : 'Failed to load templates')
        }
      } finally {
        if (active) {
          setLoading(false)
        }
      }
    }

    load()

    return () => {
      active = false
    }
  }, [voice, category])

  const filteredLanding = useMemo(() => {
    return gallery?.landingTemplates || []
  }, [gallery?.landingTemplates])

  const parodyTemplates = useMemo(() => {
    return ALL_TEMPLATES.filter((template) => template.brandVoice === 'glitch' || template.brandVoice === 'anchor').slice(0, 12)
  }, [])

  const previewLandingTemplate = useMemo(() => {
    if (!previewLandingId) return null
    return (gallery?.landingTemplates || []).find((template) => template.id === previewLandingId) || null
  }, [gallery?.landingTemplates, previewLandingId])

  const previewEmailTemplate = useMemo(() => {
    if (!previewEmailKey) return null
    return (gallery?.emailTemplates || []).find((template) => (template.id || template.name) === previewEmailKey) || null
  }, [gallery?.emailTemplates, previewEmailKey])

  async function handleUseLandingTemplate(templateId: string) {
    const selectedTemplate = (gallery?.landingTemplates || []).find((template) => template.id === templateId)
    if (!selectedTemplate) {
      setError('Template not found')
      return
    }

    try {
      setCreatingTemplateId(templateId)
      setError(null)
      const response = await createFunnel({
        name: `${selectedTemplate.name} Funnel`,
        template: selectedTemplate.id,
        niche: selectedTemplate.category,
        blocks: selectedTemplate.blocks as unknown as Array<Record<string, unknown>>,
        theme: selectedTemplate.theme as unknown as Record<string, unknown>,
      })

      if (!response.funnelId) {
        throw new Error('Funnel creation succeeded but no funnel id was returned')
      }

      router.push(`/funnels/${response.funnelId}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create funnel from template')
    } finally {
      setCreatingTemplateId(null)
    }
  }

  if (loading) {
    return <TemplatesSkeleton />
  }

  return (
    <main className="cockpit-shell page-ai-core py-8">
      <div className="cockpit-container max-w-7xl space-y-6">
        <section className="hud-panel">
          <p className="text-xs uppercase tracking-system text-text-secondary">Templates</p>
          <h1 className="text-3xl font-semibold text-text-primary md:text-4xl">Template Library Console</h1>
          <p className="mt-2 text-sm text-text-secondary">Filter and inspect reusable landing and email templates for fast deployment.</p>
        </section>

        {error && <section className="rounded-lg border border-red-400/35 bg-red-500/12 p-4 text-red-200">{error}</section>}

        <section className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <DashboardPanel title="Landing Templates" icon={<Layers size={16} />} value={(gallery?.landingTemplates || []).length} tone="info">
            <p className="text-xs text-text-secondary">Total templates available from API.</p>
          </DashboardPanel>
          <DashboardPanel title="Filtered Results" icon={<Shapes size={16} />} value={filteredLanding.length} tone="neutral">
            <p className="text-xs text-text-secondary">Matching active filter controls.</p>
          </DashboardPanel>
          <DashboardPanel title="Email Templates" icon={<Mail size={16} />} value={(gallery?.emailTemplates || []).length} tone="success">
            <p className="text-xs text-text-secondary">Email template inventory status.</p>
          </DashboardPanel>
        </section>

        <WorkspacePanel
          title="Template Filters"
          description="Select voice mode and category for focused browsing."
          titleAccessory={
            <SystemExplanationToggle explanation="Filters prevent context drift. They keep template selection aligned to one voice and one conversion intent at a time." />
          }
          expandable
        >
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <select className="hud-select" value={voice} onChange={(event) => setVoice(event.target.value as 'all' | BrandVoice)}>
              {voiceOptions.map((option) => (
                <option key={option} value={option}>
                  Voice: {option}
                </option>
              ))}
            </select>
            <select className="hud-select" value={category} onChange={(event) => setCategory(event.target.value as 'all' | TemplateCategory)}>
              {categoryOptions.map((option) => (
                <option key={option} value={option}>
                  Category: {option}
                </option>
              ))}
            </select>
          </div>
        </WorkspacePanel>

        <WorkspacePanel
          title="Parody Template Library"
          description="Conversion-ready templates for anti-guru tone, glitch AI satire, and deadpan honesty."
          titleAccessory={
            <SystemExplanationToggle explanation="These templates convert by disarming skepticism. They replace hype with clarity and strong offer framing." />
          }
          expandable
        >
          <div className="mb-3 rounded-lg border border-[var(--border-subtle)] bg-[rgba(10,16,24,0.55)] p-3 text-sm text-text-secondary">
            Tone rails: <span className="text-text-primary">Anti-guru</span>, <span className="text-text-primary">Glitch AI</span>, <span className="text-text-primary">Deadpan honesty</span>.
          </div>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            {parodyTemplates.map((template) => (
              <article key={`parody-${template.id}`} className="rounded-lg border border-[var(--border-subtle)] bg-[rgba(10,16,24,0.55)] p-4">
                <p className="text-xs uppercase tracking-system text-text-secondary">
                  {getParodyLabel(template)} · {template.category}
                </p>
                <h3 className="mt-2 text-lg font-semibold text-text-primary">{template.name}</h3>
                <p className="mt-1 text-sm text-text-secondary">{template.description}</p>
                <p className="mt-3 text-xs text-text-secondary">{template.blocks.length} blocks</p>
              </article>
            ))}
          </div>
        </WorkspacePanel>

        <WorkspacePanel
          title="Landing Template Grid"
          description="Reusable landing modules for funnel composition."
          titleAccessory={
            <SystemExplanationToggle explanation="The landing grid is your deployment inventory. Start from known structures instead of rebuilding funnel scaffolding each time." />
          }
          expandable
        >
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            {filteredLanding.length === 0 ? (
              <div className="md:col-span-2 xl:col-span-3">
                <CockpitEmptyState
                  title="No templates match current filters"
                  description="Adjust voice or category filters to see available landing templates."
                />
              </div>
            ) : (
              filteredLanding.map((template) => (
                <article key={template.id} className="rounded-lg border border-[var(--border-subtle)] bg-[rgba(10,16,24,0.55)] p-4">
                  <p className="text-xs uppercase tracking-system text-text-secondary">
                    {template.brandVoice} · {template.category}
                  </p>
                  <h3 className="mt-2 text-lg font-semibold text-text-primary">{template.name}</h3>
                  <p className="mt-1 text-sm text-text-secondary">{template.description}</p>
                  <p className="mt-3 text-xs text-text-secondary">{template.blocks.length} blocks</p>
                  <div className="mt-4 flex gap-2">
                    <button
                      type="button"
                      onClick={() => setPreviewLandingId(template.id)}
                      className="hud-button-secondary px-3 py-1.5 text-xs"
                    >
                      Preview
                    </button>
                    <button
                      type="button"
                      disabled={creatingTemplateId === template.id}
                      onClick={() => handleUseLandingTemplate(template.id)}
                      className="hud-button-primary px-3 py-1.5 text-xs"
                    >
                      {creatingTemplateId === template.id ? 'Selecting...' : 'Use Template'}
                    </button>
                  </div>
                </article>
              ))
            )}
          </div>
        </WorkspacePanel>

        <WorkspacePanel
          title="Email Template Library"
          description="Subject-line and content templates for campaigns."
          titleAccessory={
            <SystemExplanationToggle explanation="Email templates preserve follow-up continuity so leads do not drop between click and conversion." />
          }
          expandable
        >
          {(gallery?.emailTemplates || []).length === 0 ? (
            <CockpitEmptyState
              compact
              title="No email templates available"
              description="Email templates appear here after API sync."
              secondaryAction={{ label: 'Open Email Workspace', href: '/email' }}
            />
          ) : (
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              {gallery?.emailTemplates.map((template) => (
                <article key={template.id || template.name} className="rounded-lg border border-[var(--border-subtle)] p-4">
                  <h3 className="font-medium text-text-primary">{template.name}</h3>
                  <p className="mt-1 text-sm text-text-secondary">{template.subject}</p>
                  <div className="mt-4 flex gap-2">
                    <button
                      type="button"
                      onClick={() => setPreviewEmailKey(template.id || template.name)}
                      className="hud-button-secondary px-3 py-1.5 text-xs"
                    >
                      Preview
                    </button>
                    <button
                      type="button"
                      onClick={() => router.push(`/email?templateId=${encodeURIComponent(template.id || template.name)}`)}
                      className="hud-button-primary px-3 py-1.5 text-xs"
                    >
                      Use Template
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </WorkspacePanel>

        {previewLandingTemplate && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
            <div className="max-h-[85vh] w-full max-w-3xl overflow-y-auto rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-primary)] p-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs uppercase tracking-system text-text-secondary">
                    {previewLandingTemplate.brandVoice} · {previewLandingTemplate.category}
                  </p>
                  <h2 className="mt-2 text-2xl font-semibold text-text-primary">{previewLandingTemplate.name}</h2>
                  <p className="mt-1 text-sm text-text-secondary">{previewLandingTemplate.description}</p>
                </div>
                <button
                  type="button"
                  className="hud-button-secondary px-3 py-1.5 text-xs"
                  onClick={() => setPreviewLandingId(null)}
                >
                  Close
                </button>
              </div>
              <div className="mt-4 rounded-lg border border-[var(--border-subtle)] p-4">
                <p className="text-xs uppercase tracking-system text-text-secondary">Theme</p>
                <p className="mt-1 text-sm text-text-secondary">
                  {previewLandingTemplate.theme.fontFamily} · Primary {previewLandingTemplate.theme.primaryColor} · Secondary{' '}
                  {previewLandingTemplate.theme.secondaryColor}
                </p>
              </div>
              <div className="mt-4 overflow-hidden rounded-lg border border-[var(--border-subtle)]">
                <img
                  src={previewLandingTemplate.thumbnail}
                  alt={`${previewLandingTemplate.name} preview`}
                  className="h-56 w-full bg-[rgba(10,16,24,0.55)] object-cover"
                />
              </div>
              <div className="mt-4 space-y-3">
                {previewLandingTemplate.blocks.map((block, index) => (
                  <div key={block.id} className="rounded-lg border border-[var(--border-subtle)] p-3">
                    <p className="text-xs uppercase tracking-system text-text-secondary">
                      Block {index + 1} · {block.type}
                    </p>
                    <p className="mt-1 text-sm text-text-primary">
                      {typeof block.content.headline === 'string'
                        ? block.content.headline
                        : typeof block.content.title === 'string'
                          ? block.content.title
                          : 'Template content block'}
                    </p>
                  </div>
                ))}
              </div>
              <div className="mt-5 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setPreviewLandingId(null)}
                  className="hud-button-secondary px-3 py-1.5 text-xs"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={creatingTemplateId === previewLandingTemplate.id}
                  onClick={() => handleUseLandingTemplate(previewLandingTemplate.id)}
                  className="hud-button-primary px-3 py-1.5 text-xs"
                >
                  {creatingTemplateId === previewLandingTemplate.id ? 'Selecting...' : 'Use This Template'}
                </button>
              </div>
            </div>
          </div>
        )}

        {previewEmailTemplate && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
            <div className="max-h-[85vh] w-full max-w-3xl overflow-y-auto rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-primary)] p-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h2 className="text-2xl font-semibold text-text-primary">{previewEmailTemplate.name}</h2>
                  <p className="mt-1 text-sm text-text-secondary">{previewEmailTemplate.subject}</p>
                </div>
                <button
                  type="button"
                  className="hud-button-secondary px-3 py-1.5 text-xs"
                  onClick={() => setPreviewEmailKey(null)}
                >
                  Close
                </button>
              </div>
              {previewEmailTemplate.preheader && (
                <div className="mt-4 rounded-lg border border-[var(--border-subtle)] p-3 text-sm text-text-secondary">
                  Preheader: {previewEmailTemplate.preheader}
                </div>
              )}
              <div className="mt-4 rounded-lg border border-[var(--border-subtle)] p-3">
                <p className="text-xs uppercase tracking-system text-text-secondary">Body Preview</p>
                <div className="mt-2 whitespace-pre-wrap text-sm text-text-primary">
                  {previewEmailTemplate.text || previewEmailTemplate.html || 'No body content available'}
                </div>
              </div>
              <div className="mt-5 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setPreviewEmailKey(null)}
                  className="hud-button-secondary px-3 py-1.5 text-xs"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => router.push(`/email?templateId=${encodeURIComponent(previewEmailTemplate.id || previewEmailTemplate.name)}`)}
                  className="hud-button-primary px-3 py-1.5 text-xs"
                >
                  Use In Email Console
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  )
}
