import { ReactNode } from 'react'

export type ExplanationTone = 'neutral' | 'supportive' | 'assertive'

interface AIExplanationShellProps {
  title: string
  summary: string
  tone?: ExplanationTone
  confidence?: number
  children?: ReactNode
}

const toneClasses: Record<ExplanationTone, string> = {
  neutral: 'border-slate-300 bg-slate-50',
  supportive: 'border-emerald-300 bg-emerald-50',
  assertive: 'border-amber-300 bg-amber-50',
}

export function AIExplanationShell({
  title,
  summary,
  tone = 'neutral',
  confidence,
  children,
}: AIExplanationShellProps) {
  return (
    <section className={`rounded-lg border p-4 ${toneClasses[tone]}`}>
      <header className="mb-3 flex items-start justify-between gap-4">
        <div>
          <h3 className="text-sm font-semibold text-slate-900">{title}</h3>
          <p className="mt-1 text-sm text-slate-700">{summary}</p>
        </div>
        {typeof confidence === 'number' ? (
          <span className="rounded-full bg-white px-2 py-1 text-xs font-medium text-slate-700">
            {Math.round(confidence)}% confidence
          </span>
        ) : null}
      </header>
      {children ? <div className="text-sm text-slate-800">{children}</div> : null}
    </section>
  )
}

interface AIExplanationListProps {
  items: Array<{
    id: string
    label: string
    value: string
  }>
}

export function AIExplanationList({ items }: AIExplanationListProps) {
  return (
    <ul className="space-y-2">
      {items.map((item) => (
        <li key={item.id} className="rounded border border-slate-200 bg-white px-3 py-2">
          <p className="text-xs uppercase tracking-wide text-slate-500">{item.label}</p>
          <p className="text-sm text-slate-800">{item.value}</p>
        </li>
      ))}
    </ul>
  )
}
