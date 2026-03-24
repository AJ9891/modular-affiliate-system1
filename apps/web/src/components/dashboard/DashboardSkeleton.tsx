export default function DashboardSkeleton() {
  return (
    <div className="cockpit-shell page-mission-control py-8">
      <div className="cockpit-container max-w-6xl space-y-6">
        <div className="hud-panel h-28 animate-pulse" />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {[0, 1, 2, 3].map((item) => (
            <div key={item} className="hud-card h-28 animate-pulse" />
          ))}
        </div>
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <div className="hud-card h-72 animate-pulse" />
          <div className="hud-card h-72 animate-pulse" />
        </div>
      </div>
    </div>
  )
}
