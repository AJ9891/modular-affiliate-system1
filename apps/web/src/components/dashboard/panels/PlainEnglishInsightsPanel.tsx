'use client'

import DashboardPanel from '@/components/cockpit/DashboardPanel'
import type { PlainEnglishInsight } from '@/lib/growth-assistant/types'

function severityClass(severity: PlainEnglishInsight['severity']) {
  if (severity === 'critical') return 'instrument-status-critical'
  if (severity === 'high') return 'instrument-status-caution'
  if (severity === 'medium') return 'instrument-status-info'
  return 'border-[var(--border-subtle)]'
}

export default function PlainEnglishInsightsPanel({ insights }: { insights: PlainEnglishInsight[] }) {
  const items = insights.slice(0, 4)

  return (
    <DashboardPanel title="Plain English Insights" description="Natural-language explanations with practical next steps." expandable>
      {items.length === 0 ? (
        <p className="text-sm text-text-secondary">No plain-English insights available.</p>
      ) : (
        <div className="space-y-2">
          {items.map((item) => (
            <article key={item.id} className={`rounded-lg border px-3 py-2 ${severityClass(item.severity)}`}>
              <p className="text-sm font-medium text-text-primary">{item.title}</p>
              <p className="mt-1 text-xs text-text-secondary">{item.explanation}</p>
              <p className="mt-2 text-[11px] text-text-secondary">Why it matters: {item.whyItMatters}</p>
              <p className="mt-1 text-[11px] text-text-secondary">Next step: {item.nextStep}</p>
            </article>
          ))}
        </div>
      )}
    </DashboardPanel>
  )
}
