import Link from 'next/link'

export default function Home() {
  return (
    <main className="min-h-screen">
      {/* Hero Section */}
      <section className="flex min-h-screen flex-col items-center justify-center p-8 bg-gradient-to-br from-blue-600 via-purple-600 to-green-500">
        <div className="max-w-4xl w-full text-center">
          <h1 className="text-6xl md:text-7xl font-extrabold mb-6 text-white drop-shadow-2xl">
            Launchpad<span className="text-yellow-300">4</span>Success
          </h1>
          <p className="text-xl md:text-2xl text-white font-semibold mb-8 drop-shadow-lg">
            Build High-Converting Affiliate Funnels in Minutes
          </p>
          <p className="text-lg text-white mb-12 max-w-2xl mx-auto opacity-90">
            The modular system that lets you create, launch, and scale profitable affiliate marketing campaigns without the technical headaches.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <Link
              href="/get-started"
              className="px-10 py-5 bg-yellow-400 text-gray-900 text-lg font-bold rounded-lg hover:bg-yellow-300 transition-all transform hover:scale-105 shadow-xl"
            >
              Get Started Now 🚀
            </Link>
            <Link
              href="/pricing"
              className="px-10 py-5 bg-white text-purple-600 text-lg font-bold rounded-lg border-2 border-white hover:bg-gray-100 transition-all transform hover:scale-105 shadow-xl"
            >
              View Pricing
            </Link>
          </div>

          {/* Feature Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16">
            <div className="p-8 bg-white border-2 border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-shadow">
              <div className="text-4xl mb-4">🎯</div>
              <h2 className="text-xl font-semibold mb-3">Swappable Niches</h2>
              <p className="text-gray-600 mb-4">
                Switch between health, finance, tech, and more without starting over
              </p>
              <Link href="/niches" className="text-blue-600 hover:underline font-medium">
                Explore Niches →
              </Link>
            </div>
            
            <div className="p-8 bg-white border-2 border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-shadow">
              <div className="text-4xl mb-4">🎨</div>
              <h2 className="text-xl font-semibold mb-3">Drag & Drop Builder</h2>
              <p className="text-gray-600 mb-4">
                Create stunning funnels with our visual builder - no coding required
              </p>
              <Link href="/builder" className="text-blue-600 hover:underline font-medium">
                Try Builder →
              </Link>
            </div>
            
            <div className="p-8 bg-white border-2 border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-shadow">
              <div className="text-4xl mb-4">🤖</div>
              <h2 className="text-xl font-semibold mb-3">AI-Powered</h2>
              <p className="text-gray-600 mb-4">
                Let AI write your copy and analyze your campaigns automatically
              </p>
              <Link href="/features" className="text-blue-600 hover:underline font-medium">
                See Features →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-8 bg-gradient-to-r from-purple-600 to-green-600 text-white text-center">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-extrabold mb-6 drop-shadow-lg">
            Ready to Launch Your Success?
          </h2>
          <p className="text-xl mb-8 text-white opacity-90">
            Join thousands of marketers who are building profitable funnels with <span className="font-bold text-yellow-300">Launchpad4Success</span>
          </p>
          <Link
            href="/signup"
            className="inline-block px-12 py-5 bg-yellow-400 text-gray-900 text-lg font-bold rounded-lg hover:bg-yellow-300 transition-all transform hover:scale-110 shadow-2xl"
          >
            Start Your Free Trial ✨
          </Link>
        </div>
      </section>
    </main>
  )
}
