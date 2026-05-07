export type TemplateRiskLevel = 'low' | 'medium' | 'high' | 'critical'

interface TemplateRiskIndicatorProps {
  level: TemplateRiskLevel
  score?: number
  reason?: string
}

const levelClasses: Record<TemplateRiskLevel, string> = {
  low: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  medium: 'bg-amber-100 text-amber-800 border-amber-200',
  high: 'bg-orange-100 text-orange-800 border-orange-200',
  critical: 'bg-rose-100 text-rose-800 border-rose-200',
}

const levelLabel: Record<TemplateRiskLevel, string> = {
  low: 'Low Risk',
  medium: 'Medium Risk',
  high: 'High Risk',
  critical: 'Critical Risk',
}

export function TemplateRiskIndicator({
  level,
  score,
  reason,
}: TemplateRiskIndicatorProps) {
  return (
    <div className={`rounded-md border px-3 py-2 text-sm ${levelClasses[level]}`}>
      <div className="flex items-center justify-between gap-3">
        <span className="font-semibold">{levelLabel[level]}</span>
        {typeof score === 'number' ? <span className="font-mono">{score}</span> : null}
      </div>
      {reason ? <p className="mt-1 text-xs">{reason}</p> : null}
    </div>
  )
}
