'use client'

import { useState } from 'react'
import { ChevronDown, ChevronUp } from 'lucide-react'

interface SystemExplanationToggleProps {
  explanation: string
  label?: string
}

export default function SystemExplanationToggle({
  explanation,
  label = 'Why this exists',
}: SystemExplanationToggleProps) {
  const [open, setOpen] = useState(false)

  return (
    <div className="inline-flex flex-col items-end">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="inline-flex items-center gap-1 rounded-md border border-[var(--border-subtle)] px-2 py-1 text-xs text-text-secondary hover:text-text-primary"
        aria-expanded={open}
      >
        <span>{label}</span>
        {open ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
      </button>
      {open ? (
        <p className="mt-2 max-w-md rounded-md border border-cyan-300/30 bg-cyan-500/10 px-3 py-2 text-left text-xs text-cyan-100">
          {explanation}
        </p>
      ) : null}
    </div>
  )
}

