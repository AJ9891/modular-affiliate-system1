'use client'

import { useEffect, useMemo, useState } from 'react'
import { Layers, Shapes, Mail } from 'lucide-react'
import type { BrandVoice, TemplateCategory } from '@/config/funnelTemplates'
import { getTemplateGallery, type TemplateQuery } from '@/lib/api/templates'
import DashboardPanel from '@/components/cockpit/DashboardPanel'
import WorkspacePanel from '@/components/cockpit/WorkspacePanel'
import { CockpitEmptyState } from '@/components/ui/CockpitEmptyState'
import TemplatesSkeleton from './TemplatesSkeleton'

const voiceOptions: Array<'all' | BrandVoice> = ['all', 'glitch', 'anchor', 'boost']
const categoryOptions: Array<'all' | TemplateCategory> = ['all', 'lead_magnet', 'product_launch', 'webinar', 'affiliate_review', 'sales_page']

export default function TemplatesWorkspace() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [voice, setVoice] = useState<'all' | BrandVoice>('all')
  const [category, setCategory] = useState<'all' | TemplateCategory>('all')
  const [gallery, setGallery] = useState<Awaited<ReturnType<typeof getTemplateGallery>> | null>(null)

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

        <WorkspacePanel title="Template Filters" description="Select voice mode and category for focused browsing." expandable>
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

        <WorkspacePanel title="Landing Template Grid" description="Reusable landing modules for funnel composition." expandable>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            {filteredLanding.length === 0 ? (
              <div className="md:col-span-2 xl:col-span-3">
                <CockpitEmptyState
                  title="No templates match current filters"
                  description="Adjust voice or category filters to see available landing templates."
                  tone="warning"
                  tips={[
                    'Switch category to "all" to broaden results.',
                    'Try a different brand voice filter.',
                  ]}
                />
              </div>
            ) : (
              filteredLanding.slice(0, 18).map((template) => (
                <article key={template.id} className="rounded-lg border border-[var(--border-subtle)] bg-[rgba(10,16,24,0.55)] p-4">
                  <p className="text-xs uppercase tracking-system text-text-secondary">
                    {template.brandVoice} · {template.category}
                  </p>
                  <h3 className="mt-2 text-lg font-semibold text-text-primary">{template.name}</h3>
                  <p className="mt-1 text-sm text-text-secondary">{template.description}</p>
                  <p className="mt-3 text-xs text-text-secondary">{template.blocks.length} blocks</p>
                </article>
              ))
            )}
          </div>
        </WorkspacePanel>

        <WorkspacePanel title="Email Template Library" description="Subject-line and content templates for campaigns." expandable>
          {(gallery?.emailTemplates || []).length === 0 ? (
            <CockpitEmptyState
              compact
              title="No email templates available"
              description="Email templates appear here after API sync."
              tone="warning"
              tips={['Use Email workspace setup to seed baseline templates.']}
              secondaryAction={{ label: 'Open Email Workspace', href: '/email' }}
            />
          ) : (
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              {gallery?.emailTemplates.map((template) => (
                <article key={template.id || template.name} className="rounded-lg border border-[var(--border-subtle)] p-4">
                  <h3 className="font-medium text-text-primary">{template.name}</h3>
                  <p className="mt-1 text-sm text-text-secondary">{template.subject}</p>
                </article>
              ))}
            </div>
          )}
        </WorkspacePanel>
      </div>
    </main>
  )
}
