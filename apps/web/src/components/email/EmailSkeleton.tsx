export default function EmailSkeleton() {
  return (
    <div className="cockpit-shell page-crew py-8" role="status" aria-live="polite">
      <div className="cockpit-container max-w-6xl space-y-6 animate-pulse">
        <div className="hud-panel space-y-3">
          <div className="h-3 w-16 rounded bg-[rgba(148,163,184,0.25)]" />
          <div className="h-8 w-72 rounded bg-[rgba(148,163,184,0.35)]" />
        </div>
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <div className="hud-card h-80" />
          <div className="hud-card h-80" />
        </div>
        <p className="text-sm text-text-secondary">Loading email workspace...</p>
      </div>
    </div>
  )
}
