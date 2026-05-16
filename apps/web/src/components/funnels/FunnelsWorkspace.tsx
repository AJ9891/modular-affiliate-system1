'use client'

import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'
import { FolderKanban, TimerReset, FileText, CheckCircle2 } from 'lucide-react'
import { createFunnel, deleteFunnel, listFunnels, type FunnelRecord } from '@/lib/api/funnels'
import { ALL_TEMPLATES } from '@/config/funnelTemplates'
import DashboardPanel from '@/components/cockpit/DashboardPanel'
import WorkspacePanel from '@/components/cockpit/WorkspacePanel'
import { CockpitEmptyState } from '@/components/ui/CockpitEmptyState'
import FunnelPreviewDialog from './FunnelPreviewDialog'
import FunnelsSkeleton from './FunnelsSkeleton'

export default function FunnelsWorkspace() {
  const [funnels, setFunnels] = useState<FunnelRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [showCreate, setShowCreate] = useState(false)
  const [name, setName] = useState('')
  const [template, setTemplate] = useState(ALL_TEMPLATES[0]?.id || '')
  const [niche, setNiche] = useState('general')
  const [saving, setSaving] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const selectedTemplate = useMemo(
    () => ALL_TEMPLATES.find((item) => item.id === template) || null,
    [template]
  )

  async function loadFunnels() {
    try {
      setLoading(true)
      setError(null)
      const items = await listFunnels()
      setFunnels(items)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load funnels')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadFunnels()
  }, [])

  async function handleCreate() {
    if (!name.trim() || !selectedTemplate) {
      setError('Funnel name is required')
      return
    }

    try {
      setSaving(true)
      setError(null)
      const response = await createFunnel({
        name,
        template: selectedTemplate.id,
        niche: selectedTemplate.category || niche,
        blocks: selectedTemplate.blocks as unknown as Array<Record<string, unknown>>,
        theme: selectedTemplate.theme as unknown as Record<string, unknown>,
      })
      setShowCreate(false)
      setName('')
      await loadFunnels()

      if (response.funnelId) {
        window.location.href = `/funnels/${response.funnelId}`
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create funnel')
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(funnelId: string) {
    const confirmed = window.confirm('Delete this funnel? This action cannot be undone.')
    if (!confirmed) return

    try {
      setDeletingId(funnelId)
      await deleteFunnel(funnelId)
      setFunnels((prev) => prev.filter((item) => item.funnel_id !== funnelId))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete funnel')
    } finally {
      setDeletingId(null)
    }
  }

  const sortedFunnels = useMemo(() => {
    return [...funnels].sort((a, b) => {
      const aDate = new Date(a.updated_at || a.created_at || 0).getTime()
      const bDate = new Date(b.updated_at || b.created_at || 0).getTime()
      return bDate - aDate
    })
  }, [funnels])

  const draftCount = useMemo(
    () => sortedFunnels.filter((funnel) => (funnel.status || 'draft').toLowerCase() !== 'published').length,
    [sortedFunnels]
  )
  const publishedCount = sortedFunnels.length - draftCount
  const latestUpdate = sortedFunnels[0]?.updated_at || sortedFunnels[0]?.created_at

  if (loading && funnels.length === 0) {
    return <FunnelsSkeleton />
  }

  return (
    <main className="cockpit-shell page-engineering-bay py-8">
      <div className="cockpit-container max-w-7xl space-y-6">
        <section className="hud-panel flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs uppercase tracking-system text-text-secondary">Funnels</p>
            <h1 className="text-3xl font-semibold text-text-primary md:text-4xl">Funnels Command Workspace</h1>
            <p className="mt-1 text-sm text-text-secondary">Create, edit, and deploy conversion funnels from a single control surface.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button type="button" className="hud-button-secondary px-4 py-2" onClick={() => setShowCreate((v) => !v)}>
              {showCreate ? 'Close Composer' : 'Create Funnel'}
            </button>
            <Link href="/link-funnel" className="hud-button-primary px-4 py-2">
              Open Link Builder
            </Link>
          </div>
        </section>

        {error && (
          <section className="rounded-lg border border-red-400/35 bg-red-500/12 p-4 text-red-200">
            {error}
          </section>
        )}

        <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <DashboardPanel title="Total Funnels" icon={<FolderKanban size={16} />} value={sortedFunnels.length.toLocaleString()} tone="info">
            <p className="text-xs text-text-secondary">All created funnels in your workspace.</p>
          </DashboardPanel>
          <DashboardPanel title="Published" icon={<CheckCircle2 size={16} />} value={publishedCount.toLocaleString()} tone="success">
            <p className="text-xs text-text-secondary">Funnels available for live traffic.</p>
          </DashboardPanel>
          <DashboardPanel title="Drafts" icon={<FileText size={16} />} value={draftCount.toLocaleString()} tone="warning">
            <p className="text-xs text-text-secondary">Funnels pending edits or publish.</p>
          </DashboardPanel>
          <DashboardPanel
            title="Latest Update"
            icon={<TimerReset size={16} />}
            value={latestUpdate ? new Date(latestUpdate).toLocaleDateString() : 'N/A'}
            tone="neutral"
          >
            <p className="text-xs text-text-secondary">Most recently modified funnel timestamp.</p>
          </DashboardPanel>
        </section>

        {showCreate && (
          <WorkspacePanel
            title="Funnel Composer"
            description="Define funnel metadata and open the editor immediately after creation."
            actions={
              <button
                type="button"
                disabled={saving}
                onClick={handleCreate}
                className="hud-button-primary px-3 py-1.5 text-xs"
              >
                {saving ? 'Creating...' : 'Save and Open'}
              </button>
            }
            expandable
          >
            <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
              <input value={name} onChange={(event) => setName(event.target.value)} placeholder="Funnel name" className="hud-input" />
              <select value={template} onChange={(event) => setTemplate(event.target.value)} className="hud-select">
                {ALL_TEMPLATES.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.name} ({item.brandVoice}/{item.category})
                  </option>
                ))}
              </select>
              <input value={niche} onChange={(event) => setNiche(event.target.value)} placeholder="Niche" className="hud-input" />
            </div>
            {selectedTemplate && (
              <p className="mt-3 text-xs text-text-secondary">
                Selected template includes {selectedTemplate.blocks.length} blocks and applies its default theme.
              </p>
            )}
          </WorkspacePanel>
        )}

        <WorkspacePanel
          title="Funnel Registry"
          description="Scan funnel status, update recency, and open editing commands."
          actions={
            <button type="button" onClick={loadFunnels} className="hud-button-secondary px-3 py-1.5 text-xs">
              Refresh
            </button>
          }
          expandable
        >
          {sortedFunnels.length === 0 ? (
            <CockpitEmptyState
              title="No funnels yet"
              description="Create your first funnel to publish pages, capture leads, and start tracking performance."
              primaryAction={{ label: 'Create Funnel', onClick: () => setShowCreate(true) }}
              secondaryAction={{ label: 'Open Link Builder', href: '/link-funnel' }}
            />
          ) : (
            <>
              <div className="space-y-3 md:hidden">
                {sortedFunnels.map((funnel) => (
                  <article
                    key={funnel.funnel_id}
                    className="rounded-lg border border-[var(--border-subtle)] bg-[rgba(10,16,24,0.5)] p-4"
                  >
                    <p className="text-base font-semibold text-text-primary">{funnel.name}</p>
                    <div className="mt-1">
                      <FunnelPreviewDialog
                        slug={funnel.slug}
                        name={funnel.name}
                        triggerLabel={`/${funnel.slug}`}
                        triggerClassName="text-xs text-rocket-400 hover:text-rocket-300"
                      />
                    </div>
                    <p className="mt-2 text-xs text-text-secondary">
                      Updated {new Date(funnel.updated_at || funnel.created_at || '').toLocaleString()}
                    </p>
                    <div className="mt-3 flex gap-2">
                      <Link href={`/funnels/${funnel.funnel_id}`} className="hud-button-secondary px-3 py-1 text-xs">
                        Edit
                      </Link>
                      <FunnelPreviewDialog
                        slug={funnel.slug}
                        name={funnel.name}
                        triggerLabel="Preview"
                        triggerClassName="hud-button-secondary px-3 py-1 text-xs"
                      />
                      <button
                        type="button"
                        onClick={() => handleDelete(funnel.funnel_id)}
                        disabled={deletingId === funnel.funnel_id}
                        className="hud-button-danger px-3 py-1 text-xs"
                      >
                        {deletingId === funnel.funnel_id ? 'Deleting...' : 'Delete'}
                      </button>
                    </div>
                  </article>
                ))}
              </div>

              <div className="hidden overflow-x-auto md:block">
                <table className="min-w-full text-sm">
                  <thead>
                    <tr className="border-b border-[var(--border-subtle)] text-left text-text-secondary">
                      <th className="px-3 py-2">Name</th>
                      <th className="px-3 py-2">Slug</th>
                      <th className="px-3 py-2">Status</th>
                      <th className="px-3 py-2">Updated</th>
                      <th className="px-3 py-2">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sortedFunnels.map((funnel) => (
                      <tr key={funnel.funnel_id} className="border-b border-[var(--border-subtle)] text-text-primary">
                        <td className="px-3 py-3 font-medium">{funnel.name}</td>
                        <td className="px-3 py-3 text-text-secondary">
                          <FunnelPreviewDialog
                            slug={funnel.slug}
                            name={funnel.name}
                            triggerLabel={`/${funnel.slug}`}
                            triggerClassName="text-sm text-rocket-400 hover:text-rocket-300"
                          />
                        </td>
                        <td className="px-3 py-3">
                          <span className="rounded-full border border-rocket-500/35 px-2 py-1 text-xs">{funnel.status || 'draft'}</span>
                        </td>
                        <td className="px-3 py-3 text-text-secondary">{new Date(funnel.updated_at || funnel.created_at || '').toLocaleString()}</td>
                        <td className="px-3 py-3">
                          <div className="flex gap-2">
                            <Link href={`/funnels/${funnel.funnel_id}`} className="hud-button-secondary px-3 py-1 text-xs">
                              Edit
                            </Link>
                            <FunnelPreviewDialog
                              slug={funnel.slug}
                              name={funnel.name}
                              triggerLabel="Preview"
                              triggerClassName="hud-button-secondary px-3 py-1 text-xs"
                            />
                            <button
                              type="button"
                              onClick={() => handleDelete(funnel.funnel_id)}
                              disabled={deletingId === funnel.funnel_id}
                              className="hud-button-danger px-3 py-1 text-xs"
                            >
                              {deletingId === funnel.funnel_id ? 'Deleting...' : 'Delete'}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </WorkspacePanel>
      </div>
    </main>
  )
}
