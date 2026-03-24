'use client'

import { useMemo, useState } from 'react'
import { useEffect } from 'react'
import { Users, Filter, Database } from 'lucide-react'
import { listSubscribers, type SubscriberLead } from '@/lib/api/subscribers'
import DashboardPanel from '@/components/cockpit/DashboardPanel'
import WorkspacePanel from '@/components/cockpit/WorkspacePanel'
import { CockpitEmptyState } from '@/components/ui/CockpitEmptyState'
import SubscribersSkeleton from './SubscribersSkeleton'

export default function SubscribersWorkspace() {
  const [subscribers, setSubscribers] = useState<SubscriberLead[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [query, setQuery] = useState('')
  const [sourceFilter, setSourceFilter] = useState('all')

  useEffect(() => {
    let active = true

    async function load() {
      try {
        setLoading(true)
        setError(null)
        const data = await listSubscribers(300)
        if (active) {
          setSubscribers(data)
        }
      } catch (err) {
        if (active) {
          setError(err instanceof Error ? err.message : 'Failed to load subscribers')
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

  const sources = useMemo(() => {
    const values = new Set<string>()
    subscribers.forEach((subscriber) => values.add(subscriber.source || subscriber.utm_source || 'direct'))
    return ['all', ...Array.from(values).sort()]
  }, [subscribers])

  const filtered = useMemo(() => {
    return subscribers.filter((subscriber) => {
      const source = subscriber.source || subscriber.utm_source || 'direct'
      const matchesSource = sourceFilter === 'all' || source === sourceFilter
      const lowerQuery = query.trim().toLowerCase()
      const matchesQuery =
        lowerQuery.length === 0 ||
        subscriber.email.toLowerCase().includes(lowerQuery) ||
        (subscriber.funnel_id || '').toLowerCase().includes(lowerQuery)

      return matchesSource && matchesQuery
    })
  }, [query, sourceFilter, subscribers])

  if (loading) {
    return <SubscribersSkeleton />
  }

  return (
    <main className="cockpit-shell page-cargo-bay py-8">
      <div className="cockpit-container max-w-7xl space-y-6">
        <section className="hud-panel">
          <p className="text-xs uppercase tracking-system text-text-secondary">Subscribers</p>
          <h1 className="text-3xl font-semibold text-text-primary md:text-4xl">Audience Contact Database</h1>
          <p className="mt-2 text-sm text-text-secondary">Scan acquisition sources, search records, and inspect funnel attribution.</p>
        </section>

        {error && <section className="rounded-lg border border-red-400/35 bg-red-500/12 p-4 text-red-200">{error}</section>}

        <section className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <DashboardPanel title="Total Contacts" icon={<Users size={16} />} value={subscribers.length.toLocaleString()} tone="info">
            <p className="text-xs text-text-secondary">Complete subscriber registry.</p>
          </DashboardPanel>
          <DashboardPanel title="Filtered Set" icon={<Filter size={16} />} value={filtered.length.toLocaleString()} tone="neutral">
            <p className="text-xs text-text-secondary">Matching current filter conditions.</p>
          </DashboardPanel>
          <DashboardPanel title="Source Channels" icon={<Database size={16} />} value={Math.max(0, sources.length - 1)} tone="warning">
            <p className="text-xs text-text-secondary">Distinct captured source identifiers.</p>
          </DashboardPanel>
        </section>

        <WorkspacePanel title="Audience Filters" description="Filter by source and search key for fast list scanning." expandable>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
            <input
              className="hud-input md:col-span-2"
              placeholder="Search by email or funnel id"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
            <select className="hud-select" value={sourceFilter} onChange={(event) => setSourceFilter(event.target.value)}>
              {sources.map((source) => (
                <option key={source} value={source}>
                  {source === 'all' ? 'All sources' : source}
                </option>
              ))}
            </select>
          </div>
        </WorkspacePanel>

        <WorkspacePanel title="Subscriber Registry" description="Operational table for captured contacts and source attribution." expandable>
          {subscribers.length === 0 ? (
            <CockpitEmptyState
              title="No subscribers captured yet"
              description="Subscriber records appear here after your funnels start collecting leads."
              primaryAction={{ label: 'Open Funnels', href: '/funnels' }}
              secondaryAction={{ label: 'Configure Email', href: '/email' }}
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="border-b border-[var(--border-subtle)] text-left text-text-secondary">
                    <th className="px-3 py-2">Email</th>
                    <th className="px-3 py-2">Source</th>
                    <th className="px-3 py-2">Funnel</th>
                    <th className="px-3 py-2">Captured</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.length === 0 ? (
                    <tr>
                      <td className="px-3 py-8 text-text-secondary" colSpan={4}>
                        No subscribers match these filters.
                      </td>
                    </tr>
                  ) : (
                    filtered.map((subscriber) => (
                      <tr key={subscriber.id} className="border-b border-[var(--border-subtle)] text-text-primary">
                        <td className="px-3 py-3 font-medium">{subscriber.email}</td>
                        <td className="px-3 py-3">{subscriber.source || subscriber.utm_source || 'direct'}</td>
                        <td className="px-3 py-3 text-text-secondary">{subscriber.funnel_id || '-'}</td>
                        <td className="px-3 py-3 text-text-secondary">{new Date(subscriber.created_at).toLocaleString()}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </WorkspacePanel>
      </div>
    </main>
  )
}
