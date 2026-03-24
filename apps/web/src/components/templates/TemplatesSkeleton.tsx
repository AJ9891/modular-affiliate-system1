export default function TemplatesSkeleton() {
  return (
    <div className="cockpit-shell page-ai-core py-8" role="status" aria-live="polite">
      <div className="cockpit-container max-w-6xl space-y-6 animate-pulse">
        <div className="hud-panel space-y-3">
          <div className="h-3 w-20 rounded bg-[rgba(148,163,184,0.25)]" />
          <div className="h-8 w-72 rounded bg-[rgba(148,163,184,0.35)]" />
        </div>
        <div className="hud-card h-[520px]" />
        <p className="text-sm text-text-secondary">Loading template gallery...</p>
      </div>
    </div>
  )
}
