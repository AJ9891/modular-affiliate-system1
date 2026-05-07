'use client'

import DashboardPanel from '@/components/cockpit/DashboardPanel'
import type { GrowthRecommendation } from '@/lib/growth-assistant/types'

const priorityClass: Record<GrowthRecommendation['priority'], string> = {
  critical: 'instrument-status-critical',
  high: 'instrument-status-caution',
  medium: 'instrument-status-info',
  low: 'border-[var(--border-subtle)] text-text-secondary',
}

export default function RecommendationsFeedPanel({ recommendations }: { recommendations: GrowthRecommendation[] }) {
  const items = recommendations.slice(0, 4)

  return (
    <DashboardPanel title="Recommendations" description="Prioritized actions to improve conversion performance." expandable>
      {items.length === 0 ? (
        <p className="text-sm text-text-secondary">No recommendations available.</p>
      ) : (
        <div className="space-y-2">
          {items.map((item) => (
            <article key={item.id} className={`rounded-lg border px-3 py-2 ${priorityClass[item.priority]}`}>
              <div className="flex items-center justify-between gap-2">
                <p className="text-sm font-medium">{item.title}</p>
                <span className="text-[10px] uppercase tracking-system">{item.priority}</span>
              </div>
              <p className="mt-1 text-xs text-text-secondary">{item.description}</p>
            </article>
          ))}
        </div>
      )}
    </DashboardPanel>
  )
}
