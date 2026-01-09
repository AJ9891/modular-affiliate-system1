"use client"

import { useEffect } from "react"
import { personalityTheme, type Personality } from "@/lib/theme/personalityTheme"

export function PersonalityThemeProvider({
  personality,
  children,
}: {
  personality: Personality
  children: React.ReactNode
}) {
  useEffect(() => {
    const theme = personalityTheme[personality]

    const root = document.documentElement
    root.style.setProperty("--accent", theme.accent)
    root.style.setProperty("--accent-soft", theme.accentSoft)

    // Clean up on unmount
    return () => {
      // Reset to default anchor theme
      const defaultTheme = personalityTheme.anchor
      root.style.setProperty("--accent", defaultTheme.accent)
      root.style.setProperty("--accent-soft", defaultTheme.accentSoft)
    }
  }, [personality])

  return <>{children}</>
}