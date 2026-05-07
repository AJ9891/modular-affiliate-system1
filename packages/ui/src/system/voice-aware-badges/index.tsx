export type VoiceMode = 'voice' | 'silent' | 'listening' | 'muted'

interface VoiceAwareBadgeProps {
  mode: VoiceMode
  label?: string
}

const badgeStyles: Record<VoiceMode, string> = {
  voice: 'bg-blue-100 text-blue-800 border-blue-200',
  silent: 'bg-slate-100 text-slate-700 border-slate-200',
  listening: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  muted: 'bg-rose-100 text-rose-800 border-rose-200',
}

const defaultLabels: Record<VoiceMode, string> = {
  voice: 'Voice Ready',
  silent: 'Silent Mode',
  listening: 'Listening',
  muted: 'Muted',
}

export function VoiceAwareBadge({ mode, label }: VoiceAwareBadgeProps) {
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-medium ${badgeStyles[mode]}`}
    >
      {label ?? defaultLabels[mode]}
    </span>
  )
}
