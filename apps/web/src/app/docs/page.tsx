import Link from 'next/link'

export const metadata = {
  title: 'Documentation',
}

export default function DocsPage() {
  return (
    <main className="cockpit-container flex min-h-screen max-w-4xl flex-col gap-8 py-12">
      <header className="space-y-2">
        <p className="text-sm font-semibold uppercase tracking-system text-rocket-500">Docs</p>
        <h1 className="text-3xl font-bold text-text-primary">Documentation Center</h1>
        <p className="text-text-secondary">
          Core guides for launching funnels, managing offers, and tracking results.
        </p>
      </header>

      <section className="grid gap-4 sm:grid-cols-2">
        <Link href="/launchpad" className="card-premium rounded-xl p-5 hover:border-[var(--border-focus)]">
          <h2 className="text-lg font-semibold text-text-primary">Getting Started</h2>
          <p className="mt-1 text-sm text-text-secondary">Onboarding walkthrough and first-launch checklist.</p>
        </Link>

        <Link href="/visual-builder" className="card-premium rounded-xl p-5 hover:border-[var(--border-focus)]">
          <h2 className="text-lg font-semibold text-text-primary">Funnel Builder</h2>
          <p className="mt-1 text-sm text-text-secondary">Build and publish funnel pages with the visual editor.</p>
        </Link>

        <Link href="/offers" className="card-premium rounded-xl p-5 hover:border-[var(--border-focus)]">
          <h2 className="text-lg font-semibold text-text-primary">Offers & Monetization</h2>
          <p className="mt-1 text-sm text-text-secondary">Add affiliate offers and manage commissions.</p>
        </Link>

        <Link href="/dashboard" className="card-premium rounded-xl p-5 hover:border-[var(--border-focus)]">
          <h2 className="text-lg font-semibold text-text-primary">Analytics</h2>
          <p className="mt-1 text-sm text-text-secondary">Understand leads, conversions, and performance trends.</p>
        </Link>
      </section>
    </main>
  )
}
