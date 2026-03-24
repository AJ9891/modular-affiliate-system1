'use client'

import { ReactNode } from 'react'
import WorkspacePanel, { WorkspacePanelProps } from './WorkspacePanel'
import { cn } from '@/lib/utils'

type DashboardTone = 'neutral' | 'success' | 'info' | 'warning'

interface DashboardPanelProps extends Omit<WorkspacePanelProps, 'className'> {
  tone?: DashboardTone
  className?: string
  value?: ReactNode
  valueLabel?: string
}

const toneClassMap: Record<DashboardTone, string> = {
  neutral: 'border-[var(--border-elevated)]',
  success: 'border-emerald-400/35',
  info: 'border-cyan-400/35',
  warning: 'border-amber-400/35',
}

export default function DashboardPanel({
  tone = 'neutral',
  className,
  value,
  valueLabel,
  children,
  ...rest
}: DashboardPanelProps) {
  return (
    <WorkspacePanel
      {...rest}
      className={cn('transition-[border-color,transform] duration-200 hover:-translate-y-0.5', toneClassMap[tone], className)}
    >
      {value !== undefined && (
        <div className="mb-4">
          <p className="text-3xl font-semibold leading-tight text-text-primary">{value}</p>
          {valueLabel && <p className="mt-1 text-xs uppercase tracking-system text-text-secondary">{valueLabel}</p>}
        </div>
      )}
      {children}
    </WorkspacePanel>
  )
}
