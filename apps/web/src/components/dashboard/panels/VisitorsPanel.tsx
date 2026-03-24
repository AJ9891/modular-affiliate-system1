'use client'

import { Activity } from 'lucide-react'
import DashboardPanel from '@/components/cockpit/DashboardPanel'

export default function VisitorsPanel({ visitors }: { visitors: number }) {
  return (
    <DashboardPanel
      title="Visitors Today"
      icon={<Activity size={16} />}
      value={visitors.toLocaleString()}
      valueLabel="Tracked sessions"
      tone="info"
      expandable
    >
      <p className="text-sm text-text-secondary">Active traffic across all tracked funnels in the selected range.</p>
    </DashboardPanel>
  )
}
