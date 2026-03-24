export default function AdminSkeleton() {
  return (
    <div className="cockpit-shell page-command-authority py-8">
      <div className="cockpit-container max-w-6xl space-y-6">
        <div className="hud-panel h-24 animate-pulse" />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
          {[0, 1, 2, 3, 4].map((item) => (
            <div key={item} className="hud-card h-24 animate-pulse" />
          ))}
        </div>
        <div className="hud-card h-[460px] animate-pulse" />
      </div>
    </div>
  )
}
