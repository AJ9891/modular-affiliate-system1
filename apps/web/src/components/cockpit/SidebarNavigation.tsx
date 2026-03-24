'use client'

import Link from 'next/link'
import type { ElementType } from 'react'
import { Rocket, LayoutDashboard, PenSquare, BarChart3, Mail, Link2, Users, FileStack, Settings, Shield, Compass, ChevronLeft, ChevronRight, X } from 'lucide-react'
import { cn } from '@/lib/utils'

interface SidebarNavigationProps {
  pathname: string
  collapsed: boolean
  mobileOpen: boolean
  isAdmin: boolean
  onboardingComplete: boolean
  onCloseMobile: () => void
  onToggleCollapse: () => void
}

interface NavItem {
  label: string
  href: string
  icon: ElementType
  adminOnly?: boolean
}

const MODULE_ITEMS: NavItem[] = [
  { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { label: 'Funnels', href: '/funnels', icon: PenSquare },
  { label: 'Analytics', href: '/analytics', icon: BarChart3 },
  { label: 'Email', href: '/email', icon: Mail },
  { label: 'Affiliates', href: '/affiliates', icon: Link2 },
  { label: 'Subscribers', href: '/subscribers', icon: Users },
  { label: 'Templates', href: '/templates', icon: FileStack },
  { label: 'Settings', href: '/settings', icon: Settings },
  { label: 'Admin', href: '/admin', icon: Shield, adminOnly: true },
]

function isActive(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`)
}

export default function SidebarNavigation({
  pathname,
  collapsed,
  mobileOpen,
  isAdmin,
  onboardingComplete,
  onCloseMobile,
  onToggleCollapse,
}: SidebarNavigationProps) {
  const visibleItems = MODULE_ITEMS.filter((item) => !item.adminOnly || isAdmin)

  return (
    <>
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 flex w-72 flex-col border-r border-[var(--border-elevated)] bg-[rgba(6,12,19,0.96)] backdrop-blur-xl transition-transform duration-300 lg:translate-x-0',
          mobileOpen ? 'translate-x-0' : '-translate-x-full',
          collapsed ? 'lg:w-20' : 'lg:w-72'
        )}
      >
        <div className="flex items-center justify-between border-b border-[var(--border-subtle)] px-4 py-4">
          <Link href="/cockpit" className="flex items-center gap-2 text-text-primary">
            <span className="rounded-lg border border-rocket-500/40 bg-[rgba(46,230,194,0.1)] p-1.5 text-rocket-500">
              <Rocket size={16} />
            </span>
            {!collapsed && <span className="text-sm font-semibold tracking-wide">Launchpad Cockpit</span>}
          </Link>

          <button
            type="button"
            onClick={onCloseMobile}
            className="rounded-md border border-[var(--border-subtle)] p-1 text-text-secondary hover:text-text-primary lg:hidden"
            aria-label="Close navigation"
          >
            <X size={14} />
          </button>
        </div>

        {!collapsed && !onboardingComplete && (
          <div className="border-b border-[var(--border-subtle)] px-4 py-3">
            <p className="text-xs uppercase tracking-system text-amber-200/85">Setup Incomplete</p>
            <p className="mt-1 text-sm text-text-secondary">Finish launchpad onboarding to unlock full workflows.</p>
            <Link href="/launchpad" className="mt-3 inline-flex rounded-lg border border-amber-300/35 px-3 py-1.5 text-xs text-amber-200 hover:bg-amber-500/10">
              Resume Launchpad
            </Link>
          </div>
        )}

        <nav className="flex-1 overflow-y-auto px-3 py-4">
          <p className={cn('mb-2 px-2 text-[11px] uppercase tracking-system text-text-secondary', collapsed && 'sr-only')}>Modules</p>
          <ul className="space-y-1">
            {visibleItems.map((item) => {
              const active = isActive(pathname, item.href)
              const Icon = item.icon

              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    title={collapsed ? item.label : undefined}
                    className={cn(
                      'flex min-h-[42px] items-center gap-3 rounded-lg border px-3 py-2 text-sm transition-colors',
                      active
                        ? 'border-rocket-500/50 bg-[rgba(46,230,194,0.14)] text-text-primary'
                        : 'border-transparent text-text-secondary hover:border-[var(--border-subtle)] hover:bg-[rgba(16,24,34,0.8)] hover:text-text-primary',
                      collapsed && 'justify-center'
                    )}
                  >
                    <Icon size={16} />
                    {!collapsed && <span>{item.label}</span>}
                  </Link>
                </li>
              )
            })}
          </ul>

          <div className="mt-5 border-t border-[var(--border-subtle)] pt-4">
            <Link
              href="/cockpit"
              className={cn(
                'flex min-h-[42px] items-center gap-3 rounded-lg border border-transparent px-3 py-2 text-sm text-text-secondary transition hover:border-[var(--border-subtle)] hover:text-text-primary',
                collapsed && 'justify-center'
              )}
              title={collapsed ? 'Cockpit Home' : undefined}
            >
              <Compass size={16} />
              {!collapsed && <span>Cockpit Home</span>}
            </Link>
          </div>
        </nav>

        <div className="hidden border-t border-[var(--border-subtle)] p-3 lg:block">
          <button
            type="button"
            onClick={onToggleCollapse}
            className="flex w-full items-center justify-center gap-2 rounded-lg border border-transparent px-3 py-2 text-sm text-text-secondary transition hover:border-[var(--border-subtle)] hover:text-text-primary"
            aria-label={collapsed ? 'Expand modules panel' : 'Collapse modules panel'}
          >
            {collapsed ? <ChevronRight size={15} /> : <ChevronLeft size={15} />}
            {!collapsed && <span>Collapse</span>}
          </button>
        </div>
      </aside>

      {mobileOpen && <div className="fixed inset-0 z-40 bg-black/55 lg:hidden" onClick={onCloseMobile} />}
    </>
  )
}
