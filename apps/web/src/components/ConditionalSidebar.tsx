'use client'

import { usePathname } from 'next/navigation'
import { ReactNode } from 'react'
import { isPublicPath } from '@/config/publicPaths'
import CockpitLayout from '@/components/cockpit/CockpitLayout'

export default function ConditionalSidebar({ children }: { children?: ReactNode }) {
  const pathname = usePathname()

  // Don't show sidebar on public pages or on Launchpad onboarding route.
  const shouldHideSidebar = isPublicPath(pathname) || pathname === '/launchpad' || pathname === '/welcome'

  if (shouldHideSidebar) {
    return <>{children}</>
  }

  return <CockpitLayout>{children}</CockpitLayout>
}
