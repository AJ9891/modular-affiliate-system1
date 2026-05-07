'use client'

import DashboardPanel from '@/components/cockpit/DashboardPanel'
import type { GrowthInsight } from '@/lib/growth-assistant/types'

function toneFromSeverity(severity: GrowthInsight['severity']) {
  if (severity === 'critical' || severity === 'high') return 'warning'
  if (severity === 'medium') return 'info'
  return 'neutral'
}

export default function InsightsPanel({ insights }: { insights: GrowthInsight[] }) {
  const items = insights.slice(0, 4)

  return (
    <DashboardPanel title="Insights" description="Automatically generated funnel and page diagnostics." expandable>
      {items.length === 0 ? (
        <p className="text-sm text-text-secondary">No insights generated for the current range.</p>
      ) : (
        <div className="space-y-2">
          {items.map((item) => (
            <article
              key={item.id}
              className={`rounded-lg border px-3 py-2 ${
                toneFromSeverity(item.severity) === 'warning'
                  ? 'instrument-status-caution'
                  : toneFromSeverity(item.severity) === 'info'
                    ? 'instrument-status-info'
                    : 'border-[var(--border-subtle)]'
              }`}
            >
              <p className="text-sm font-medium text-text-primary">{item.title}</p>
              <p className="mt-1 text-xs text-text-secondary">{item.description}</p>
            </article>
          ))}
        </div>
      )}
    </DashboardPanel>
  )
}
