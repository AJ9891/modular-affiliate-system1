'use client'

interface WorkspaceLoadingStateProps {
  shellClassName: string
  sectionLabel: string
  titleWidthClass?: string
  cardCount?: number
  panelCount?: number
  message: string
}

export default function WorkspaceLoadingState({
  shellClassName,
  sectionLabel,
  titleWidthClass = 'w-72',
  cardCount = 4,
  panelCount = 2,
  message,
}: WorkspaceLoadingStateProps) {
  return (
    <div className={`cockpit-shell ${shellClassName} py-8`} role="status" aria-live="polite">
      <div className="cockpit-container max-w-7xl space-y-6 animate-pulse">
        <div className="hud-panel space-y-3">
          <div className="h-3 w-20 rounded bg-[rgba(148,163,184,0.25)]" />
          <div className={`h-8 rounded bg-[rgba(148,163,184,0.35)] ${titleWidthClass}`} />
          <div className="h-4 w-80 rounded bg-[rgba(148,163,184,0.22)]" />
          <p className="pt-1 text-xs uppercase tracking-system text-text-secondary">{sectionLabel}</p>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: cardCount }).map((_, index) => (
            <div key={index} className="hud-card space-y-3">
              <div className="h-3 w-24 rounded bg-[rgba(148,163,184,0.2)]" />
              <div className="h-8 w-28 rounded bg-[rgba(148,163,184,0.3)]" />
              <div className="h-3 w-32 rounded bg-[rgba(148,163,184,0.15)]" />
            </div>
          ))}
        </div>

        <div className={`grid grid-cols-1 gap-6 ${panelCount > 1 ? 'lg:grid-cols-2' : ''}`}>
          {Array.from({ length: panelCount }).map((_, index) => (
            <div key={index} className="hud-card h-80" />
          ))}
        </div>

        <p className="text-sm text-text-secondary">{message}</p>
      </div>
    </div>
  )
}
