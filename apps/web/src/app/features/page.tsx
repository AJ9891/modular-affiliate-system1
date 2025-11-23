import Link from 'next/link'

export default function Features() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-600 via-purple-600 to-green-500 p-8">
      <div className="max-w-6xl mx-auto">
        <Link href="/" className="text-white hover:underline mb-8 inline-block">
          ← Back to Home
        </Link>
        
        <h1 className="text-5xl font-bold text-white text-center mb-4">
          Powerful Features
        </h1>
        <p className="text-xl text-white text-center mb-12 opacity-90">
          Everything you need to succeed with affiliate marketing
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-white rounded-2xl shadow-2xl p-8">
            <div className="text-4xl mb-4">🎯</div>
            <h3 className="text-2xl font-bold mb-3">Smart Tracking</h3>
            <p className="text-gray-600">
              Track every click, conversion, and commission with precision. Know exactly 
              what's working and optimize your campaigns for maximum ROI.
            </p>
          </div>
          
          <div className="bg-white rounded-2xl shadow-2xl p-8">
            <div className="text-4xl mb-4">🤖</div>
            <h3 className="text-2xl font-bold mb-3">AI Content Generation</h3>
            <p className="text-gray-600">
              Let AI write compelling headlines, product descriptions, and email sequences. 
              Save hours while maintaining quality that converts.
            </p>
          </div>
          
          <div className="bg-white rounded-2xl shadow-2xl p-8">
            <div className="text-4xl mb-4">📊</div>
            <h3 className="text-2xl font-bold mb-3">Advanced Analytics</h3>
            <p className="text-gray-600">
              Get deep insights into your funnel performance with beautiful dashboards 
              and actionable reports delivered to your inbox.
            </p>
          </div>
          
          <div className="bg-white rounded-2xl shadow-2xl p-8">
            <div className="text-4xl mb-4">⚡</div>
            <h3 className="text-2xl font-bold mb-3">Lightning Fast</h3>
            <p className="text-gray-600">
              Built on Next.js for blazing-fast load times. Every millisecond counts 
              when it comes to conversions.
            </p>
          </div>
          
          <div className="bg-white rounded-2xl shadow-2xl p-8">
            <div className="text-4xl mb-4">🔒</div>
            <h3 className="text-2xl font-bold mb-3">Secure & Reliable</h3>
            <p className="text-gray-600">
              Enterprise-grade security with Supabase. Your data and your customers' 
              data are always protected.
            </p>
          </div>
          
          <div className="bg-white rounded-2xl shadow-2xl p-8">
            <div className="text-4xl mb-4">🎨</div>
            <h3 className="text-2xl font-bold mb-3">Beautiful Templates</h3>
            <p className="text-gray-600">
              Choose from dozens of professionally designed templates that are proven 
              to convert. Customize them to match your brand.
            </p>
          </div>
          
          <div className="bg-white rounded-2xl shadow-2xl p-8">
            <div className="text-4xl mb-4">📱</div>
            <h3 className="text-2xl font-bold mb-3">Mobile Optimized</h3>
            <p className="text-gray-600">
              Every funnel looks perfect on all devices. With 60%+ of traffic on mobile, 
              this isn't optional.
            </p>
          </div>
          
          <div className="bg-white rounded-2xl shadow-2xl p-8">
            <div className="text-4xl mb-4">🔄</div>
            <h3 className="text-2xl font-bold mb-3">A/B Testing</h3>
            <p className="text-gray-600">
              Test headlines, images, and CTAs automatically. Let data guide your decisions 
              and maximize your profits.
            </p>
          </div>
        </div>
        
        <div className="text-center mt-12">
          <Link
            href="/signup"
            className="inline-block px-12 py-5 bg-yellow-400 text-gray-900 text-lg font-bold rounded-lg hover:bg-yellow-300 transition-all transform hover:scale-110 shadow-2xl"
          >
            Start Using These Features Now ✨
          </Link>
        </div>
      </div>
    </main>
  )
}
