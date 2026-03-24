'use client'

import DashboardPanel from '@/components/cockpit/DashboardPanel'

interface ActivityItem {
  type: string
  timestamp: string
  source?: string
  email?: string
  funnel?: string
}

export default function RecentActivityPanel({ items }: { items: ActivityItem[] }) {
  return (
    <DashboardPanel title="Recent Activity" description="Live event feed from your platform activity." expandable>
      {items.length === 0 ? (
        <p className="text-sm text-text-secondary">No events yet. Activity updates will appear here once traffic begins.</p>
      ) : (
        <div className="space-y-2">
          {items.slice(0, 6).map((item, index) => (
            <div key={`${item.timestamp}-${index}`} className="rounded-lg border border-[var(--border-subtle)] bg-[rgba(10,16,24,0.5)] px-3 py-2">
              <p className="text-sm font-medium text-text-primary">{item.type.replace('_', ' ')}</p>
              <p className="text-xs text-text-secondary">
                {new Date(item.timestamp).toLocaleString()} · {item.source || item.email || item.funnel || 'system'}
              </p>
            </div>
          ))}
        </div>
      )}
    </DashboardPanel>
  )
}
