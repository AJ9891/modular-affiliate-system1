'use client'

import DashboardPanel from '@/components/cockpit/DashboardPanel'

function asCurrency(value: number) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(value)
}

interface AffiliateEarningsPanelProps {
  revenue: number
  conversionRate: number
}

export default function AffiliateEarningsPanel({ revenue, conversionRate }: AffiliateEarningsPanelProps) {
  const estimatedCommission = revenue * 0.2
  const estimatedPayoutHealth = conversionRate >= 2 ? 'Stable' : 'Needs optimization'

  return (
    <DashboardPanel title="Affiliate Earnings" description="Estimated payout performance snapshot." tone="warning" expandable>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <div className="rounded-lg border border-[var(--border-subtle)] px-3 py-2">
          <p className="text-xs uppercase tracking-system text-text-secondary">Gross Revenue</p>
          <p className="mt-1 text-lg font-semibold text-text-primary">{asCurrency(revenue)}</p>
        </div>
        <div className="rounded-lg border border-[var(--border-subtle)] px-3 py-2">
          <p className="text-xs uppercase tracking-system text-text-secondary">Est. Commissions</p>
          <p className="mt-1 text-lg font-semibold text-text-primary">{asCurrency(estimatedCommission)}</p>
        </div>
        <div className="rounded-lg border border-[var(--border-subtle)] px-3 py-2">
          <p className="text-xs uppercase tracking-system text-text-secondary">Payout Signal</p>
          <p className="mt-1 text-lg font-semibold text-text-primary">{estimatedPayoutHealth}</p>
        </div>
      </div>
    </DashboardPanel>
  )
}
