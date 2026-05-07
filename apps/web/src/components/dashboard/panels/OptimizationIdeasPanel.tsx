'use client'

import DashboardPanel from '@/components/cockpit/DashboardPanel'
import type { FunnelOptimizationIdea } from '@/lib/growth-assistant/types'

const priorityClass: Record<FunnelOptimizationIdea['priority'], string> = {
  critical: 'instrument-status-critical',
  high: 'instrument-status-caution',
  medium: 'instrument-status-info',
  low: 'border-[var(--border-subtle)] text-text-secondary',
}

export default function OptimizationIdeasPanel({ ideas }: { ideas: FunnelOptimizationIdea[] }) {
  const items = ideas.slice(0, 4)

  return (
    <DashboardPanel title="Auto Funnel Optimization" description="System-generated actions prioritized by impact." expandable>
      {items.length === 0 ? (
        <p className="text-sm text-text-secondary">No optimization ideas queued.</p>
      ) : (
        <div className="space-y-2">
          {items.map((item) => (
            <article key={item.id} className={`rounded-lg border px-3 py-2 ${priorityClass[item.priority]}`}>
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="text-sm font-medium">{item.title}</p>
                <span className="text-[10px] uppercase tracking-system">
                  {item.priority} • {item.effort} effort
                </span>
              </div>
              <p className="mt-1 text-xs text-text-secondary">{item.description}</p>
              {item.actions.length > 0 && (
                <p className="mt-2 text-[11px] text-text-secondary">Actions: {item.actions.slice(0, 2).join(' • ')}</p>
              )}
            </article>
          ))}
        </div>
      )}
    </DashboardPanel>
  )
}
