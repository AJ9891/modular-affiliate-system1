'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useEffect, useMemo, useState } from 'react'
import type { LucideIcon } from 'lucide-react'
import {
  LayoutDashboard,
  Radar,
  PenSquare,
  Sparkles,
  FileStack,
  BarChart3,
  Mail,
  Users,
  Link2,
  Gift,
  Download,
  Globe,
  UserCog,
  Settings,
  Shield,
  Rocket,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Menu,
  X,
} from 'lucide-react'
import { supabase } from '@/lib/supabase'

interface NavigationItem {
  name: string
  href: string
  icon: LucideIcon
  requiresAdmin?: boolean
  matchesPrefix?: boolean
}

interface NavigationSection {
  name: string
  items: NavigationItem[]
}

const ONBOARDING_COMPLETE = 8

const sections: NavigationSection[] = [
  {
    name: 'Build',
    items: [
      { name: 'Cockpit', href: '/cockpit', icon: Radar },
      { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
      { name: 'Funnels', href: '/funnels', icon: PenSquare },
      { name: 'AI Link Builder', href: '/link-funnel', icon: Sparkles },
      { name: 'Templates', href: '/templates', icon: FileStack },
    ],
  },
  {
    name: 'Grow',
    items: [
      { name: 'Analytics', href: '/analytics', icon: BarChart3 },
      { name: 'Email', href: '/email', icon: Mail },
      { name: 'Subscribers', href: '/subscribers', icon: Users },
      { name: 'Affiliates', href: '/affiliates', icon: Link2 },
      { name: 'Offers', href: '/offers', icon: Gift },
      { name: 'Downloads', href: '/downloads', icon: Download },
    ],
  },
  {
    name: 'Operate',
    items: [
      { name: 'Domains', href: '/domains', icon: Globe },
      { name: 'Team', href: '/team', icon: UserCog },
      { name: 'Settings', href: '/settings', icon: Settings },
      { name: 'Launchpad', href: '/launchpad', icon: Rocket, matchesPrefix: false },
      { name: 'Admin', href: '/admin', icon: Shield, requiresAdmin: true },
    ],
  },
]

export default function Sidebar() {
  const router = useRouter()
  const pathname = usePathname()

  const [desktopCollapsed, setDesktopCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [loadingProfile, setLoadingProfile] = useState(true)
  const [onboardingComplete, setOnboardingComplete] = useState(false)
  const [onboardingStep, setOnboardingStep] = useState(0)
  const [isAdmin, setIsAdmin] = useState(false)
  const [isSigningOut, setIsSigningOut] = useState(false)

  useEffect(() => {
    const saved = localStorage.getItem('sidebarCollapsed')
    if (saved !== null) {
      setDesktopCollapsed(saved === 'true')
    }
  }, [])

  useEffect(() => {
    localStorage.setItem('sidebarCollapsed', String(desktopCollapsed))
    document.body.setAttribute('data-sidebar-collapsed', String(desktopCollapsed))
  }, [desktopCollapsed])

  useEffect(() => {
    setMobileOpen(false)
  }, [pathname])

  useEffect(() => {
    async function loadProfileState() {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser()

        if (!user) {
          setLoadingProfile(false)
          return
        }

        const { data: profile } = await supabase
          .from('users')
          .select('onboarding_complete, onboarding_step, is_admin')
          .eq('id', user.id)
          .maybeSingle()

        const admin = Boolean(profile?.is_admin)
        setOnboardingComplete(Boolean(profile?.onboarding_complete) || admin)
        setOnboardingStep(admin ? ONBOARDING_COMPLETE : Number(profile?.onboarding_step ?? 0))
        setIsAdmin(admin)
      } catch (error) {
        console.error('Error checking profile state for sidebar:', error)
      } finally {
        setLoadingProfile(false)
      }
    }

    loadProfileState()
  }, [])

  const visibleSections = useMemo(() => {
    return sections.map((section) => ({
      ...section,
      items: section.items.filter((item) => !item.requiresAdmin || isAdmin),
    }))
  }, [isAdmin])

  const isItemActive = (item: NavigationItem) => {
    if (pathname === item.href) return true
    if (item.matchesPrefix === false) return false
    return pathname.startsWith(`${item.href}/`)
  }

  const handleSignOut = async () => {
    if (isSigningOut) return

    setIsSigningOut(true)
    try {
      await supabase.auth.signOut()
      router.push('/login')
    } finally {
      setIsSigningOut(false)
    }
  }

  const onboardingProgress = Math.min(100, Math.round((onboardingStep / ONBOARDING_COMPLETE) * 100))

  return (
    <>
      <button
        type="button"
        onClick={() => setMobileOpen((open) => !open)}
        className="fixed left-4 top-4 z-50 rounded-lg border border-[var(--border-elevated)] bg-[rgba(8,14,21,0.88)] p-2 text-text-primary shadow-lg backdrop-blur lg:hidden"
        aria-label={mobileOpen ? 'Close navigation' : 'Open navigation'}
      >
        {mobileOpen ? <X size={18} /> : <Menu size={18} />}
      </button>

      <aside
        className={`fixed inset-y-0 left-0 z-40 flex flex-col border-r border-[var(--border-elevated)] bg-[rgba(5,10,15,0.94)] text-text-primary shadow-2xl backdrop-blur-xl transition-[width,transform] duration-300 ease-smooth ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        } ${desktopCollapsed ? 'lg:w-[5.5rem]' : 'lg:w-[17rem]'} w-[17rem]`}
      >
        <div className="border-b border-[var(--border-subtle)] px-4 py-4">
          <Link href="/cockpit" className="flex items-center gap-2">
            <div className="rounded-lg border border-rocket-500/45 bg-[rgba(46,230,194,0.12)] p-1.5 text-rocket-500">
              <Rocket size={16} />
            </div>
            {!desktopCollapsed && (
              <span className="text-sm font-semibold tracking-wide text-text-primary">Launchpad 4 Success</span>
            )}
          </Link>
        </div>

        {!loadingProfile && !onboardingComplete && !desktopCollapsed && (
          <div className="border-b border-[var(--border-subtle)] px-4 py-3">
            <p className="text-xs uppercase tracking-system text-text-secondary">Onboarding</p>
            <p className="mt-1 text-sm text-text-primary">Complete setup to unlock all systems.</p>
            <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-[rgba(10,16,24,0.72)]">
              <div className="h-full bg-gradient-to-r from-rocket-600 to-rocket-500" style={{ width: `${onboardingProgress}%` }} />
            </div>
            <button
              type="button"
              onClick={() => router.push('/launchpad')}
              className="mt-3 w-full rounded-lg border border-rocket-500/45 bg-[rgba(46,230,194,0.12)] px-3 py-2 text-sm font-medium text-rocket-500 transition hover:bg-[rgba(46,230,194,0.2)]"
            >
              Resume Launchpad
            </button>
          </div>
        )}

        <nav className="flex-1 overflow-y-auto px-2 py-3">
          {visibleSections.map((section) => (
            <div key={section.name} className="mb-4">
              {!desktopCollapsed && (
                <p className="px-2 pb-1 text-[11px] uppercase tracking-system text-text-secondary/80">{section.name}</p>
              )}
              <ul className="space-y-1">
                {section.items.map((item) => {
                  const active = isItemActive(item)
                  const Icon = item.icon

                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        className={`flex min-h-[40px] items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors ${
                          active
                            ? 'border border-rocket-500/45 bg-[rgba(46,230,194,0.14)] text-text-primary'
                            : 'border border-transparent text-text-secondary hover:border-[var(--border-subtle)] hover:bg-[rgba(16,24,34,0.8)] hover:text-text-primary'
                        }`}
                        title={desktopCollapsed ? item.name : undefined}
                      >
                        <Icon size={16} />
                        {!desktopCollapsed && <span>{item.name}</span>}
                      </Link>
                    </li>
                  )
                })}
              </ul>
            </div>
          ))}
        </nav>

        <div className="border-t border-[var(--border-subtle)] p-3">
          <button
            type="button"
            onClick={handleSignOut}
            disabled={isSigningOut}
            className="flex w-full items-center justify-center gap-2 rounded-lg border border-[var(--border-elevated)] px-3 py-2 text-sm text-text-secondary transition hover:border-[var(--border-focus)] hover:text-text-primary disabled:opacity-60"
            title={desktopCollapsed ? 'Sign out' : undefined}
          >
            <LogOut size={16} />
            {!desktopCollapsed && <span>{isSigningOut ? 'Signing out...' : 'Sign out'}</span>}
          </button>

          <button
            type="button"
            onClick={() => setDesktopCollapsed((collapsed) => !collapsed)}
            className="mt-2 hidden w-full items-center justify-center gap-2 rounded-lg border border-transparent px-3 py-2 text-sm text-text-secondary transition hover:border-[var(--border-subtle)] hover:text-text-primary lg:flex"
            title={desktopCollapsed ? 'Expand navigation' : 'Collapse navigation'}
          >
            {desktopCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
            {!desktopCollapsed && <span>Collapse</span>}
          </button>
        </div>
      </aside>

      {mobileOpen && <div className="fixed inset-0 z-30 bg-black/55 lg:hidden" onClick={() => setMobileOpen(false)} />}
    </>
  )
}
