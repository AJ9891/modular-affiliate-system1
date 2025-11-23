import Link from 'next/link'

export default function Pricing() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-600 via-purple-600 to-green-500 p-8">
      <div className="max-w-6xl mx-auto">
        <Link href="/" className="text-white hover:underline mb-8 inline-block">
          ← Back to Home
        </Link>
        
        <h1 className="text-5xl font-bold text-white text-center mb-4">
          Simple, Transparent Pricing
        </h1>
        <p className="text-xl text-white text-center mb-12 opacity-90">
          Choose the plan that fits your goals
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Starter Plan */}
          <div className="bg-white rounded-2xl shadow-2xl p-8 hover:scale-105 transition-transform">
            <h3 className="text-2xl font-bold mb-2">Starter</h3>
            <div className="text-4xl font-bold mb-6">
              $29<span className="text-xl text-gray-600">/mo</span>
            </div>
            <ul className="space-y-4 mb-8">
              <li className="flex items-start">
                <span className="text-green-600 mr-2">✓</span>
                <span>1 Active Funnel</span>
              </li>
              <li className="flex items-start">
                <span className="text-green-600 mr-2">✓</span>
                <span>Basic Templates</span>
              </li>
              <li className="flex items-start">
                <span className="text-green-600 mr-2">✓</span>
                <span>Analytics Dashboard</span>
              </li>
              <li className="flex items-start">
                <span className="text-green-600 mr-2">✓</span>
                <span>Email Support</span>
              </li>
            </ul>
            <Link
              href="/signup"
              className="block text-center px-6 py-3 bg-gray-900 text-white font-bold rounded-lg hover:bg-gray-800 transition-colors"
            >
              Get Started
            </Link>
          </div>
          
          {/* Pro Plan */}
          <div className="bg-gradient-to-br from-blue-600 to-purple-600 text-white rounded-2xl shadow-2xl p-8 transform scale-110 hover:scale-115 transition-transform relative">
            <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-yellow-400 text-gray-900 px-4 py-1 rounded-full text-sm font-bold">
              POPULAR
            </div>
            <h3 className="text-2xl font-bold mb-2">Pro</h3>
            <div className="text-4xl font-bold mb-6">
              $79<span className="text-xl opacity-80">/mo</span>
            </div>
            <ul className="space-y-4 mb-8">
              <li className="flex items-start">
                <span className="text-yellow-300 mr-2">✓</span>
                <span>Unlimited Funnels</span>
              </li>
              <li className="flex items-start">
                <span className="text-yellow-300 mr-2">✓</span>
                <span>Premium Templates</span>
              </li>
              <li className="flex items-start">
                <span className="text-yellow-300 mr-2">✓</span>
                <span>AI Content Generation</span>
              </li>
              <li className="flex items-start">
                <span className="text-yellow-300 mr-2">✓</span>
                <span>Advanced Analytics</span>
              </li>
              <li className="flex items-start">
                <span className="text-yellow-300 mr-2">✓</span>
                <span>Priority Support</span>
              </li>
            </ul>
            <Link
              href="/signup"
              className="block text-center px-6 py-3 bg-yellow-400 text-gray-900 font-bold rounded-lg hover:bg-yellow-300 transition-colors"
            >
              Start Free Trial
            </Link>
          </div>
          
          {/* Agency Plan */}
          <div className="bg-white rounded-2xl shadow-2xl p-8 hover:scale-105 transition-transform">
            <h3 className="text-2xl font-bold mb-2">Agency</h3>
            <div className="text-4xl font-bold mb-6">
              $199<span className="text-xl text-gray-600">/mo</span>
            </div>
            <ul className="space-y-4 mb-8">
              <li className="flex items-start">
                <span className="text-green-600 mr-2">✓</span>
                <span>Everything in Pro</span>
              </li>
              <li className="flex items-start">
                <span className="text-green-600 mr-2">✓</span>
                <span>White Label Options</span>
              </li>
              <li className="flex items-start">
                <span className="text-green-600 mr-2">✓</span>
                <span>Client Management</span>
              </li>
              <li className="flex items-start">
                <span className="text-green-600 mr-2">✓</span>
                <span>Team Collaboration</span>
              </li>
              <li className="flex items-start">
                <span className="text-green-600 mr-2">✓</span>
                <span>Dedicated Support</span>
              </li>
            </ul>
            <Link
              href="/signup"
              className="block text-center px-6 py-3 bg-gradient-to-r from-blue-600 to-green-600 text-white font-bold rounded-lg hover:shadow-xl transition-all"
            >
              Contact Sales
            </Link>
          </div>
        </div>
      </div>
    </main>
  )
}
