import Link from 'next/link'

export default function Features() {
  return (
    <main className="cockpit-container min-h-screen py-10">
      <div className="mx-auto max-w-6xl">
        <Link href="/" className="mb-8 inline-block text-text-secondary transition-colors hover:text-rocket-500">
          ← Back to Home
        </Link>
        
        <h1 className="mb-4 text-center text-5xl font-bold text-text-primary heading-premium">
          Powerful Features
        </h1>
        <p className="mb-12 text-center text-xl text-text-secondary">
          Everything you need to succeed with affiliate marketing
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="card-premium rounded-2xl border-2 border-[var(--border-elevated)] p-8">
            <div className="text-4xl mb-4">🎯</div>
            <h3 className="mb-3 text-2xl font-bold text-text-primary">Smart Tracking</h3>
            <p className="text-text-secondary">
              Track every click, conversion, and commission with precision. Know exactly 
              what's working and optimize your campaigns for maximum ROI.
            </p>
          </div>
          
          <div className="card-premium rounded-2xl border-2 border-[var(--border-elevated)] p-8">
            <div className="text-4xl mb-4">🤖</div>
            <h3 className="mb-3 text-2xl font-bold text-text-primary">AI Content Generation</h3>
            <p className="text-text-secondary">
              Let AI write compelling headlines, product descriptions, and email sequences. 
              Save hours while maintaining quality that converts.
            </p>
          </div>
          
          <div className="card-premium rounded-2xl border-2 border-[var(--border-elevated)] p-8">
            <div className="text-4xl mb-4">📊</div>
            <h3 className="mb-3 text-2xl font-bold text-text-primary">Advanced Analytics</h3>
            <p className="text-text-secondary">
              Get deep insights into your funnel performance with beautiful dashboards 
              and actionable reports delivered to your inbox.
            </p>
          </div>
          
          <div className="card-premium rounded-2xl border-2 border-[var(--border-elevated)] p-8">
            <div className="text-4xl mb-4">⚡</div>
            <h3 className="mb-3 text-2xl font-bold text-text-primary">Lightning Fast</h3>
            <p className="text-text-secondary">
              Built on Next.js for blazing-fast load times. Every millisecond counts 
              when it comes to conversions.
            </p>
          </div>
          
          <div className="card-premium rounded-2xl border-2 border-[var(--border-elevated)] p-8">
            <div className="text-4xl mb-4">🔒</div>
            <h3 className="mb-3 text-2xl font-bold text-text-primary">Secure & Reliable</h3>
            <p className="text-text-secondary">
              Enterprise-grade security with Supabase. Your data and your customers' 
              data are always protected.
            </p>
          </div>
          
          <div className="card-premium rounded-2xl border-2 border-[var(--border-elevated)] p-8">
            <div className="text-4xl mb-4">🎨</div>
            <h3 className="mb-3 text-2xl font-bold text-text-primary">Beautiful Templates</h3>
            <p className="text-text-secondary">
              Choose from dozens of professionally designed templates that are proven 
              to convert. Customize them to match your brand.
            </p>
          </div>
          
          <div className="card-premium rounded-2xl border-2 border-[var(--border-elevated)] p-8">
            <div className="text-4xl mb-4">📱</div>
            <h3 className="mb-3 text-2xl font-bold text-text-primary">Mobile Optimized</h3>
            <p className="text-text-secondary">
              Every funnel looks perfect on all devices. With 60%+ of traffic on mobile, 
              this isn't optional.
            </p>
          </div>
          
          <div className="card-premium rounded-2xl border-2 border-[var(--border-elevated)] p-8">
            <div className="text-4xl mb-4">🔄</div>
            <h3 className="mb-3 text-2xl font-bold text-text-primary">A/B Testing</h3>
            <p className="text-text-secondary">
              Test headlines, images, and CTAs automatically. Let data guide your decisions 
              and maximize your profits.
            </p>
          </div>
        </div>
        
        <div className="text-center mt-12">
          <Link
            href="/signup"
            className="btn-launch-premium text-xl px-12 py-5"
          >
            3...2...1... LAUNCH! 🚀
          </Link>
        </div>
      </div>
    </main>
  )
}
