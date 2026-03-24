export default function AnalyticsSkeleton() {
  return (
    <div className="cockpit-shell page-telemetry py-8" role="status" aria-live="polite">
      <div className="cockpit-container max-w-6xl space-y-6 animate-pulse">
        <div className="hud-panel space-y-3">
          <div className="h-3 w-24 rounded bg-[rgba(148,163,184,0.25)]" />
          <div className="h-8 w-72 rounded bg-[rgba(148,163,184,0.35)]" />
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {[0, 1, 2, 3].map((item) => (
            <div key={item} className="hud-card h-24" />
          ))}
        </div>
        <div className="hud-card h-80" />
        <p className="text-sm text-text-secondary">Loading analytics summary...</p>
      </div>
    </div>
  )
}
