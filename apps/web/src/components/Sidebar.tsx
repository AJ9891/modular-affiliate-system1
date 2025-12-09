'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'

const navigation = [
  { name: 'Home', href: '/', icon: '🏠' },
  { name: 'Dashboard', href: '/dashboard', icon: '📊' },
  { name: 'Launchpad', href: '/launchpad', icon: '🚀' },
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

  return (
    <>
      {/* Mobile menu button */}
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-purple-600 text-white rounded-lg shadow-lg"
      >
        {isCollapsed ? '☰' : '✕'}
      </button>

      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-0 h-full bg-white border-r border-gray-200 shadow-lg transition-all duration-300 z-40 ${
          isCollapsed ? '-translate-x-full lg:translate-x-0 lg:w-20' : 'translate-x-0 w-64'
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="p-4 border-b border-gray-200">
            <Link href="/" className="flex items-center gap-2">
              {!isCollapsed && (
                <span className="text-xl font-bold text-purple-600">
                  Launchpad<span className="text-yellow-500">4</span>Success
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
                return (
                  <li key={item.name}>
                    <Link
                      href={item.href}
                      className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                        isActive
                          ? 'bg-purple-100 text-purple-700 font-semibold'
                          : 'text-gray-700 hover:bg-gray-100'
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
          </nav>

          {/* Collapse button (desktop) */}
          <div className="hidden lg:block p-4 border-t border-gray-200">
            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="w-full flex items-center justify-center gap-2 px-3 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
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
