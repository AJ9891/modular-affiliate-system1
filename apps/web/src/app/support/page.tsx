import Link from 'next/link'

export const metadata = {
  title: 'Support',
}

export default function SupportPage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-4xl flex-col gap-8 px-6 py-12">
      <header className="space-y-2">
        <p className="text-sm font-semibold uppercase tracking-wide text-orange-700">Support</p>
        <h1 className="text-3xl font-bold text-gray-900">How can we help?</h1>
        <p className="text-gray-600">
          Use these paths to unblock setup, billing, and launch issues quickly.
        </p>
      </header>

      <section className="grid gap-4 sm:grid-cols-2">
        <Link href="/docs" className="rounded-xl border border-gray-200 p-5 hover:border-orange-300">
          <h2 className="text-lg font-semibold text-gray-900">Read Documentation</h2>
          <p className="mt-1 text-sm text-gray-600">Start with setup and troubleshooting guides.</p>
        </Link>

        <Link href="/settings" className="rounded-xl border border-gray-200 p-5 hover:border-orange-300">
          <h2 className="text-lg font-semibold text-gray-900">Account Settings</h2>
          <p className="mt-1 text-sm text-gray-600">Review plan, integrations, and workspace details.</p>
        </Link>

        <a
          href="mailto:support@launchpad4success.pro"
          className="rounded-xl border border-gray-200 p-5 hover:border-orange-300"
        >
          <h2 className="text-lg font-semibold text-gray-900">Email Support</h2>
          <p className="mt-1 text-sm text-gray-600">Contact support directly for account-specific issues.</p>
        </a>

        <Link href="/team" className="rounded-xl border border-gray-200 p-5 hover:border-orange-300">
          <h2 className="text-lg font-semibold text-gray-900">Team Access Help</h2>
          <p className="mt-1 text-sm text-gray-600">Invite members and troubleshoot access permissions.</p>
        </Link>
      </section>
    </main>
  )
}
