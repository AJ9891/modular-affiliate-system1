import Link from 'next/link'
import AIChatWidget from '@/components/AIChatWidget'
import { HeroSection } from '@/components/HeroSection'

export default function Home() {
  return (
    <main className="cockpit-shell text-text-primary">
      <nav className="fixed left-0 right-0 top-0 z-50 px-6 py-4 md:px-10">
        <div className="hud-strip mx-auto flex h-14 w-full max-w-7xl items-center justify-between px-5">
          <Link href="/" className="text-lg font-semibold md:text-xl">
            Launchpad <span className="text-rocket-500">4</span> Success
          </Link>
          <div className="flex items-center gap-2">
            <Link
              href="/login"
              className="rounded-md px-3 py-2 text-sm text-text-secondary transition hover:text-text-primary"
            >
              Login
            </Link>
            <Link href="/signup" className="btn-launch-premium px-4 py-2 text-sm">
              Start
            </Link>
          </div>
        </div>
      </nav>

      <HeroSection />

      <section className="px-6 pb-10 text-center text-xs uppercase tracking-system text-text-muted md:px-10">
        <p>Launchpad 4 Success | Professional Flight Deck</p>
      </section>

      <AIChatWidget mode="sales" />
    </main>
  )
}
