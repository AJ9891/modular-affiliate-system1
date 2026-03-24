'use client'

import { Users } from 'lucide-react'
import DashboardPanel from '@/components/cockpit/DashboardPanel'

export default function SubscribersPanel({ subscribers }: { subscribers: number }) {
  return (
    <DashboardPanel
      title="Subscribers"
      icon={<Users size={16} />}
      value={subscribers.toLocaleString()}
      valueLabel="Lead captures"
      tone="neutral"
      expandable
    >
      <p className="text-sm text-text-secondary">Subscribers acquired via forms, campaigns, and automation flows.</p>
    </DashboardPanel>
  )
}
