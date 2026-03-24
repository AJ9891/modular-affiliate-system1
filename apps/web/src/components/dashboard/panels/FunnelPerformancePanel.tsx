'use client'

import DashboardPanel from '@/components/cockpit/DashboardPanel'

interface FunnelPerformancePanelProps {
  funnels: number
  clicks: number
  conversions: number
  conversionRate: number
}

export default function FunnelPerformancePanel({
  funnels,
  clicks,
  conversions,
  conversionRate,
}: FunnelPerformancePanelProps) {
  return (
    <DashboardPanel
      title="Funnel Performance"
      description="Quick conversion health across live funnels."
      expandable
      tone="info"
    >
      <div className="space-y-2 text-sm">
        <div className="flex items-center justify-between rounded-lg border border-[var(--border-subtle)] px-3 py-2">
          <span className="text-text-secondary">Active Funnels</span>
          <span className="font-medium text-text-primary">{funnels.toLocaleString()}</span>
        </div>
        <div className="flex items-center justify-between rounded-lg border border-[var(--border-subtle)] px-3 py-2">
          <span className="text-text-secondary">Total Clicks</span>
          <span className="font-medium text-text-primary">{clicks.toLocaleString()}</span>
        </div>
        <div className="flex items-center justify-between rounded-lg border border-[var(--border-subtle)] px-3 py-2">
          <span className="text-text-secondary">Conversions</span>
          <span className="font-medium text-text-primary">{conversions.toLocaleString()}</span>
        </div>
        <div className="flex items-center justify-between rounded-lg border border-[var(--border-subtle)] px-3 py-2">
          <span className="text-text-secondary">Conversion Rate</span>
          <span className="font-medium text-text-primary">{conversionRate.toFixed(2)}%</span>
        </div>
      </div>
    </DashboardPanel>
  )
}
