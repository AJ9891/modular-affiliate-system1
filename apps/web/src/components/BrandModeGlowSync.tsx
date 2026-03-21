'use client'

import { useLayoutEffect } from 'react'
import { usePathname } from 'next/navigation'
import { useBrandMode } from '@/contexts/BrandModeContext'
import { getBrandModeTheme } from '@/lib/brand/brandModeTheme'

export function BrandModeGlowSync() {
  const { mode } = useBrandMode()
  const pathname = usePathname()

  useLayoutEffect(() => {
    const root = document.documentElement
    const isLaunchpadRoute = pathname === '/launchpad' || pathname.startsWith('/launchpad/')
    const effectiveMode = isLaunchpadRoute ? 'rocket' : mode
    const theme = getBrandModeTheme(effectiveMode)

    root.style.setProperty('--accent', theme.accent)
    root.style.setProperty('--accent-rgb', theme.accentRgb)
    root.style.setProperty('--accent-soft', theme.accentSoft)
    root.style.setProperty('--accent-hover', theme.accentHover)
    root.style.setProperty('--border-focus', theme.borderFocus)
  }, [mode, pathname])

  return null
}
