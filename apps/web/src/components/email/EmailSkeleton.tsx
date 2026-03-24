export default function EmailSkeleton() {
  return (
    <div className="cockpit-shell page-crew py-8">
      <div className="cockpit-container max-w-6xl space-y-6">
        <div className="hud-panel h-24 animate-pulse" />
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <div className="hud-card h-80 animate-pulse" />
          <div className="hud-card h-80 animate-pulse" />
        </div>
      </div>
    </div>
  )
}
