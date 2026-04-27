'use client'

import { Activity } from 'lucide-react'
import DashboardPanel from '@/components/cockpit/DashboardPanel'
import AnimatedNumber from '@/components/dashboard/ui/AnimatedNumber'

export default function VisitorsPanel({ visitors }: { visitors: number }) {
  return (
    <DashboardPanel
      title="Visitors Today"
      icon={<Activity size={16} />}
      value={<AnimatedNumber value={visitors} />}
      valueLabel="Tracked sessions"
      tone="info"
      tooltip="Total tracked sessions across your active funnels for the selected date window."
      expandable
    >
      <p className="text-sm text-text-secondary">Active traffic across all tracked funnels in the selected range.</p>
    </DashboardPanel>
  )
}
