import Link from 'next/link'
import AIChatWidget from '@/components/AIChatWidget'
import { HeroSection } from '@/components/HeroSection'

export default function Home() {
  return (
    <main className="min-h-screen">
      {/* Navigation Bar */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-brand-navy/95 backdrop-blur-sm shadow-lg border-b border-brand-purple/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Link href="/" className="text-2xl font-bold">
                <span className="text-white">Launchpad</span>
                <span className="text-brand-orange">4</span>
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
      <section className="py-20 px-8 bg-launch-gradient text-white text-center relative overflow-hidden">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="max-w-3xl mx-auto relative z-10">
          <h2 className="text-4xl md:text-6xl font-extrabold mb-6 drop-shadow-lg">
            Ready to Launch Your Success?
          </h2>
          <p className="text-xl mb-8 text-white">
            Join thousands of marketers who are building profitable funnels with <span className="font-bold text-brand-navy">Launchpad4Success</span>
          </p>
          <Link
            href="/signup"
            className="inline-block px-12 py-5 bg-gradient-to-r from-orange-500 via-red-500 to-yellow-500 text-white text-lg font-bold rounded-lg hover:from-orange-600 hover:via-red-600 hover:to-yellow-600 transition-all transform hover:scale-110 shadow-2xl glow-orange"
          >
            3...2...1... LAUNCH! 🚀
          </Link>
        </div>
      </section>

      {/* Sales Chat Widget */}
      <AIChatWidget mode="sales" />
    </main>
  )
}
