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
  compact = false,
}: CockpitEmptyStateProps) {
  return (
    <div
      className={`rounded-xl border border-dashed border-[var(--border-elevated)] bg-[rgba(10,16,24,0.42)] text-center ${
        compact ? 'px-5 py-6' : 'px-7 py-10'
      }`}
    >
      {icon && <div className="mb-3 flex items-center justify-center text-text-secondary">{icon}</div>}
      <h3 className="text-lg font-semibold text-text-primary">{title}</h3>
      <p className="mx-auto mt-2 max-w-xl text-sm text-text-secondary">{description}</p>
      {(primaryAction || secondaryAction) && (
        <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
          {primaryAction && <ActionButton action={primaryAction} primary />}
          {secondaryAction && <ActionButton action={secondaryAction} />}
        </div>
      )}
    </div>
  )
}
