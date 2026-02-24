import Link from 'next/link'
import AIChatWidget from '@/components/AIChatWidget'
import { HeroSection } from '@/components/HeroSection'

export default function Home() {
  return (
    <main className="min-h-screen bg-rocket-starfield">
      {/* Premium Navigation Bar */}
      <nav className="fixed top-0 left-0 right-0 z-50 backdrop-blur-lg border-b border-white/10 bg-brand-navy/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Link href="/" className="text-2xl font-bold">
                <span className="text-white heading-premium">Launchpad</span>
                <span className="text-brand-orange">4</span>
                <span className="text-white">Success</span>
              </Link>
            </div>
            <div className="flex items-center gap-4">
              <Link
                href="/login"
                className="px-4 py-2 text-slate-300 hover:text-brand-cyan font-medium transition-colors duration-200 hover:scale-105"
              >
                Members Login
              </Link>
              <Link
                href="/signup"
                className="btn-launch-premium"
              >
                Sign Up
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* BrandBrain-aware Hero Section */}
      <HeroSection />

      {/* Premium Features Section */}
      <section className="py-20 px-8 bg-gradient-to-b from-transparent to-black/20">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl heading-premium text-white mb-6">
              Launch Your Success with 
              <span className="text-brand-gradient"> Premium Tools</span>
            </h2>
            <p className="body-premium text-xl max-w-3xl mx-auto">
              Join thousands of marketers building profitable funnels with our professional-grade platform
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="card-premium text-center group">
              <div className="w-16 h-16 mx-auto mb-6 bg-brand-gradient rounded-xl flex items-center justify-center glow-premium">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="heading-premium text-xl mb-4">Visual Builder</h3>
              <p className="body-premium">Drag-and-drop funnel creation with professional templates</p>
            </div>
            
            <div className="card-premium text-center group">
              <div className="w-16 h-16 mx-auto mb-6 bg-brand-gradient rounded-xl flex items-center justify-center glow-premium">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <h3 className="heading-premium text-xl mb-4">AI Content</h3>
              <p className="body-premium">Smart content generation powered by advanced AI</p>
            </div>
            
            <div className="card-premium text-center group">
              <div className="w-16 h-16 mx-auto mb-6 bg-brand-gradient rounded-xl flex items-center justify-center glow-premium">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h3 className="heading-premium text-xl mb-4">Analytics</h3>
              <p className="body-premium">Real-time insights and conversion optimization</p>
            </div>
          </div>
        </div>
      </section>

      {/* Premium CTA Section */}
      <section className="py-24 px-8 relative overflow-hidden">
        {/* Background Elements */}
        <div className="absolute inset-0 bg-gradient-to-r from-brand-purple/20 via-brand-cyan/20 to-brand-orange/20"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(139,92,246,0.1)_0%,transparent_70%)]"></div>
        
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <h2 className="text-5xl md:text-7xl heading-premium text-white mb-8 drop-shadow-2xl">
            Ready to Launch Your 
            <span className="text-brand-gradient block md:inline"> Success?</span>
          </h2>
          <p className="body-premium text-xl mb-12 max-w-2xl mx-auto">
            Join thousands of marketers who are building profitable funnels with professional-grade tools and AI-powered automation
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link
              href="/signup"
              className="btn-launch-premium text-lg px-10 py-5 glow-launch"
            >
              🚀 3...2...1... LAUNCH!
            </Link>
            <Link
              href="/login"
              className="btn-secondary-premium text-lg"
            >
              View Demo
            </Link>
          </div>
          
          <div className="mt-12 flex justify-center items-center gap-8 text-sm text-slate-400">
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              No credit card required
            </div>
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              Free forever plan
            </div>
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              Setup in 5 minutes
            </div>
          </div>
        </div>
      </section>

      {/* Sales Chat Widget */}
      <AIChatWidget mode="sales" />
    </main>
  )
}
