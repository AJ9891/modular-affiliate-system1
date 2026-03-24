export default function DashboardSkeleton() {
  return (
    <div className="cockpit-shell page-mission-control py-8" role="status" aria-live="polite">
      <div className="cockpit-container max-w-6xl space-y-6 animate-pulse">
        <div className="hud-panel space-y-3">
          <div className="h-3 w-20 rounded bg-[rgba(148,163,184,0.25)]" />
          <div className="h-8 w-64 rounded bg-[rgba(148,163,184,0.35)]" />
          <div className="h-4 w-80 rounded bg-[rgba(148,163,184,0.22)]" />
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {[0, 1, 2, 3].map((item) => (
            <div key={item} className="hud-card space-y-3">
              <div className="h-3 w-24 rounded bg-[rgba(148,163,184,0.2)]" />
              <div className="h-8 w-28 rounded bg-[rgba(148,163,184,0.3)]" />
            </div>
          ))}
        </div>
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <div className="hud-card h-72" />
          <div className="hud-card h-72" />
        </div>
        <p className="text-sm text-text-secondary">Loading dashboard telemetry...</p>
      </div>
    </div>
  )
}
