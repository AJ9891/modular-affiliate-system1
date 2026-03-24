export default function SettingsSkeleton() {
  return (
    <div className="cockpit-shell page-command-authority py-8" role="status" aria-live="polite">
      <div className="cockpit-container max-w-5xl space-y-6 animate-pulse">
        <div className="hud-panel h-24" />
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <div className="hud-card h-72" />
          <div className="hud-card h-72" />
        </div>
        <p className="text-sm text-text-secondary">Loading account settings...</p>
      </div>
    </div>
  )
}
