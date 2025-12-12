import Link from 'next/link'

export default function Pricing() {
  return (
    <main className="min-h-screen bg-brand-gradient launch-pad p-8">
      <div className="max-w-6xl mx-auto">
        <Link href="/" className="text-white hover:text-brand-cyan mb-8 inline-block transition-colors">
          ← Back to Home
        </Link>
        
        <h1 className="text-5xl font-bold text-white text-center mb-4">
          Simple, Transparent Pricing
        </h1>
        <p className="text-xl text-white text-center mb-4">
          Choose the plan that fits your goals
        </p>
        <div className="bg-gradient-to-r from-orange-500 via-red-500 to-yellow-500 text-white text-center py-4 px-6 rounded-xl mb-12 max-w-3xl mx-auto border-2 border-brand-orange/50 shadow-xl">
          <p className="text-2xl font-bold mb-1">🦈 Sendshark Email Automation INCLUDED!</p>
          <p className="text-lg">All plans include Sendshark at no extra cost - $97/mo value FREE! 🎉</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Starter Plan */}
          <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl p-8 hover:shadow-brand-cyan/20 transition-all border-2 border-brand-purple/20">
            <h3 className="text-2xl font-bold mb-2 text-brand-purple">Starter</h3>
            <div className="text-4xl font-bold mb-6 text-brand-navy">
              $30<span className="text-xl text-gray-600">/mo</span>
            </div>
            <ul className="space-y-4 mb-8">
              <li className="flex items-start">
                <span className="text-brand-cyan mr-2">✓</span>
                <span className="text-brand-purple">1 Active Funnel</span>
              </li>
              <li className="flex items-start">
                <span className="text-brand-cyan mr-2">✓</span>
                <span className="text-brand-purple">Basic Templates</span>
              </li>
              <li className="flex items-start">
                <span className="text-brand-cyan mr-2">✓</span>
                <span className="text-brand-purple">Analytics Dashboard</span>
              </li>
              <li className="flex items-start">
                <span className="text-brand-cyan mr-2">✓</span>
                <span className="text-brand-purple">Email Support</span>
              </li>
              <li className="flex items-start">
                <span className="text-brand-cyan mr-2">✓</span>
                <span className="text-brand-purple">Subdomain: yourname.launchpad4success.com</span>
              </li>
              <li className="flex items-start">
                <span className="text-orange-600 mr-2 text-xl">🦈</span>
                <span className="font-bold text-brand-purple">Sendshark Email Automation</span>
              </li>
            </ul>
            <Link
              href="/checkout?plan=starter"
              className="block text-center px-6 py-3 bg-brand-navy text-white font-bold rounded-lg hover:bg-brand-purple transition-colors shadow-lg"
            >
              Get Started 🚀
            </Link>
          </div>
          
          {/* Pro Plan */}
          <div className="bg-gradient-to-br from-brand-purple to-brand-navy text-white rounded-2xl shadow-2xl p-8 transform scale-105 border-2 border-brand-orange relative">
            <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-brand-orange text-white px-4 py-1 rounded-full text-sm font-bold shadow-lg">
              POPULAR 🚀
            </div>
            <h3 className="text-2xl font-bold mb-2">Pro</h3>
            <div className="text-4xl font-bold mb-6">
              $45<span className="text-xl opacity-80">/mo</span>
            </div>
            <ul className="space-y-4 mb-8">
              <li className="flex items-start">
                <span className="text-brand-cyan mr-2">✓</span>
                <span>Unlimited Funnels</span>
              </li>
              <li className="flex items-start">
                <span className="text-brand-cyan mr-2">✓</span>
                <span>Premium Templates</span>
              </li>
              <li className="flex items-start">
                <span className="text-brand-cyan mr-2">✓</span>
                <span>AI Content Generation</span>
              </li>
              <li className="flex items-start">
                <span className="text-brand-cyan mr-2">✓</span>
                <span>Advanced Analytics</span>
              </li>
              <li className="flex items-start">
                <span className="text-brand-cyan mr-2">✓</span>
                <span>Priority Support</span>
              </li>
              <li className="flex items-start">
                <span className="text-brand-cyan mr-2">✓</span>
                <span>Subdomain: yourname.launchpad4success.com</span>
              </li>
              <li className="flex items-start">
                <span className="text-brand-orange mr-2 text-xl">🦈</span>
                <span className="font-bold">Sendshark Email Automation</span>
              </li>
            </ul>
            <Link
              href="/checkout?plan=pro"
              className="block text-center px-6 py-3 btn-launch"
            >
              Get Started 🚀
            </Link>
          </div>
          
          {/* Agency Plan */}
          <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl p-8 hover:shadow-brand-cyan/20 transition-all border-2 border-brand-purple/20">
            <h3 className="text-2xl font-bold mb-2 text-brand-purple">Agency</h3>
            <div className="text-4xl font-bold mb-6 text-brand-navy">
              $60<span className="text-xl text-gray-600">/mo</span>
            </div>
            <ul className="space-y-4 mb-8">
              <li className="flex items-start">
                <span className="text-brand-cyan mr-2">✓</span>
                <span className="text-brand-purple">Everything in Pro</span>
              </li>
              <li className="flex items-start">
                <span className="text-brand-cyan mr-2">✓</span>
                <span className="text-brand-purple">White Label Options</span>
              </li>
              <li className="flex items-start">
                <span className="text-brand-cyan mr-2">✓</span>
                <span className="text-brand-purple">Client Management</span>
              </li>
              <li className="flex items-start">
                <span className="text-brand-cyan mr-2">✓</span>
                <span className="text-brand-purple">Team Collaboration</span>
              </li>
              <li className="flex items-start">
                <span className="text-brand-cyan mr-2">✓</span>
                <span className="text-brand-purple">API Access</span>
              </li>
              <li className="flex items-start">
                <span className="text-brand-orange mr-2 font-bold">🌐</span>
                <span className="font-bold text-brand-purple">Custom Domain Setup Included</span>
              </li>
              <li className="flex items-start">
                <span className="text-brand-cyan mr-2">✓</span>
                <span className="text-brand-purple">Dedicated Support</span>
              </li>
            </ul>
            <Link
              href="/checkout?plan=agency"
              className="block text-center px-6 py-3 bg-gradient-to-r from-brand-purple to-brand-navy text-white font-bold rounded-lg hover:shadow-xl transition-all"
            >
              Get Started 🚀
            </Link>
          </div>
        </div>
      </div>
    </main>
  )
}
