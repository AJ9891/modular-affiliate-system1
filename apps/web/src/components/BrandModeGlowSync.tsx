'use client'

import { useLayoutEffect } from 'react'
import { useBrandMode } from '@/contexts/BrandModeContext'
import { getBrandModeTheme } from '@/lib/brand/brandModeTheme'

export function BrandModeGlowSync() {
  const { mode } = useBrandMode()

  useLayoutEffect(() => {
    const root = document.documentElement
    const theme = getBrandModeTheme(mode)

    root.style.setProperty('--accent', theme.accent)
    root.style.setProperty('--accent-rgb', theme.accentRgb)
    root.style.setProperty('--accent-soft', theme.accentSoft)
    root.style.setProperty('--accent-hover', theme.accentHover)
    root.style.setProperty('--border-focus', theme.borderFocus)
  }, [mode])

  return null
}
