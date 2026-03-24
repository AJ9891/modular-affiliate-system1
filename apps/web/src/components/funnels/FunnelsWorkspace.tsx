'use client'

import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'
import { createFunnel, deleteFunnel, listFunnels, type FunnelRecord } from '@/lib/api/funnels'
import FunnelsSkeleton from './FunnelsSkeleton'

export default function FunnelsWorkspace() {
  const [funnels, setFunnels] = useState<FunnelRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [showCreate, setShowCreate] = useState(false)
  const [name, setName] = useState('')
  const [template, setTemplate] = useState('lead_magnet')
  const [niche, setNiche] = useState('general')
  const [saving, setSaving] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)

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
    if (!name.trim()) {
      setError('Funnel name is required')
      return
    }

    try {
      setSaving(true)
      setError(null)
      const response = await createFunnel({
        name,
        template,
        niche,
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

  if (loading && funnels.length === 0) {
    return <FunnelsSkeleton />
  }

  return (
    <main className="cockpit-shell page-engineering-bay py-8">
      <div className="cockpit-container max-w-6xl space-y-6">
        <section className="hud-panel flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs uppercase tracking-system text-text-secondary">Funnels</p>
            <h1 className="text-3xl font-semibold text-text-primary md:text-4xl">Funnels Workspace</h1>
            <p className="mt-1 text-sm text-text-secondary">Create, edit, and publish your conversion funnels.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button type="button" className="hud-button-secondary px-4 py-2" onClick={() => setShowCreate((v) => !v)}>
              {showCreate ? 'Close' : 'Create Funnel'}
            </button>
            <Link href="/visual-builder" className="hud-button-primary px-4 py-2">
              Visual Builder
            </Link>
          </div>
        </section>

        {error && (
          <section className="rounded-lg border border-red-400/35 bg-red-500/12 p-4 text-red-200">
            {error}
          </section>
        )}

        {showCreate && (
          <section className="hud-card space-y-4">
            <h2 className="text-lg font-semibold text-text-primary">New Funnel</h2>
            <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
              <input
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="Funnel name"
                className="hud-input"
              />
              <select value={template} onChange={(event) => setTemplate(event.target.value)} className="hud-select">
                <option value="lead_magnet">Lead Magnet</option>
                <option value="product_launch">Product Launch</option>
                <option value="webinar">Webinar</option>
                <option value="affiliate_review">Affiliate Review</option>
                <option value="sales_page">Sales Page</option>
              </select>
              <input
                value={niche}
                onChange={(event) => setNiche(event.target.value)}
                placeholder="Niche"
                className="hud-input"
              />
            </div>
            <button type="button" disabled={saving} onClick={handleCreate} className="hud-button-primary px-4 py-2">
              {saving ? 'Creating...' : 'Save and Open'}
            </button>
          </section>
        )}

        <section className="hud-card">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-text-primary">Your Funnels</h2>
            <span className="text-sm text-text-secondary">{sortedFunnels.length} total</span>
          </div>

          {sortedFunnels.length === 0 ? (
            <div className="rounded-lg border border-[var(--border-subtle)] bg-[rgba(10,16,24,0.5)] p-8 text-center">
              <p className="text-text-secondary">No funnels yet. Create your first funnel to get started.</p>
            </div>
          ) : (
            <>
              <div className="space-y-3 md:hidden">
                {sortedFunnels.map((funnel) => (
                  <article
                    key={funnel.funnel_id}
                    className="rounded-lg border border-[var(--border-subtle)] bg-[rgba(10,16,24,0.5)] p-4"
                  >
                    <p className="text-base font-semibold text-text-primary">{funnel.name}</p>
                    <p className="mt-1 text-xs text-text-secondary">/{funnel.slug}</p>
                    <p className="mt-2 text-xs text-text-secondary">
                      Updated {new Date(funnel.updated_at || funnel.created_at || '').toLocaleString()}
                    </p>
                    <div className="mt-3 flex gap-2">
                      <Link href={`/funnels/${funnel.funnel_id}`} className="hud-button-secondary px-3 py-1 text-xs">
                        Edit
                      </Link>
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
                        <td className="px-3 py-3 text-text-secondary">/{funnel.slug}</td>
                        <td className="px-3 py-3">
                          <span className="rounded-full border border-rocket-500/35 px-2 py-1 text-xs">
                            {funnel.status || 'draft'}
                          </span>
                        </td>
                        <td className="px-3 py-3 text-text-secondary">
                          {new Date(funnel.updated_at || funnel.created_at || '').toLocaleString()}
                        </td>
                        <td className="px-3 py-3">
                          <div className="flex gap-2">
                            <Link href={`/funnels/${funnel.funnel_id}`} className="hud-button-secondary px-3 py-1 text-xs">
                              Edit
                            </Link>
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
        </section>
      </div>
    </main>
  )
}
