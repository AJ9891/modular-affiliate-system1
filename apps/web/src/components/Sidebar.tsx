'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

interface NavigationItem {
  name: string
  href: string
  icon: string
  isLaunchpad?: boolean
}

const launchpadItem: NavigationItem = { 
  name: 'Launchpad', 
  href: '/launchpad', 
  icon: '🚀',
  isLaunchpad: true
}

const regularNavigation: NavigationItem[] = [
  { name: 'Home', href: '/', icon: '🏠' },
  { name: 'Dashboard', href: '/dashboard', icon: '📊' },
  { name: 'Funnel Builder', href: '/builder', icon: '🎨' },
  { name: 'Visual Builder', href: '/visual-builder', icon: '✨' },
  { name: 'AI Generator', href: '/ai-generator', icon: '🤖' },
  { name: 'Downloads', href: '/downloads', icon: '📥' },
  { name: 'Analytics', href: '/analytics', icon: '📈' },
  { name: 'Niches', href: '/niches', icon: '🎯' },
  { name: 'Offers', href: '/offers', icon: '💰' },
  { name: 'Domains', href: '/domains', icon: '🌐' },
  { name: 'Team', href: '/team', icon: '👥' },
  { name: 'Pricing', href: '/pricing', icon: '💳' },
  { name: 'Features', href: '/features', icon: '⭐' },
]

export default function Sidebar() {
  const pathname = usePathname()
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [onboardingComplete, setOnboardingComplete] = useState(false)
  const [loading, setLoading] = useState(true)

  // Load onboarding status
  useEffect(() => {
    async function checkOnboardingStatus() {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
          setLoading(false)
          return
        }

        const { data: profile } = await supabase
          .from('users')
          .select('onboarding_complete')
          .eq('id', user.id)
          .single()

        setOnboardingComplete(profile?.onboarding_complete || false)
      } catch (error) {
        console.error('Error checking onboarding status:', error)
      } finally {
        setLoading(false)
      }
    }

    checkOnboardingStatus()
  }, [])

  // Load collapse state from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('sidebarCollapsed')
    if (saved !== null) {
      setIsCollapsed(saved === 'true')
    }
  }, [])

  // Update localStorage and body attribute when collapse state changes
  useEffect(() => {
    localStorage.setItem('sidebarCollapsed', String(isCollapsed))
    document.body.setAttribute('data-sidebar-collapsed', String(isCollapsed))
  }, [isCollapsed])

  // Build navigation array based on onboarding status
  const navigation = onboardingComplete
    ? [...regularNavigation, launchpadItem] // Launchpad at bottom
    : [launchpadItem, ...regularNavigation] // Launchpad at top

  const handleReOnboard = () => {
    setOnboardingComplete(false)
  }

  return (
    <>
      {/* Mobile menu button */}
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-brand-purple text-white rounded-lg shadow-lg"
      >
        {isCollapsed ? '☰' : '✕'}
      </button>

      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-0 h-full bg-white border-r-2 border-brand-purple/20 shadow-lg transition-all duration-300 z-40 ${
          isCollapsed ? '-translate-x-full lg:translate-x-0 lg:w-20' : 'translate-x-0 w-64'
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="p-4 border-b-2 border-brand-purple/20">
            <Link href="/" className="flex items-center gap-2">
              {!isCollapsed && (
                <span className="text-xl font-bold">
                  <span className="text-brand-purple">Launchpad</span><span className="text-brand-orange">4</span><span className="text-brand-purple">Success</span>
                </span>
              )}
              {isCollapsed && <span className="text-2xl">🚀</span>}
            </Link>
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto py-4">
            <ul className="space-y-1 px-2">
              {navigation.map((item) => {
                const isActive = pathname === item.href
                const isLaunchpadAtBottom = onboardingComplete && item.isLaunchpad
                
                return (
                  <li 
                    key={item.name}
                    className={`transition-all duration-500 ${
                      isLaunchpadAtBottom ? 'opacity-40 hover:opacity-100' : ''
                    }`}
                  >
                    <Link
                      href={item.href}
                      className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                        isActive
                          ? 'bg-brand-purple/10 text-brand-purple font-semibold border-l-4 border-brand-orange'
                          : 'text-brand-navy hover:bg-brand-cyan/10'
                      }`}
                      title={isCollapsed ? item.name : ''}
                    >
                      <span className="text-xl">{item.icon}</span>
                      {!isCollapsed && <span>{item.name}</span>}
                    </Link>
                  </li>
                )
              })}
            </ul>
            
            {/* Re-onboard Button (only show if onboarding is complete and sidebar is expanded) */}
            {onboardingComplete && !isCollapsed && (
              <div className="px-4 mt-4">
                <button
                  onClick={handleReOnboard}
                  className="w-full flex items-center justify-center gap-2 px-3 py-2 text-sm text-brand-purple/60 hover:text-brand-purple hover:bg-brand-purple/5 rounded-lg transition-colors border border-brand-purple/20"
                  title="Re-start the onboarding experience"
                >
                  <span>🔄</span>
                  <span>Re-onboard</span>
                </button>
              </div>
            )}
          </nav>

          {/* Collapse button (desktop) */}
          <div className="hidden lg:block p-4 border-t-2 border-brand-purple/20">
            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="w-full flex items-center justify-center gap-2 px-3 py-2 text-brand-purple hover:bg-brand-purple/10 rounded-lg transition-colors font-semibold"
              title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            >
              <span>{isCollapsed ? '→' : '←'}</span>
              {!isCollapsed && <span className="text-sm">Collapse</span>}
            </button>
          </div>
        </div>
      </aside>

      {/* Mobile overlay */}
      {!isCollapsed && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-30"
          onClick={() => setIsCollapsed(true)}
        />
      )}
    </>
  )
}
