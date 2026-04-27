import Link from 'next/link'

export const metadata = {
  title: 'Support',
}

export default function SupportPage() {
  return (
    <main className="cockpit-container flex min-h-screen max-w-4xl flex-col gap-8 py-12">
      <header className="space-y-2">
        <p className="text-sm font-semibold uppercase tracking-system text-rocket-500">Support</p>
        <h1 className="text-3xl font-bold text-text-primary">How can we help?</h1>
        <p className="text-text-secondary">
          Use these paths to unblock setup, billing, and launch issues quickly.
        </p>
      </header>

      <section className="grid gap-4 sm:grid-cols-2">
        <Link href="/docs" className="card-premium rounded-xl p-5 hover:border-[var(--border-focus)]">
          <h2 className="text-lg font-semibold text-text-primary">Read Documentation</h2>
          <p className="mt-1 text-sm text-text-secondary">Start with setup and troubleshooting guides.</p>
        </Link>

        <Link href="/settings" className="card-premium rounded-xl p-5 hover:border-[var(--border-focus)]">
          <h2 className="text-lg font-semibold text-text-primary">Account Settings</h2>
          <p className="mt-1 text-sm text-text-secondary">Review plan, integrations, and workspace details.</p>
        </Link>

        <a
          href="mailto:support@launchpad4success.pro"
          className="card-premium rounded-xl p-5 hover:border-[var(--border-focus)]"
        >
          <h2 className="text-lg font-semibold text-text-primary">Email Support</h2>
          <p className="mt-1 text-sm text-text-secondary">Contact support directly for account-specific issues.</p>
        </a>

        <Link href="/team" className="card-premium rounded-xl p-5 hover:border-[var(--border-focus)]">
          <h2 className="text-lg font-semibold text-text-primary">Team Access Help</h2>
          <p className="mt-1 text-sm text-text-secondary">Invite members and troubleshoot access permissions.</p>
        </Link>
      </section>
    </main>
  )
}
