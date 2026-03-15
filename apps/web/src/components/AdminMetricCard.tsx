export function AdminMetricCard({
  label,
  value,
  hint
}: {
  label: string
  value: string
  hint?: string
}) {
  return (
    <div className="glass-tile bg-white/5 border border-white/10 p-4 space-y-1">
      <p className="text-xs uppercase tracking-[0.2em] text-white/60">{label}</p>
      <p className="text-2xl font-semibold text-white">{value}</p>
      {hint && <p className="text-xs text-white/60">{hint}</p>}
    </div>
  )
}
