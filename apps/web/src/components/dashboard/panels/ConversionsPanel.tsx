'use client'

import { Goal } from 'lucide-react'
import DashboardPanel from '@/components/cockpit/DashboardPanel'

export default function ConversionsPanel({ conversions }: { conversions: number }) {
  return (
    <DashboardPanel
      title="Conversions"
      icon={<Goal size={16} />}
      value={conversions.toLocaleString()}
      valueLabel="Successful actions"
      tone="success"
      expandable
    >
      <p className="text-sm text-text-secondary">Conversion events captured from your active pages and campaigns.</p>
    </DashboardPanel>
  )
}
