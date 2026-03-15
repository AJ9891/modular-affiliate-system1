import Link from 'next/link'
import AIChatWidget from '@/components/AIChatWidget'

const systems = [
  { title: 'Structural Assembly', description: 'Visual builder for funnels.', icon: 'SA' },
  { title: 'Core Intelligence', description: 'AI guidance for copy and flow.', icon: 'CI' },
  { title: 'Flight Telemetry', description: 'Real-time analytics overlays.', icon: 'FT' }
]

export default function Home() {
  return (
    <main className="mission-hero text-text-primary">
      <nav className="mission-nav fixed left-0 right-0 top-0 z-50 px-6 py-4 md:px-10">
        <div className="mx-auto flex h-14 w-full max-w-7xl items-center justify-between px-2 md:px-4">
          <Link href="/" className="text-lg font-semibold md:text-xl text-white/90">
            Launchpad <span className="text-rocket-500">4</span> Success
          </Link>
          <div className="flex items-center gap-2">
            <Link
              href="/login"
              className="rounded-md px-3 py-2 text-sm text-white/80 transition hover:text-white"
            >
              Login
            </Link>
            <Link href="/signup" className="btn-launch-premium px-4 py-2 text-sm">
              Sign up free
            </Link>
          </div>
        </div>
      </nav>

      <section className="mission-console">
        <div className="glass-console shadow-2xl">
          <p className="system-ready text-xs uppercase tracking-[0.25em] text-teal-200/80">
            System Ready • All Systems Nominal
          </p>
          <h1 className="mt-3 text-3xl font-semibold text-white">Launchpad 4 Success</h1>
          <p className="mt-2 text-sm text-white/80">AI-native mission control before ignition.</p>
          <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
            <Link href="/get-started" className="cta-primary px-6 py-3 rounded-lg text-sm font-semibold">
              Initiate Launch
            </Link>
            <Link href="/signup" className="cta-secondary px-6 py-3 rounded-lg text-sm font-semibold">
              Sign up free
            </Link>
          </div>
        </div>
      </section>

      <section className="px-6 pb-8 md:px-10 relative z-10">
        <div className="mx-auto grid max-w-5xl gap-4 md:grid-cols-3">
          {systems.map((system) => (
            <article key={system.title} className="glass-tile">
              <div className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-white/10 bg-white/5 text-xs font-semibold text-teal-100">
                {system.icon}
              </div>
              <h2 className="mt-2 text-base font-semibold text-white">{system.title}</h2>
              <p className="text-sm text-white/75">{system.description}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="px-6 pb-10 text-center text-xs uppercase tracking-system text-white/60 md:px-10 relative z-10">
        <p>Professional Flight Deck • Calm authority • AI-native</p>
      </section>

      <AIChatWidget mode="sales" />
    </main>
  )
}
