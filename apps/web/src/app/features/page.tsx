import Link from 'next/link'

export default function Features() {
  return (
    <main className="min-h-screen bg-brand-gradient launch-pad p-8">
      <div className="max-w-6xl mx-auto">
        <Link href="/" className="text-white hover:text-brand-cyan mb-8 inline-block transition-colors">
          ← Back to Home
        </Link>
        
        <h1 className="text-5xl font-bold text-white text-center mb-4">
          Powerful Features
        </h1>
        <p className="text-xl text-white text-center mb-12">
          Everything you need to succeed with affiliate marketing
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl p-8 border-2 border-brand-purple/20">
            <div className="text-4xl mb-4">🎯</div>
            <h3 className="text-2xl font-bold mb-3 text-brand-purple">Smart Tracking</h3>
            <p className="text-brand-navy">
              Track every click, conversion, and commission with precision. Know exactly 
              what's working and optimize your campaigns for maximum ROI.
            </p>
          </div>
          
          <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl p-8 border-2 border-brand-purple/20">
            <div className="text-4xl mb-4">🤖</div>
            <h3 className="text-2xl font-bold mb-3 text-brand-purple">AI Content Generation</h3>
            <p className="text-brand-navy">
              Let AI write compelling headlines, product descriptions, and email sequences. 
              Save hours while maintaining quality that converts.
            </p>
          </div>
          
          <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl p-8 border-2 border-brand-purple/20">
            <div className="text-4xl mb-4">📊</div>
            <h3 className="text-2xl font-bold mb-3 text-brand-purple">Advanced Analytics</h3>
            <p className="text-brand-navy">
              Get deep insights into your funnel performance with beautiful dashboards 
              and actionable reports delivered to your inbox.
            </p>
          </div>
          
          <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl p-8 border-2 border-brand-purple/20">
            <div className="text-4xl mb-4">⚡</div>
            <h3 className="text-2xl font-bold mb-3 text-brand-purple">Lightning Fast</h3>
            <p className="text-brand-navy">
              Built on Next.js for blazing-fast load times. Every millisecond counts 
              when it comes to conversions.
            </p>
          </div>
          
          <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl p-8 border-2 border-brand-purple/20">
            <div className="text-4xl mb-4">🔒</div>
            <h3 className="text-2xl font-bold mb-3 text-brand-purple">Secure & Reliable</h3>
            <p className="text-brand-navy">
              Enterprise-grade security with Supabase. Your data and your customers' 
              data are always protected.
            </p>
          </div>
          
          <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl p-8 border-2 border-brand-purple/20">
            <div className="text-4xl mb-4">🎨</div>
            <h3 className="text-2xl font-bold mb-3 text-brand-purple">Beautiful Templates</h3>
            <p className="text-brand-navy">
              Choose from dozens of professionally designed templates that are proven 
              to convert. Customize them to match your brand.
            </p>
          </div>
          
          <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl p-8 border-2 border-brand-purple/20">
            <div className="text-4xl mb-4">📱</div>
            <h3 className="text-2xl font-bold mb-3 text-brand-purple">Mobile Optimized</h3>
            <p className="text-brand-navy">
              Every funnel looks perfect on all devices. With 60%+ of traffic on mobile, 
              this isn't optional.
            </p>
          </div>
          
          <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl p-8 border-2 border-brand-purple/20">
            <div className="text-4xl mb-4">🔄</div>
            <h3 className="text-2xl font-bold mb-3 text-brand-purple">A/B Testing</h3>
            <p className="text-brand-navy">
              Test headlines, images, and CTAs automatically. Let data guide your decisions 
              and maximize your profits.
            </p>
          </div>
        </div>
        
        <div className="text-center mt-12">
          <Link
            href="/signup"
            className="btn-launch text-xl px-12 py-5"
          >
            3...2...1... LAUNCH! 🚀
          </Link>
        </div>
      </div>
    </main>
  )
}
