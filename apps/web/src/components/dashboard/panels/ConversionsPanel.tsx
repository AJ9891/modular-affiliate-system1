'use client'

import { Goal } from 'lucide-react'
import DashboardPanel from '@/components/cockpit/DashboardPanel'
import AnimatedNumber from '@/components/dashboard/ui/AnimatedNumber'

export default function ConversionsPanel({ conversions }: { conversions: number }) {
  return (
    <DashboardPanel
      title="Conversions"
      icon={<Goal size={16} />}
      value={<AnimatedNumber value={conversions} />}
      valueLabel="Successful actions"
      tone="success"
      tooltip="All conversion events captured from funnels, forms, and campaign actions in the selected range."
      expandable
    >
      <p className="text-sm text-text-secondary">Conversion events captured from your active pages and campaigns.</p>
    </DashboardPanel>
  )
}
