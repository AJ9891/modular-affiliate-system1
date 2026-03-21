'use client'

import { usePathname } from 'next/navigation'
import { ReactNode, useEffect, useState } from 'react'
import { isExactPublicPath } from '@/config/publicPaths'

export default function ConditionalWrapper({ children }: { children: ReactNode }) {
  const pathname = usePathname()
  const [isCollapsed, setIsCollapsed] = useState(false)

  // Don't add sidebar offset on public pages or Launchpad onboarding route.
  const shouldAddMargin = !isExactPublicPath(pathname) && pathname !== '/launchpad' && pathname !== '/welcome'

  // Listen for sidebar collapse state changes
  useEffect(() => {
    // Check initial state
    const saved = localStorage.getItem('sidebarCollapsed')
    if (saved !== null) {
      setIsCollapsed(saved === 'true')
    }

    // Listen for changes via body attribute
    const observer = new MutationObserver(() => {
      const collapsed = document.body.getAttribute('data-sidebar-collapsed') === 'true'
      setIsCollapsed(collapsed)
    })

    observer.observe(document.body, {
      attributes: true,
      attributeFilter: ['data-sidebar-collapsed']
    })

    return () => observer.disconnect()
  }, [])
  
  if (shouldAddMargin) {
    return (
      <div className={`transition-all duration-300 ${
        isCollapsed ? 'lg:ml-20' : 'lg:ml-64'
      } min-h-screen`}>
        {children}
      </div>
    )
  }
  
  return <>{children}</>
}
