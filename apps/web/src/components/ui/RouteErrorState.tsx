'use client'

import Link from 'next/link'

interface RouteErrorStateProps {
  title: string
  message: string
  onRetry: () => void
  shellClassName?: string
  backHref?: string
  backLabel?: string
}

export default function RouteErrorState({
  title,
  message,
  onRetry,
  shellClassName = 'page-mission-control',
  backHref = '/dashboard',
  backLabel = 'Back to Dashboard',
}: RouteErrorStateProps) {
  return (
    <main className={`cockpit-shell ${shellClassName} flex min-h-screen items-center justify-center px-4 py-8`}>
      <section className="hud-card w-full max-w-xl">
        <p className="text-xs uppercase tracking-system text-text-secondary">System Error</p>
        <h1 className="mt-2 text-2xl font-semibold text-text-primary">{title}</h1>
        <p className="mt-2 text-sm text-text-secondary">{message}</p>

        <div className="mt-5 flex flex-wrap gap-2">
          <button type="button" onClick={onRetry} className="hud-button-primary px-4 py-2 text-sm">
            Try Again
          </button>
          <Link href={backHref} className="hud-button-secondary px-4 py-2 text-sm">
            {backLabel}
          </Link>
        </div>
      </section>
    </main>
  )
}
