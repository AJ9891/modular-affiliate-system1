'use client'

import StripeConnectSection from '@/components/StripeConnectSection'
import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import Link from 'next/link'

export default function Dashboard() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [teamData, setTeamData] = useState<any>(null)

  useEffect(() => {
    checkAuth()
    loadTeamData()
  }, [])

  const checkAuth = async () => {
    try {
      const response = await fetch('/api/auth/me')
      
      if (!response.ok) {
        router.push('/login')
        return
      }
      
      const data = await response.json()
      setUser(data.user)
    } catch (error) {
      router.push('/login')
    } finally {
      setLoading(false)
    }
  }

  const loadTeamData = async () => {
    try {
      const response = await fetch('/api/team')
      if (response.ok) {
        const data = await response.json()
        setTeamData(data)
      }
    } catch (error) {
      console.error('Failed to load team data:', error)
    }
  }

  const handleLogout = async () => {
    // Clear session and redirect to home
    router.push('/')
  }

  if (loading) {
    return (
      <div className="cockpit-shell page-flight-deck flex items-center justify-center">
        <div className="text-center">
          <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-b-2 border-rocket-500"></div>
          <p className="text-text-secondary">Loading flight deck...</p>
        </div>
      </div>
    )
  }

  return (
    <main className="cockpit-shell page-flight-deck">
      {/* Header */}
      <header className="px-6 pt-6 md:px-10">
        <div className="hud-strip mx-auto flex h-14 w-full max-w-7xl items-center justify-between px-5">
          <Link href="/dashboard" className="text-2xl font-semibold">
            <span className="text-text-primary">Launchpad</span><span className="text-rocket-500">4</span><span className="text-text-primary">Success</span>
          </Link>
          <div className="flex items-center gap-4">
            <span className="text-sm text-text-secondary">{user?.email}</span>
            <button
              onClick={handleLogout}
              className="hud-button-secondary px-4 py-2 text-sm"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="cockpit-container">
        <div className="mb-8">
          <h1 className="mb-2 text-4xl font-semibold text-text-primary">Flight Deck</h1>
          <p className="text-text-secondary">Mission status across your funnel systems.</p>
        </div>

        {/* Team Info Banner */}
        {teamData && (teamData.isOwner || teamData.memberOf?.length > 0) && (
          <div className="hud-card mb-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-2xl">👥</span>
                <div>
                  <p className="font-semibold text-text-primary">
                    {teamData.isOwner 
                      ? `Team: ${teamData.ownedTeam?.length || 0} member${teamData.ownedTeam?.length !== 1 ? 's' : ''}`
                      : `You're part of ${teamData.memberOf?.length || 0} team${teamData.memberOf?.length !== 1 ? 's' : ''}`
                    }
                  </p>
                  <p className="text-sm text-text-secondary">
                    {teamData.isOwner 
                      ? 'Manage your team members and permissions'
                      : 'Collaborate with your team on funnels'
                    }
                  </p>
                </div>
              </div>
              <Link
                href="/team"
                className="hud-button-primary px-4 py-2 text-sm"
              >
                Manage Team
              </Link>
            </div>
          </div>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="hud-card telemetry-pulse">
            <div className="mb-1 text-sm font-semibold uppercase tracking-system text-text-secondary">Total Funnels</div>
            <div className="text-3xl font-semibold text-text-primary">0</div>
          </div>
          
          <div className="hud-card telemetry-pulse">
            <div className="mb-1 text-sm font-semibold uppercase tracking-system text-text-secondary">Total Clicks</div>
            <div className="text-3xl font-semibold text-text-primary">0</div>
          </div>
          
          <div className="hud-card telemetry-pulse">
            <div className="mb-1 text-sm font-semibold uppercase tracking-system text-text-secondary">Conversions</div>
            <div className="text-3xl font-semibold text-text-primary">0</div>
          </div>
          
          <div className="hud-card telemetry-pulse">
            <div className="mb-1 text-sm font-semibold uppercase tracking-system text-text-secondary">Revenue</div>
            <div className="text-3xl font-semibold text-text-primary">$0</div>
          </div>
        </div>

        {/* Stripe Connect Section */}
        <StripeConnectSection />

        {/* Quick Actions */}
        <div className="hud-card mb-8">
          <h2 className="mb-6 text-2xl font-semibold text-text-primary">Core Systems</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Link
              href="/builder"
              className="hud-card-tight p-6 transition hover:border-rocket-500/40"
            >
              <div className="text-4xl mb-3">🎨</div>
              <h3 className="mb-2 text-lg font-semibold text-text-primary">Create New Funnel</h3>
              <p className="text-sm text-text-secondary">Start building a new affiliate funnel</p>
            </Link>
            
            <Link
              href="/offers"
              className="hud-card-tight p-6 transition hover:border-rocket-500/40"
            >
              <div className="text-4xl mb-3">💰</div>
              <h3 className="mb-2 text-lg font-semibold text-text-primary">Manage Offers</h3>
              <p className="text-sm text-text-secondary">Add and track affiliate offers</p>
            </Link>
            
            <Link
              href="/analytics"
              className="hud-card-tight p-6 transition hover:border-rocket-500/40"
            >
              <div className="text-4xl mb-3">📊</div>
              <h3 className="mb-2 text-lg font-semibold text-text-primary">View Analytics</h3>
              <p className="text-sm text-text-secondary">Track clicks and conversions</p>
            </Link>
            
            <Link
              href="/ai-generator"
              className="hud-card-tight p-6 transition hover:border-rocket-500/40"
            >
              <div className="text-4xl mb-3">🤖</div>
              <h3 className="mb-2 text-lg font-semibold text-text-primary">AI Content Generator</h3>
              <p className="text-sm text-text-secondary">Create copy with AI</p>
            </Link>
            
            <Link
              href="/niches"
              className="hud-card-tight p-6 transition hover:border-rocket-500/40"
            >
              <div className="text-4xl mb-3">🎯</div>
              <h3 className="mb-2 text-lg font-semibold text-text-primary">Browse Niches</h3>
              <p className="text-sm text-text-secondary">Explore pre-built niche modules</p>
            </Link>
            
            <Link
              href="/domains"
              className="hud-card-tight p-6 transition hover:border-rocket-500/40"
            >
              <div className="text-4xl mb-3">🌐</div>
              <h3 className="mb-2 text-lg font-semibold text-text-primary">Domain Settings</h3>
              <p className="text-sm text-text-secondary">Setup subdomain or custom domain</p>
            </Link>
          </div>
        </div>

        {/* Sendshark Email Automation CTA */}
        <div className="hud-card mb-8">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-3">
                <div className="text-5xl">📧</div>
                <h2 className="text-3xl font-semibold text-text-primary">Email Automation Included with Your Subscription</h2>
              </div>
              <div className="hud-card-tight mb-4">
                <p className="mb-1 text-xl font-semibold text-text-primary">
                  ✨ Great News! Sendshark is Already Included in Your Monthly Payment!
                </p>
                <p className="text-text-secondary">
                  Your Launchpad4Success subscription covers Sendshark - no extra charges. Just click below to activate your account!
                </p>
              </div>
              <p className="mb-4 max-w-3xl text-lg text-text-secondary">
                Automatically capture leads from your funnels and nurture them with powerful email sequences. 
                Sendshark integrates seamlessly with Launchpad4Success to turn visitors into customers!
              </p>
              <ul className="mb-6 space-y-2 text-text-secondary">
                <li className="flex items-center gap-2">
                  <span className="text-2xl">✅</span>
                  <span>Automatic lead capture from all your funnels</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-2xl">✅</span>
                  <span>Pre-built email automation sequences</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-2xl">✅</span>
                  <span>Professional email templates included</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-2xl">✅</span>
                  <span>Track opens, clicks, and conversions</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-2xl">💰</span>
                  <span className="font-semibold text-text-primary">Already paid for with your subscription - No additional cost!</span>
                </li>
              </ul>
              <a
                href="https://sendshark.com/launch/ecfunnel?id=Abby9891"
                target="_blank"
                rel="noopener noreferrer"
                className="hud-button-primary inline-block px-8 py-4"
              >
                Activate Your Sendshark Account (Included FREE) 🚀
              </a>
            </div>
            <div className="hidden lg:block text-9xl ml-8">
              🦈
            </div>
          </div>
        </div>

        {/* Empty State */}
        <div className="hud-card mt-8 text-center">
          <div className="text-6xl mb-4">🚀</div>
          <h3 className="mb-2 text-2xl font-semibold text-text-primary">Ready to Launch Your First Funnel?</h3>
          <p className="mx-auto mb-6 max-w-2xl text-text-secondary">
            You haven't created any funnels yet. Let's get started by choosing a niche and building your first high-converting funnel!
          </p>
          <Link
            href="/builder"
            className="hud-button-primary inline-block px-8 py-4"
          >
            Create Your First Funnel
          </Link>
        </div>
      </div>
    </main>
  )
}
