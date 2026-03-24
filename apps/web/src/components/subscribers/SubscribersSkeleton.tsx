export default function SubscribersSkeleton() {
  return (
    <div className="cockpit-shell page-cargo-bay py-8" role="status" aria-live="polite">
      <div className="cockpit-container max-w-6xl space-y-6 animate-pulse">
        <div className="hud-panel space-y-3">
          <div className="h-3 w-24 rounded bg-[rgba(148,163,184,0.25)]" />
          <div className="h-8 w-64 rounded bg-[rgba(148,163,184,0.35)]" />
        </div>
        <div className="hud-card h-[520px]" />
        <p className="text-sm text-text-secondary">Loading subscriber records...</p>
      </div>
    </div>
  )
}
