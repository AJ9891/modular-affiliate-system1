'use client'

import { useEffect, useMemo, useState } from 'react'
import type { BrandVoice, TemplateCategory } from '@/config/funnelTemplates'
import { getTemplateGallery } from '@/lib/api/templates'
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
        const data = await getTemplateGallery()
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
  }, [])

  const filteredLanding = useMemo(() => {
    return (gallery?.landingTemplates || []).filter((template) => {
      const voiceMatch = voice === 'all' || template.brandVoice === voice
      const categoryMatch = category === 'all' || template.category === category
      return voiceMatch && categoryMatch
    })
  }, [category, gallery?.landingTemplates, voice])

  if (loading) {
    return <TemplatesSkeleton />
  }

  return (
    <main className="cockpit-shell page-ai-core py-8">
      <div className="cockpit-container max-w-6xl space-y-6">
        <section className="hud-panel">
          <p className="text-xs uppercase tracking-system text-text-secondary">Templates</p>
          <h1 className="text-3xl font-semibold text-text-primary md:text-4xl">Landing and Email Templates</h1>
          <p className="mt-2 text-sm text-text-secondary">Browse reusable landing page templates and email templates.</p>
        </section>

        {error && <section className="rounded-lg border border-red-400/35 bg-red-500/12 p-4 text-red-200">{error}</section>}

        <section className="hud-card space-y-4">
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <select className="hud-select" value={voice} onChange={(event) => setVoice(event.target.value as 'all' | BrandVoice)}>
              {voiceOptions.map((option) => (
                <option key={option} value={option}>
                  Voice: {option}
                </option>
              ))}
            </select>
            <select
              className="hud-select"
              value={category}
              onChange={(event) => setCategory(event.target.value as 'all' | TemplateCategory)}
            >
              {categoryOptions.map((option) => (
                <option key={option} value={option}>
                  Category: {option}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            {filteredLanding.slice(0, 18).map((template) => (
              <article key={template.id} className="rounded-lg border border-[var(--border-subtle)] bg-[rgba(10,16,24,0.55)] p-4">
                <p className="text-xs uppercase tracking-system text-text-secondary">
                  {template.brandVoice} · {template.category}
                </p>
                <h3 className="mt-2 text-lg font-semibold text-text-primary">{template.name}</h3>
                <p className="mt-1 text-sm text-text-secondary">{template.description}</p>
                <p className="mt-3 text-xs text-text-secondary">{template.blocks.length} blocks</p>
              </article>
            ))}
          </div>
        </section>

        <section className="hud-card">
          <h2 className="mb-3 text-xl font-semibold text-text-primary">Email Templates</h2>
          {(gallery?.emailTemplates || []).length === 0 ? (
            <p className="text-sm text-text-secondary">No email templates available from the API.</p>
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
        </section>
      </div>
    </main>
  )
}
