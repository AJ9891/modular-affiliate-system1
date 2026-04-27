'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

export default function Niches() {
  const router = useRouter()
  const [activating, setActivating] = useState<string | null>(null)

  const activateNiche = async (nicheId: string, nicheName: string) => {
    setActivating(nicheId)
    
    try {
      const res = await fetch('/api/modules/activate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ moduleId: nicheId, moduleName: nicheName })
      })

      if (res.ok) {
        // Redirect to launchpad with the selected niche
        router.push(`/launchpad?niche=${nicheId}`)
      } else {
        // If not authenticated, redirect to signup
        router.push('/signup')
      }
    } catch (error) {
      console.error('Error activating niche:', error)
      router.push('/signup')
    }
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#020913] text-slate-100">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_20%,rgba(56,189,248,0.12),transparent_38%),radial-gradient(circle_at_80%_12%,rgba(34,211,238,0.1),transparent_35%),radial-gradient(circle_at_50%_78%,rgba(14,165,233,0.08),transparent_38%)]" />
        <div className="absolute inset-0 bg-gradient-to-b from-[#020913]/60 via-[#020913]/80 to-[#020913]/95" />
      </div>

      <div className="relative mx-auto max-w-6xl px-6 py-12">
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
          <div className="bg-white/5 backdrop-blur-xl rounded-2xl shadow-2xl p-8 hover:scale-105 transition-transform">
            <div className="text-5xl mb-4">💪</div>
            <h3 className="text-2xl font-bold mb-3">Health & Wellness</h3>
            <p className="text-slate-200 mb-4">
              Weight loss, fitness, nutrition, and healthy living offers
            </p>
            <ul className="space-y-2 mb-6 text-sm text-slate-300">
              <li>• Pre-made templates</li>
              <li>• Popular affiliate programs</li>
              <li>• Proven copy examples</li>
            </ul>
            <button
              onClick={() => activateNiche('health', 'Health & Wellness')}
              disabled={activating === 'health'}
              className="w-full px-6 py-3 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              {activating === 'health' ? 'Activating...' : 'Use This Niche'}
            </button>
          </div>

          <div className="bg-white/5 backdrop-blur-xl rounded-2xl shadow-2xl p-8 hover:scale-105 transition-transform">
            <div className="text-5xl mb-4">💰</div>
            <h3 className="text-2xl font-bold mb-3">Finance & Investing</h3>
            <p className="text-slate-200 mb-4">
              Make money, investing, crypto, and personal finance
            </p>
            <ul className="space-y-2 mb-6 text-sm text-slate-300">
              <li>• High commission offers</li>
              <li>• Trust-building templates</li>
              <li>• Compliance-ready copy</li>
            </ul>
            <button
              onClick={() => activateNiche('finance', 'Finance & Investing')}
              disabled={activating === 'finance'}
              className="w-full px-6 py-3 bg-green-600 text-white font-bold rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
            >
              {activating === 'finance' ? 'Activating...' : 'Use This Niche'}
            </button>
          </div>

          <div className="bg-white/5 backdrop-blur-xl rounded-2xl shadow-2xl p-8 hover:scale-105 transition-transform">
            <div className="text-5xl mb-4">💻</div>
            <h3 className="text-2xl font-bold mb-3">Technology & Software</h3>
            <p className="text-slate-200 mb-4">
              SaaS tools, apps, courses, and digital products
            </p>
            <ul className="space-y-2 mb-6 text-sm text-slate-300">
              <li>• Recurring commissions</li>
              <li>• Demo-focused funnels</li>
              <li>• Feature comparison pages</li>
            </ul>
            <button
              onClick={() => activateNiche('technology', 'Technology & Software')}
              disabled={activating === 'technology'}
              className="w-full px-6 py-3 bg-purple-600 text-white font-bold rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50"
            >
              {activating === 'technology' ? 'Activating...' : 'Use This Niche'}
            </button>
          </div>

          <div className="bg-white/5 backdrop-blur-xl rounded-2xl shadow-2xl p-8 hover:scale-105 transition-transform">
            <div className="text-5xl mb-4">❤️</div>
            <h3 className="text-2xl font-bold mb-3">Dating & Relationships</h3>
            <p className="text-slate-200 mb-4">
              Dating advice, relationship coaching, self-improvement
            </p>
            <ul className="space-y-2 mb-6 text-sm text-slate-300">
              <li>• Emotional copy templates</li>
              <li>• Story-driven funnels</li>
              <li>• High conversion rates</li>
            </ul>
            <button
              onClick={() => activateNiche('dating', 'Dating & Relationships')}
              disabled={activating === 'dating'}
              className="w-full px-6 py-3 bg-pink-600 text-white font-bold rounded-lg hover:bg-pink-700 transition-colors disabled:opacity-50"
            >
              {activating === 'dating' ? 'Activating...' : 'Use This Niche'}
            </button>
          </div>

          <div className="bg-white/5 backdrop-blur-xl rounded-2xl shadow-2xl p-8 hover:scale-105 transition-transform">
            <div className="text-5xl mb-4">🎓</div>
            <h3 className="text-2xl font-bold mb-3">Education & Courses</h3>
            <p className="text-slate-200 mb-4">
              Online courses, coaching programs, certifications
            </p>
            <ul className="space-y-2 mb-6 text-sm text-slate-300">
              <li>• Course preview funnels</li>
              <li>• Webinar templates</li>
              <li>• Authority-building pages</li>
            </ul>
            <button
              onClick={() => activateNiche('education', 'Education & Courses')}
              disabled={activating === 'education'}
              className="w-full px-6 py-3 bg-indigo-600 text-white font-bold rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50"
            >
              {activating === 'education' ? 'Activating...' : 'Use This Niche'}
            </button>
          </div>

          <div className="bg-white/5 backdrop-blur-xl rounded-2xl shadow-2xl p-8 hover:scale-105 transition-transform">
            <div className="text-5xl mb-4">✨</div>
            <h3 className="text-2xl font-bold mb-3">Custom Niche</h3>
            <p className="text-slate-200 mb-4">
              Build your own niche from scratch with our flexible system
            </p>
            <ul className="space-y-2 mb-6 text-sm text-slate-300">
              <li>• Full customization</li>
              <li>• Import your own offers</li>
              <li>• Unlimited flexibility</li>
            </ul>
            <button
              onClick={() => activateNiche('custom', 'Custom Niche')}
              disabled={activating === 'custom'}
              className="w-full px-6 py-3 bg-yellow-400 text-gray-900 font-bold rounded-lg hover:bg-yellow-300 transition-colors disabled:opacity-50"
            >
              {activating === 'custom' ? 'Activating...' : 'Build Custom'}
            </button>
          </div>
        </div>
      </div>
    </main>
  )
}
