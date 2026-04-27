'use client'

import { DollarSign } from 'lucide-react'
import DashboardPanel from '@/components/cockpit/DashboardPanel'
import AnimatedNumber from '@/components/dashboard/ui/AnimatedNumber'

function asCurrency(value: number) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(value)
}

export default function RevenuePanel({ revenue }: { revenue: number }) {
  return (
    <DashboardPanel
      title="Revenue"
      icon={<DollarSign size={16} />}
      value={<AnimatedNumber value={revenue} formatter={asCurrency} />}
      valueLabel="Gross tracked value"
      tone="success"
      tooltip="Estimated gross revenue attributed to tracked conversions and affiliate events in this range."
      expandable
    >
      <p className="text-sm text-text-secondary">Revenue estimate from funnel and affiliate conversion data.</p>
    </DashboardPanel>
  )
}
