'use client'

import { usePathname } from 'next/navigation'
import Sidebar from './Sidebar'
import { ReactNode } from 'react'
import { isExactPublicPath } from '@/config/publicPaths'

export default function ConditionalSidebar({ children }: { children?: ReactNode }) {
  const pathname = usePathname()

  // Don't show sidebar on public pages
  const shouldHideSidebar = isExactPublicPath(pathname)

  if (shouldHideSidebar) {
    return <>{children}</>
  }

  return (
    <>
      <Sidebar />
    </>
  )
}
