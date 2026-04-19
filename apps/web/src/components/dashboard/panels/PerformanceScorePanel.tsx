'use client'

import DashboardPanel from '@/components/cockpit/DashboardPanel'
import type { FunnelPerformanceScore } from '@/lib/growth-assistant/types'

export default function PerformanceScorePanel({ scores }: { scores: FunnelPerformanceScore[] }) {
  if (scores.length === 0) {
    return (
      <DashboardPanel
        title="Performance Score"
        description="Composite health score using conversion, engagement, and CTR."
        expandable
      >
        <p className="text-sm text-text-secondary">No score data available yet.</p>
      </DashboardPanel>
    )
  }

  const avg = scores.reduce((sum, item) => sum + item.score, 0) / scores.length
  const top = [...scores].sort((a, b) => b.score - a.score).slice(0, 3)

  return (
    <DashboardPanel
      title="Performance Score"
      description="Composite health score using conversion, engagement, and CTR."
      value={avg.toFixed(1)}
      valueLabel="Average Score"
      tone={avg < 45 ? 'warning' : 'success'}
      expandable
    >
      <div className="space-y-2 text-sm">
        {top.map((item) => (
          <div key={item.funnelId} className="rounded-lg border border-[var(--border-subtle)] px-3 py-2">
            <div className="flex items-center justify-between">
              <span className="text-text-primary">{item.funnelName}</span>
              <span className="font-semibold text-text-primary">{item.score.toFixed(1)}</span>
            </div>
            <p className="mt-1 text-xs text-text-secondary">
              Conv {item.conversionRate.toFixed(2)}% • Engage {item.engagementRate.toFixed(2)}% • CTR {item.ctr.toFixed(2)}%
            </p>
          </div>
        ))}
      </div>
    </DashboardPanel>
  )
}
