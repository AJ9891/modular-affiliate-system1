'use client'

import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import DashboardPanel from '@/components/cockpit/DashboardPanel'

const actions = [
  { label: 'Create Funnel', href: '/funnels' },
  { label: 'Open Analytics', href: '/analytics' },
  { label: 'Launch Email Campaign', href: '/email' },
  { label: 'Review Affiliates', href: '/affiliates' },
]

export default function QuickActionsPanel() {
  return (
    <DashboardPanel title="Quick Actions" description="Jump directly to the next operational step." expandable>
      <div className="space-y-2">
        {actions.map((action) => (
          <Link
            key={action.href}
            href={action.href}
            className="flex items-center justify-between rounded-lg border border-[var(--border-subtle)] px-3 py-2 text-sm text-text-secondary transition hover:border-[var(--border-focus)] hover:text-text-primary"
          >
            <span>{action.label}</span>
            <ArrowRight size={14} />
          </Link>
        ))}
      </div>
    </DashboardPanel>
  )
}
