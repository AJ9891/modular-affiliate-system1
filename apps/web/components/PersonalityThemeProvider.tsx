"use client"

import { useEffect } from "react"
import { personalityTheme, Personality } from "@/lib/theme/personalityTheme"

interface PersonalityThemeProviderProps {
  personality: Personality
  children: React.ReactNode
}

export function PersonalityThemeProvider({
  personality,
  children,
}: PersonalityThemeProviderProps) {
  useEffect(() => {
    const theme = personalityTheme[personality]

    const root = document.documentElement
    root.style.setProperty("--accent", theme.accent)
    root.style.setProperty("--accent-soft", theme.accentSoft)

    // Add personality data attribute for CSS selectors if needed
    root.setAttribute("data-personality", personality)
  }, [personality])

  return <>{children}</>
}