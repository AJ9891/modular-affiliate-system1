'use client'

import DashboardPanel from '@/components/cockpit/DashboardPanel'
import type { ABTestSuggestion } from '@/lib/growth-assistant/types'

const sourceClass: Record<ABTestSuggestion['source'], string> = {
  ai: 'border-emerald-400/35 text-emerald-100',
  rule_engine: 'border-cyan-400/35 text-cyan-100',
}

const objectiveLabel: Record<ABTestSuggestion['objective'], string> = {
  ctr: 'CTR',
  conversion_rate: 'Conversion Rate',
  lead_rate: 'Lead Rate',
  bounce_rate: 'Bounce Rate',
}

export default function ABTestSuggestionsPanel({ suggestions }: { suggestions: ABTestSuggestion[] }) {
  const items = suggestions.slice(0, 3)

  return (
    <DashboardPanel title="AI A/B Tests" description="Generated hypotheses and variants to validate quickly." expandable>
      {items.length === 0 ? (
        <p className="text-sm text-text-secondary">No A/B test suggestions available for the current range.</p>
      ) : (
        <div className="space-y-3">
          {items.map((item) => (
            <article key={item.id} className="rounded-lg border border-[var(--border-subtle)] px-3 py-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="text-sm font-medium text-text-primary">{item.title}</p>
                <div className="flex items-center gap-2">
                  <span className="rounded-full border border-[var(--border-subtle)] px-2 py-0.5 text-[10px] uppercase tracking-system text-text-secondary">
                    {objectiveLabel[item.objective]}
                  </span>
                  <span className={`rounded-full border px-2 py-0.5 text-[10px] uppercase tracking-system ${sourceClass[item.source]}`}>
                    {item.source === 'ai' ? 'AI' : 'Rules'}
                  </span>
                </div>
              </div>
              <p className="mt-1 text-xs text-text-secondary">{item.hypothesis}</p>
              <div className="mt-2 grid grid-cols-1 gap-2 md:grid-cols-2">
                <div className="rounded-md border border-[var(--border-subtle)] px-2 py-2">
                  <p className="text-[11px] font-semibold uppercase tracking-system text-text-primary">{item.variantA.name}</p>
                  <p className="mt-1 text-[11px] text-text-secondary">{item.variantA.changes.slice(0, 2).join(' • ')}</p>
                </div>
                <div className="rounded-md border border-[var(--border-subtle)] px-2 py-2">
                  <p className="text-[11px] font-semibold uppercase tracking-system text-text-primary">{item.variantB.name}</p>
                  <p className="mt-1 text-[11px] text-text-secondary">{item.variantB.changes.slice(0, 2).join(' • ')}</p>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </DashboardPanel>
  )
}
