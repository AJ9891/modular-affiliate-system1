'use client'

import DashboardPanel from '@/components/cockpit/DashboardPanel'
import type { WeeklyPerformanceSummary } from '@/lib/growth-assistant/types'

const currency = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' })

export default function WeeklySummaryReportPanel({ summary }: { summary: WeeklyPerformanceSummary | null }) {
  if (!summary) {
    return (
      <DashboardPanel title="Weekly Performance Report" description="Weekly summary report generated from growth signals." expandable>
        <p className="text-sm text-text-secondary">No weekly summary available yet.</p>
      </DashboardPanel>
    )
  }

  return (
    <DashboardPanel title="Weekly Performance Report" description="Weekly summary report generated from growth signals." expandable>
      <div className="space-y-3">
        <div>
          <p className="text-sm font-semibold text-text-primary">{summary.headline}</p>
          <p className="mt-1 text-xs text-text-secondary">{summary.summary}</p>
          <p className="mt-1 text-[11px] text-text-secondary">
            Period {new Date(summary.weekStart).toLocaleDateString()} to {new Date(summary.weekEnd).toLocaleDateString()}
            {summary.projectedFromRange ? ` • projected from ${summary.sourceRangeDays}d` : ''}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-2 text-xs md:grid-cols-4">
          <div className="rounded-md border border-[var(--border-subtle)] px-2 py-2">
            <p className="text-text-secondary">Clicks</p>
            <p className="font-semibold text-text-primary">{summary.totals.clicks.toLocaleString()}</p>
          </div>
          <div className="rounded-md border border-[var(--border-subtle)] px-2 py-2">
            <p className="text-text-secondary">Conversions</p>
            <p className="font-semibold text-text-primary">{summary.totals.conversions.toLocaleString()}</p>
          </div>
          <div className="rounded-md border border-[var(--border-subtle)] px-2 py-2">
            <p className="text-text-secondary">Conv Rate</p>
            <p className="font-semibold text-text-primary">{summary.totals.conversionRate.toFixed(2)}%</p>
          </div>
          <div className="rounded-md border border-[var(--border-subtle)] px-2 py-2">
            <p className="text-text-secondary">Revenue</p>
            <p className="font-semibold text-text-primary">{currency.format(summary.totals.revenue)}</p>
          </div>
        </div>

        {summary.keyWins.length > 0 && (
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-system text-emerald-100">Key Wins</p>
            {summary.keyWins.slice(0, 3).map((item, index) => (
              <p key={`win-${index}`} className="mt-1 text-xs text-text-secondary">• {item}</p>
            ))}
          </div>
        )}

        {summary.watchouts.length > 0 && (
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-system text-amber-100">Watchouts</p>
            {summary.watchouts.slice(0, 3).map((item, index) => (
              <p key={`watchout-${index}`} className="mt-1 text-xs text-text-secondary">• {item}</p>
            ))}
          </div>
        )}
      </div>
    </DashboardPanel>
  )
}
