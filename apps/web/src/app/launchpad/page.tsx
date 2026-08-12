import { Suspense } from 'react'
import LaunchpadClient from './LaunchpadClient'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

function LaunchpadFallback() {
  return (
    <main className="cockpit-shell page-command-authority min-h-screen py-8">
      <div className="cockpit-container">
        <div className="hud-panel animate-pulse p-6 text-sm text-text-secondary">
          Loading Launchpad...
        </div>
      </div>
    </main>
  )
}

export default function LaunchpadPage() {
  return (
    <Suspense fallback={<LaunchpadFallback />}>
      <LaunchpadClient />
    </Suspense>
  )
}
