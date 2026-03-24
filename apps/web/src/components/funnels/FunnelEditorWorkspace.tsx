'use client'

import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'
import EnhancedFunnelBuilder from '@/components/EnhancedFunnelBuilder'
import { getFunnelById, type FunnelRecord } from '@/lib/api/funnels'

interface FunnelEditorWorkspaceProps {
  id: string
}

function parseBlocks(blocks: FunnelRecord['blocks']) {
  if (!blocks) return null
  if (typeof blocks === 'string') {
    try {
      return JSON.parse(blocks) as Record<string, unknown>
    } catch {
      return null
    }
  }
  return blocks as Record<string, unknown>
}

export default function FunnelEditorWorkspace({ id }: FunnelEditorWorkspaceProps) {
  const [funnel, setFunnel] = useState<FunnelRecord | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let active = true

    async function loadFunnel() {
      try {
        setLoading(true)
        setError(null)
        const data = await getFunnelById(id)
        if (active) {
          setFunnel(data)
        }
      } catch (err) {
        if (active) {
          setError(err instanceof Error ? err.message : 'Failed to load funnel')
        }
      } finally {
        if (active) {
          setLoading(false)
        }
      }
    }

    loadFunnel()

    return () => {
      active = false
    }
  }, [id])

  const niche = useMemo(() => {
    const blocks = parseBlocks(funnel?.blocks)
    const value = blocks?.niche
    return typeof value === 'string' && value.length > 0 ? value : 'general'
  }, [funnel?.blocks])

  if (loading) {
    return (
      <div className="cockpit-shell page-engineering-bay flex min-h-screen items-center justify-center">
        <div className="text-center text-text-secondary">
          <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-b-2 border-rocket-500" />
          Loading funnel editor...
        </div>
      </div>
    )
  }

  if (error || !funnel) {
    return (
      <div className="cockpit-shell page-engineering-bay flex min-h-screen items-center justify-center px-4">
        <div className="hud-card max-w-xl text-center">
          <h1 className="text-2xl font-semibold text-text-primary">Funnel unavailable</h1>
          <p className="mt-2 text-text-secondary">{error || 'Unable to load this funnel.'}</p>
          <Link href="/funnels" className="hud-button-secondary mt-4 inline-block px-4 py-2">
            Back to funnels
          </Link>
        </div>
      </div>
    )
  }

  return (
    <main className="theme-engineering min-h-screen">
      <div className="px-6 py-5 md:px-10">
        <div className="mb-1 flex items-center justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-text-secondary">Funnel Editor</p>
            <h1 className="text-2xl font-semibold text-text-primary">{funnel.name}</h1>
            <p className="text-sm text-text-secondary">/{funnel.slug}</p>
          </div>
          <Link href="/funnels" className="hud-button-secondary px-4 py-2 text-sm">
            Back to funnels
          </Link>
        </div>
      </div>
      <EnhancedFunnelBuilder initialNiche={niche} funnelId={funnel.funnel_id} />
    </main>
  )
}
