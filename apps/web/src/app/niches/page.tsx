import Link from 'next/link'

export default function Niches() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-600 via-purple-600 to-green-500 p-8">
      <div className="max-w-6xl mx-auto">
        <Link href="/" className="text-white hover:underline mb-8 inline-block">
          ← Back to Home
        </Link>
        
        <h1 className="text-5xl font-bold text-white text-center mb-4">
          Choose Your Niche
        </h1>
        <p className="text-xl text-white text-center mb-12 opacity-90">
          Pre-built modules for profitable markets
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <div className="bg-white rounded-2xl shadow-2xl p-8 hover:scale-105 transition-transform">
            <div className="text-5xl mb-4">💪</div>
            <h3 className="text-2xl font-bold mb-3">Health & Wellness</h3>
            <p className="text-gray-600 mb-4">
              Weight loss, fitness, nutrition, and healthy living offers
            </p>
            <ul className="space-y-2 mb-6 text-sm text-gray-700">
              <li>• Pre-made templates</li>
              <li>• Popular affiliate programs</li>
              <li>• Proven copy examples</li>
            </ul>
            <Link
              href="/signup"
              className="block text-center px-6 py-3 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition-colors"
            >
              Use This Niche
            </Link>
          </div>
          
          <div className="bg-white rounded-2xl shadow-2xl p-8 hover:scale-105 transition-transform">
            <div className="text-5xl mb-4">💰</div>
            <h3 className="text-2xl font-bold mb-3">Finance & Investing</h3>
            <p className="text-gray-600 mb-4">
              Make money, investing, crypto, and personal finance
            </p>
            <ul className="space-y-2 mb-6 text-sm text-gray-700">
              <li>• High commission offers</li>
              <li>• Trust-building templates</li>
              <li>• Compliance-ready copy</li>
            </ul>
            <Link
              href="/signup"
              className="block text-center px-6 py-3 bg-green-600 text-white font-bold rounded-lg hover:bg-green-700 transition-colors"
            >
              Use This Niche
            </Link>
          </div>
          
          <div className="bg-white rounded-2xl shadow-2xl p-8 hover:scale-105 transition-transform">
            <div className="text-5xl mb-4">💻</div>
            <h3 className="text-2xl font-bold mb-3">Technology & Software</h3>
            <p className="text-gray-600 mb-4">
              SaaS tools, apps, courses, and digital products
            </p>
            <ul className="space-y-2 mb-6 text-sm text-gray-700">
              <li>• Recurring commissions</li>
              <li>• Demo-focused funnels</li>
              <li>• Feature comparison pages</li>
            </ul>
            <Link
              href="/signup"
              className="block text-center px-6 py-3 bg-purple-600 text-white font-bold rounded-lg hover:bg-purple-700 transition-colors"
            >
              Use This Niche
            </Link>
          </div>
          
          <div className="bg-white rounded-2xl shadow-2xl p-8 hover:scale-105 transition-transform">
            <div className="text-5xl mb-4">❤️</div>
            <h3 className="text-2xl font-bold mb-3">Dating & Relationships</h3>
            <p className="text-gray-600 mb-4">
              Dating advice, relationship coaching, self-improvement
            </p>
            <ul className="space-y-2 mb-6 text-sm text-gray-700">
              <li>• Emotional copy templates</li>
              <li>• Story-driven funnels</li>
              <li>• High conversion rates</li>
            </ul>
            <Link
              href="/signup"
              className="block text-center px-6 py-3 bg-pink-600 text-white font-bold rounded-lg hover:bg-pink-700 transition-colors"
            >
              Use This Niche
            </Link>
          </div>
          
          <div className="bg-white rounded-2xl shadow-2xl p-8 hover:scale-105 transition-transform">
            <div className="text-5xl mb-4">🎓</div>
            <h3 className="text-2xl font-bold mb-3">Education & Courses</h3>
            <p className="text-gray-600 mb-4">
              Online courses, coaching programs, certifications
            </p>
            <ul className="space-y-2 mb-6 text-sm text-gray-700">
              <li>• Course preview funnels</li>
              <li>• Webinar templates</li>
              <li>• Authority-building pages</li>
            </ul>
            <Link
              href="/signup"
              className="block text-center px-6 py-3 bg-indigo-600 text-white font-bold rounded-lg hover:bg-indigo-700 transition-colors"
            >
              Use This Niche
            </Link>
          </div>
          
          <div className="bg-gradient-to-br from-gray-800 to-gray-900 text-white rounded-2xl shadow-2xl p-8 hover:scale-105 transition-transform">
            <div className="text-5xl mb-4">✨</div>
            <h3 className="text-2xl font-bold mb-3">Custom Niche</h3>
            <p className="text-gray-300 mb-4">
              Build your own niche from scratch with our flexible system
            </p>
            <ul className="space-y-2 mb-6 text-sm text-gray-400">
              <li>• Full customization</li>
              <li>• Import your own offers</li>
              <li>• Unlimited flexibility</li>
            </ul>
            <Link
              href="/signup"
              className="block text-center px-6 py-3 bg-yellow-400 text-gray-900 font-bold rounded-lg hover:bg-yellow-300 transition-colors"
            >
              Build Custom
            </Link>
          </div>
        </div>
      </div>
    </main>
  )
}
