'use client'

import { ReactNode } from 'react'
import WorkspacePanel, { WorkspacePanelProps } from './WorkspacePanel'
import { cn } from '@/lib/utils'
import HoverAnalyticsTooltip from '@/components/dashboard/ui/HoverAnalyticsTooltip'

type DashboardTone = 'neutral' | 'success' | 'info' | 'warning'

interface DashboardPanelProps extends Omit<WorkspacePanelProps, 'className'> {
  tone?: DashboardTone
  className?: string
  value?: ReactNode
  valueLabel?: string
  tooltip?: string
}

const toneClassMap: Record<DashboardTone, string> = {
  neutral: 'border-[var(--border-elevated)]',
  success: 'border-[color:var(--status-ok-border)]',
  info: 'border-[color:var(--status-info-border)]',
  warning: 'border-[color:var(--status-caution-border)]',
}

export default function DashboardPanel({
  tone = 'neutral',
  className,
  value,
  valueLabel,
  tooltip,
  children,
  ...rest
}: DashboardPanelProps) {
  return (
    <WorkspacePanel
      {...rest}
      titleAccessory={tooltip ? <HoverAnalyticsTooltip content={tooltip} /> : undefined}
      className={cn('transition-[border-color,background-color] duration-200 hover:bg-[color:var(--bg-surface)]', toneClassMap[tone], className)}
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
