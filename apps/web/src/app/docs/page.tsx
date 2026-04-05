import Link from 'next/link'

export const metadata = {
  title: 'Documentation',
}

export default function DocsPage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-4xl flex-col gap-8 px-6 py-12">
      <header className="space-y-2">
        <p className="text-sm font-semibold uppercase tracking-wide text-orange-700">Docs</p>
        <h1 className="text-3xl font-bold text-gray-900">Documentation Center</h1>
        <p className="text-gray-600">
          Core guides for launching funnels, managing offers, and tracking results.
        </p>
      </header>

      <section className="grid gap-4 sm:grid-cols-2">
        <Link href="/launchpad" className="rounded-xl border border-gray-200 p-5 hover:border-orange-300">
          <h2 className="text-lg font-semibold text-gray-900">Getting Started</h2>
          <p className="mt-1 text-sm text-gray-600">Onboarding walkthrough and first-launch checklist.</p>
        </Link>

        <Link href="/visual-builder" className="rounded-xl border border-gray-200 p-5 hover:border-orange-300">
          <h2 className="text-lg font-semibold text-gray-900">Funnel Builder</h2>
          <p className="mt-1 text-sm text-gray-600">Build and publish funnel pages with the visual editor.</p>
        </Link>

        <Link href="/offers" className="rounded-xl border border-gray-200 p-5 hover:border-orange-300">
          <h2 className="text-lg font-semibold text-gray-900">Offers & Monetization</h2>
          <p className="mt-1 text-sm text-gray-600">Add affiliate offers and manage commissions.</p>
        </Link>

        <Link href="/dashboard" className="rounded-xl border border-gray-200 p-5 hover:border-orange-300">
          <h2 className="text-lg font-semibold text-gray-900">Analytics</h2>
          <p className="mt-1 text-sm text-gray-600">Understand leads, conversions, and performance trends.</p>
        </Link>
      </section>
    </main>
  )
}
