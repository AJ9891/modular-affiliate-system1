export default function SettingsSkeleton() {
  return (
    <div className="cockpit-shell page-command-authority py-8">
      <div className="cockpit-container max-w-5xl space-y-6">
        <div className="hud-panel h-24 animate-pulse" />
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <div className="hud-card h-72 animate-pulse" />
          <div className="hud-card h-72 animate-pulse" />
        </div>
      </div>
    </div>
  )
}
