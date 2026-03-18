import Link from 'next/link'
import AIChatWidget from '@/components/AIChatWidget'
import { HeroSection } from '@/components/HeroSection'

export default function Home() {
  return (
    <main className="relative min-h-screen overflow-hidden">
      <div className="pointer-events-none absolute inset-0">
        <div
          className="absolute inset-0 scale-105"
          style={{
            backgroundImage: "url('/Backgrounds/dashboard-dark.png')",
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            filter: 'blur(2.4px) brightness(0.44)',
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#020913]/82 via-[#020913]/86 to-[#020913]/92" />
      </div>
      <div className="relative z-10">
      {/* Navigation Bar */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/10 bg-[#060b14]/88 backdrop-blur-md shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Link href="/" className="text-xl font-semibold tracking-[0.08em]">
                <span className="text-white">Launchpad</span>
                <span className="mx-1 text-brand-orange">4</span>
                <span className="text-white">Success</span>
              </Link>
            </div>
            <div className="flex items-center gap-4">
              <Link
                href="/login"
                className="px-4 py-2 text-gray-300 hover:text-brand-cyan font-medium transition-colors"
              >
                Members Login
              </Link>
              <Link
                href="/signup"
                className="btn-launch"
              >
                Sign Up
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* BrandBrain-aware Hero Section */}
      <HeroSection />

      {/* CTA Section */}
      <section className="page-flight-deck relative overflow-hidden px-6 py-24">
        <div className="absolute inset-0 bg-[#060b14]/52 backdrop-blur-sm" />
        <div className="relative z-10 mx-auto max-w-7xl">
          <div className="hud-panel mx-auto flex w-full flex-col items-center px-6 py-14 text-center md:px-10">
            <p className="system-ready justify-center">Final Checkpoint</p>
            <h2 className="mt-5 text-4xl font-semibold tracking-[-0.02em] text-text-primary md:text-5xl">
              Ready to Launch Your Success?
            </h2>
            <p className="mx-auto mt-3 max-w-2xl text-base leading-relaxed text-text-secondary md:text-lg">
              Join marketers building profitable funnels with{' '}
              <span className="font-semibold text-brand-orange">Launchpad 4 Success</span>.
            </p>
            <Link href="/signup" className="btn-launch-premium mt-8 inline-flex items-center justify-center px-10 py-4 text-base">
              3...2...1... LAUNCH!
            </Link>
          </div>
        </div>
      </section>

      {/* Sales Chat Widget */}
      <AIChatWidget />
      </div>
    </main>
  )
}
