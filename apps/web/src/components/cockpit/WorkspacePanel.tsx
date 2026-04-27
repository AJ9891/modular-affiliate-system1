'use client'

import { ReactNode, useState } from 'react'
import { ChevronDown, ChevronUp } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface WorkspacePanelProps {
  title: string
  titleAccessory?: ReactNode
  icon?: ReactNode
  description?: string
  actions?: ReactNode
  expandable?: boolean
  defaultExpanded?: boolean
  className?: string
  contentClassName?: string
  children: ReactNode
}

export default function WorkspacePanel({
  title,
  titleAccessory,
  icon,
  description,
  actions,
  expandable = false,
  defaultExpanded = true,
  className,
  contentClassName,
  children,
}: WorkspacePanelProps) {
  const [expanded, setExpanded] = useState(defaultExpanded)

  return (
    <section className={cn('hud-card', className)}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            {icon && <span className="text-text-secondary">{icon}</span>}
            <h2 className="text-base font-semibold text-text-primary md:text-lg">{title}</h2>
            {titleAccessory}
          </div>
          {description && <p className="mt-1 text-sm text-text-secondary">{description}</p>}
        </div>

        <div className="flex items-center gap-2">
          {actions}
          {expandable && (
            <button
              type="button"
              onClick={() => setExpanded((value) => !value)}
              className="rounded-lg border border-[var(--border-subtle)] px-2 py-1 text-xs text-text-secondary hover:text-text-primary"
              aria-expanded={expanded}
              aria-label={expanded ? `Collapse ${title}` : `Expand ${title}`}
            >
              {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            </button>
          )}
        </div>
      </div>

      {expanded && <div className={cn('mt-4', contentClassName)}>{children}</div>}
    </section>
  )
}
