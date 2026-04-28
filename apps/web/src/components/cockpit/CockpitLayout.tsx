'use client'

import { ReactNode, useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import { Menu, SlidersHorizontal } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import SidebarNavigation from './SidebarNavigation'
import ContextPanel from './ContextPanel'
import { cn } from '@/lib/utils'
import { hasAdminAccess } from '@/lib/admin-access'

const SIDEBAR_COLLAPSE_KEY = 'cockpit_sidebar_collapsed'
const CONTEXT_COLLAPSE_KEY = 'cockpit_context_collapsed'
const ONBOARDING_COMPLETE = 8

export default function CockpitLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname()

  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [contextCollapsed, setContextCollapsed] = useState(false)
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false)
  const [mobileContextOpen, setMobileContextOpen] = useState(false)
  const [isAdmin, setIsAdmin] = useState(false)
  const [onboardingComplete, setOnboardingComplete] = useState(true)

  useEffect(() => {
    const storedSidebar = localStorage.getItem(SIDEBAR_COLLAPSE_KEY)
    if (storedSidebar !== null) {
      setSidebarCollapsed(storedSidebar === '1')
    }

    const storedContext = localStorage.getItem(CONTEXT_COLLAPSE_KEY)
    if (storedContext !== null) {
      setContextCollapsed(storedContext === '1')
    }
  }, [])

  useEffect(() => {
    localStorage.setItem(SIDEBAR_COLLAPSE_KEY, sidebarCollapsed ? '1' : '0')
  }, [sidebarCollapsed])

  useEffect(() => {
    localStorage.setItem(CONTEXT_COLLAPSE_KEY, contextCollapsed ? '1' : '0')
  }, [contextCollapsed])

  useEffect(() => {
    setMobileSidebarOpen(false)
    setMobileContextOpen(false)
  }, [pathname])

  useEffect(() => {
    async function loadRoleState() {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser()

        if (!user) return

        const { data: profile } = await supabase
          .from('users')
          .select('is_admin, role, onboarding_complete, onboarding_step')
          .eq('id', user.id)
          .maybeSingle()

        const admin = hasAdminAccess(profile)
        const onboardingStep = Number(profile?.onboarding_step ?? 0)
        const isOnboardingComplete = Boolean(profile?.onboarding_complete) || onboardingStep >= ONBOARDING_COMPLETE
        setIsAdmin(admin)
        setOnboardingComplete(isOnboardingComplete || admin)
      } catch (error) {
        console.error('Failed loading cockpit role state:', error)
      }
    }

    loadRoleState()
  }, [])

  return (
    <div className="relative min-h-screen">
      <div className="fixed left-4 top-4 z-[60] flex gap-2 lg:hidden">
        <button
          type="button"
          onClick={() => setMobileSidebarOpen(true)}
          className="rounded-lg border border-[var(--border-elevated)] bg-[rgba(7,14,22,0.9)] p-2 text-text-primary shadow-lg backdrop-blur"
          aria-label="Open modules panel"
        >
          <Menu size={16} />
        </button>
        <button
          type="button"
          onClick={() => {
            setContextCollapsed(false)
            setMobileContextOpen(true)
          }}
          className="rounded-lg border border-[var(--border-elevated)] bg-[rgba(7,14,22,0.9)] p-2 text-text-primary shadow-lg backdrop-blur"
          aria-label="Open context panel"
        >
          <SlidersHorizontal size={16} />
        </button>
      </div>

      <SidebarNavigation
        pathname={pathname}
        collapsed={sidebarCollapsed}
        mobileOpen={mobileSidebarOpen}
        isAdmin={isAdmin}
        onboardingComplete={onboardingComplete}
        onCloseMobile={() => setMobileSidebarOpen(false)}
        onToggleCollapse={() => setSidebarCollapsed((value) => !value)}
      />

      <ContextPanel
        pathname={pathname}
        collapsed={contextCollapsed}
        mobileOpen={mobileContextOpen}
        onCloseMobile={() => setMobileContextOpen(false)}
        onToggleCollapsed={() => setContextCollapsed((value) => !value)}
      />

      <div
        className={cn(
          'min-h-screen transition-[padding] duration-300 ease-smooth',
          sidebarCollapsed ? 'lg:pl-20' : 'lg:pl-72',
          contextCollapsed ? 'lg:pr-0' : 'lg:pr-80'
        )}
      >
        {children}
      </div>
    </div>
  )
}
