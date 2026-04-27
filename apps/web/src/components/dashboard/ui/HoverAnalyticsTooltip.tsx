'use client'

import { CircleHelp } from 'lucide-react'
import { cn } from '@/lib/utils'

interface HoverAnalyticsTooltipProps {
  content: string
  label?: string
  className?: string
}

export default function HoverAnalyticsTooltip({
  content,
  label = 'Show metric context',
  className,
}: HoverAnalyticsTooltipProps) {
  return (
    <span className={cn('group relative inline-flex', className)}>
      <button
        type="button"
        className="inline-flex h-5 w-5 items-center justify-center rounded-full border border-[var(--border-subtle)] text-text-secondary transition hover:text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--border-focus)]"
        aria-label={label}
      >
        <CircleHelp size={12} />
      </button>
      <span
        role="tooltip"
        className="pointer-events-none absolute left-1/2 top-[calc(100%+8px)] z-20 w-56 -translate-x-1/2 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-surface)] px-3 py-2 text-left text-xs leading-relaxed text-text-secondary opacity-0 shadow-xl transition duration-150 group-hover:opacity-100 group-focus-within:opacity-100"
      >
        {content}
      </span>
    </span>
  )
}
