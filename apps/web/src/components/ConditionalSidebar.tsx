'use client'

import { usePathname } from 'next/navigation'
import Sidebar from './Sidebar'
import { ReactNode } from 'react'

export default function ConditionalSidebar({ children }: { children?: ReactNode }) {
  const pathname = usePathname()
  
  // Don't show sidebar on homepage, login, signup, pricing, or special pages
  const hideSidebarOn = ['/', '/login', '/signup', '/pricing', '/features', '/get-started', '/do_not_click']
  
  const shouldHideSidebar = hideSidebarOn.includes(pathname)
  
  if (shouldHideSidebar) {
    return <>{children}</>
  }
  
  return (
    <>
      <Sidebar />
    </>
  )
}
