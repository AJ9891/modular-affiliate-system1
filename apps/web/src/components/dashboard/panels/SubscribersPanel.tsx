'use client'

import { Users } from 'lucide-react'
import DashboardPanel from '@/components/cockpit/DashboardPanel'
import AnimatedNumber from '@/components/dashboard/ui/AnimatedNumber'

export default function SubscribersPanel({ subscribers }: { subscribers: number }) {
  return (
    <DashboardPanel
      title="Subscribers"
      icon={<Users size={16} />}
      value={<AnimatedNumber value={subscribers} />}
      valueLabel="Lead captures"
      tone="neutral"
      tooltip="New subscriber records captured from forms, sequences, and funnel lead magnets."
      expandable
    >
      <p className="text-sm text-text-secondary">Subscribers acquired via forms, campaigns, and automation flows.</p>
    </DashboardPanel>
  )
}
