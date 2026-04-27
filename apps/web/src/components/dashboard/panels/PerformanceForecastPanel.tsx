'use client'

import DashboardPanel from '@/components/cockpit/DashboardPanel'
import type { PerformanceForecast } from '@/lib/growth-assistant/types'

const currency = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' })

export default function PerformanceForecastPanel({ forecasts }: { forecasts: PerformanceForecast[] }) {
  const items = forecasts.slice(0, 4)

  return (
    <DashboardPanel title="Predictive Forecasts" description="Projected 7-day click, conversion, and revenue performance." expandable>
      {items.length === 0 ? (
        <p className="text-sm text-text-secondary">No forecasts available yet.</p>
      ) : (
        <div className="space-y-2">
          {items.map((item) => {
            const conversionDecline = item.predictedConversionRate < item.baselineConversionRate
            return (
              <article key={item.id} className="rounded-lg border border-[var(--border-subtle)] px-3 py-2">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="text-sm font-medium text-text-primary">{item.funnelName}</p>
                  <span
                    className={`rounded-full border px-2 py-0.5 text-[10px] uppercase tracking-system ${
                      conversionDecline ? 'border-amber-400/35 text-amber-100' : 'border-emerald-400/35 text-emerald-100'
                    }`}
                  >
                    {conversionDecline ? 'At Risk' : 'Stable'}
                  </span>
                </div>
                <p className="mt-1 text-xs text-text-secondary">
                  Conversion {item.baselineConversionRate.toFixed(2)}% → {item.predictedConversionRate.toFixed(2)}% • Revenue {currency.format(item.baselineRevenue)} → {currency.format(item.predictedRevenue)}
                </p>
                <p className="mt-1 text-[11px] text-text-secondary">Confidence {Math.round(item.confidence * 100)}% • Horizon {item.horizon}</p>
              </article>
            )
          })}
        </div>
      )}
    </DashboardPanel>
  )
}
