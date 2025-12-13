import Link from 'next/link'
import AIChatWidget from '@/components/AIChatWidget'

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

      {/* Hero Section */}
      <section className="flex min-h-screen flex-col items-center justify-center p-8 bg-brand-gradient launch-pad pt-16 relative overflow-hidden">
        {/* Rocket launch trail effects */}
        <div className="absolute top-20 left-10 w-64 h-64 bg-brand-purple/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-brand-orange/15 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full h-full bg-gradient-to-t from-brand-orange/10 to-transparent opacity-30"></div>
        
        <div className="max-w-4xl w-full text-center relative z-10">
          <h1 className="text-5xl md:text-7xl font-extrabold mb-6 text-white drop-shadow-2xl break-words px-4 relative inline-flex items-center justify-center flex-wrap">
            <span className="text-white relative z-20">Launchpad</span>
            <span className="text-brand-gradient text-6xl md:text-8xl relative z-10 -mx-2">4</span>
            <span className="text-white relative z-20">Success</span>
          </h1>
          <p className="text-xl md:text-3xl text-brand-cyan font-bold mb-8 drop-shadow-lg">
            Build High-Converting Affiliate Funnels in Minutes
          </p>
          <p className="text-lg text-white mb-12 max-w-2xl mx-auto">
            The modular system that lets you create, launch, and scale profitable affiliate marketing campaigns without the technical headaches.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <Link
              href="/get-started"
              className="btn-launch text-xl px-12 py-6"
            >
              Get Started Now 🚀
            </Link>
            <Link
              href="/pricing"
              className="px-12 py-6 bg-transparent text-white text-xl font-bold rounded-lg border-2 border-brand-cyan hover:bg-brand-cyan/20 transition-all transform hover:scale-105 shadow-xl glow-cyan"
            >
              View Pricing
            </Link>
          </div>

          {/* Feature Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16">
            <div className="card-launch">
              <div className="text-5xl mb-4">🚀</div>
              <h2 className="text-2xl font-bold mb-3 text-brand-purple">Swappable Niches</h2>
              <p className="text-brand-purple mb-4">
                Switch between health, finance, tech, and more without starting over
              </p>
              <Link href="/niches" className="text-brand-cyan hover:text-brand-orange font-bold transition-colors inline-block">
                Explore Niches →
              </Link>
            </div>
            
            <div className="card-launch">
              <div className="text-5xl mb-4">⚡</div>
              <h2 className="text-2xl font-bold mb-3 text-brand-purple">Drag & Drop Builder</h2>
              <p className="text-brand-purple mb-4">
                Create stunning funnels with our visual builder - no coding required
              </p>
              <Link href="/builder" className="text-brand-cyan hover:text-brand-orange font-bold transition-colors inline-block">
                Try Builder →
              </Link>
            </div>
            
            <div className="card-launch">
              <div className="text-5xl mb-4">🎯</div>
              <h2 className="text-2xl font-bold mb-3 text-brand-purple">AI-Powered</h2>
              <p className="text-brand-purple mb-4">
                Let AI write your copy and analyze your campaigns automatically
              </p>
              <Link href="/features" className="text-brand-cyan hover:text-brand-orange font-bold transition-colors inline-block">
                See Features →
              </Link>
            </div>
          </div>
        </div>
      </section>

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
            className="inline-block px-12 py-5 bg-white text-brand-navy text-lg font-bold rounded-lg hover:bg-gray-100 transition-all transform hover:scale-110 shadow-2xl glow-orange"
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
