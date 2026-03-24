'use client'

import DashboardPanel from '@/components/cockpit/DashboardPanel'

interface SourcePoint {
  source: string
  count: number
}

export default function TrafficChartPanel({ sources }: { sources: SourcePoint[] }) {
  const maxCount = Math.max(...sources.map((source) => source.count), 1)

  return (
    <DashboardPanel
      title="Traffic Chart"
      description="Source distribution across tracked sessions."
      expandable
      contentClassName="space-y-3"
    >
      {sources.length === 0 ? (
        <p className="text-sm text-text-secondary">No traffic distribution yet. Share a tracked link to begin collection.</p>
      ) : (
        sources.slice(0, 6).map((source) => {
          const width = Math.max(6, Math.round((source.count / maxCount) * 100))
          return (
            <div key={source.source}>
              <div className="mb-1 flex items-center justify-between text-xs text-text-secondary">
                <span className="truncate">{source.source}</span>
                <span>{source.count.toLocaleString()}</span>
              </div>
              <div className="h-2 rounded-full bg-[rgba(10,16,24,0.65)]">
                <div className="h-2 rounded-full bg-gradient-to-r from-cyan-400 to-rocket-500" style={{ width: `${width}%` }} />
              </div>
            </div>
          )
        })
      )}
    </DashboardPanel>
  )
}
