'use client'

import Link from 'next/link'
import type { ReactNode } from 'react'

interface CockpitAction {
  label: string
  href?: string
  onClick?: () => void
}

interface CockpitEmptyStateProps {
  title: string
  description: string
  icon?: ReactNode
  primaryAction?: CockpitAction
  secondaryAction?: CockpitAction
  tips?: string[]
  tone?: 'neutral' | 'info' | 'warning' | 'success'
  compact?: boolean
}

function ActionButton({ action, primary }: { action: CockpitAction; primary?: boolean }) {
  const classes = primary ? 'hud-button-primary px-4 py-2' : 'hud-button-secondary px-4 py-2'

  if (action.href) {
    return (
      <Link href={action.href} className={classes}>
        {action.label}
      </Link>
    )
  }

  return (
    <button type="button" onClick={action.onClick} className={classes}>
      {action.label}
    </button>
  )
}

export function CockpitEmptyState({
  title,
  description,
  icon,
  primaryAction,
  secondaryAction,
  tips = [],
  tone = 'neutral',
  compact = false,
}: CockpitEmptyStateProps) {
  const toneClass =
    tone === 'info'
      ? 'border-cyan-400/35 bg-cyan-500/8'
      : tone === 'warning'
        ? 'border-amber-400/35 bg-amber-500/8'
        : tone === 'success'
          ? 'border-emerald-400/35 bg-emerald-500/8'
          : 'border-[var(--border-elevated)] bg-[rgba(10,16,24,0.42)]'

  return (
    <div
      className={`rounded-xl border border-dashed text-center ${
        toneClass
      } ${
        compact ? 'px-5 py-6' : 'px-7 py-10'
      }`}
    >
      {icon && <div className="mb-3 flex items-center justify-center text-text-secondary">{icon}</div>}
      <h3 className="text-lg font-semibold text-text-primary">{title}</h3>
      <p className="mx-auto mt-2 max-w-xl text-sm text-text-secondary">{description}</p>
      {tips.length > 0 && (
        <div className="mx-auto mt-4 max-w-xl space-y-1 text-left">
          {tips.slice(0, 3).map((tip) => (
            <p key={tip} className="text-xs text-text-secondary">
              • {tip}
            </p>
          ))}
        </div>
      )}
      {(primaryAction || secondaryAction) && (
        <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
          {primaryAction && <ActionButton action={primaryAction} primary />}
          {secondaryAction && <ActionButton action={secondaryAction} />}
        </div>
      )}
    </div>
  )
}
