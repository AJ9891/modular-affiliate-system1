'use client'

import { DollarSign } from 'lucide-react'
import DashboardPanel from '@/components/cockpit/DashboardPanel'

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
      value={asCurrency(revenue)}
      valueLabel="Gross tracked value"
      tone="success"
      expandable
    >
      <p className="text-sm text-text-secondary">Revenue estimate from funnel and affiliate conversion data.</p>
    </DashboardPanel>
  )
}
