'use client'

import DashboardPanel from '@/components/cockpit/DashboardPanel'
import type { GrowthAlert } from '@/lib/growth-assistant/types'

const severityStyle: Record<GrowthAlert['severity'], string> = {
  critical: 'border-red-400/45 text-red-100',
  high: 'border-amber-400/45 text-amber-100',
  medium: 'border-cyan-400/35 text-cyan-100',
  low: 'border-[var(--border-subtle)] text-text-secondary',
}

export default function AlertsPanel({ alerts }: { alerts: GrowthAlert[] }) {
  const items = alerts.slice(0, 5)

  return (
    <DashboardPanel title="Alerts" description="Real-time warning signals for sudden performance shifts." expandable tone={items.length > 0 ? 'warning' : 'neutral'}>
      {items.length === 0 ? (
        <p className="text-sm text-text-secondary">No active alerts.</p>
      ) : (
        <div className="space-y-2">
          {items.map((item) => (
            <article key={item.id} className={`rounded-lg border px-3 py-2 ${severityStyle[item.severity]}`}>
              <div className="flex items-center justify-between gap-2">
                <p className="text-sm font-medium">{item.title}</p>
                <span className="text-[10px] uppercase tracking-system">{item.severity}</span>
              </div>
              <p className="mt-1 text-xs text-text-secondary">{item.message}</p>
            </article>
          ))}
        </div>
      )}
    </DashboardPanel>
  )
}
