export type Personality = "anchor" | "glitch" | "boost" | "rocket"

export const personalityTheme: Record<Personality, {
  accent: string
  accentSoft: string
}> = {
  anchor: {
    accent: "#7c8cff",
    accentSoft: "rgba(124, 140, 255, 0.15)",
  },
  glitch: {
    accent: "#ff6b6b",
    accentSoft: "rgba(255, 107, 107, 0.15)",
  },
  boost: {
    accent: "#22d3ee",
    accentSoft: "rgba(34, 211, 238, 0.15)",
  },
  rocket: {
    accent: "#fbbf24",
    accentSoft: "rgba(251, 191, 36, 0.2)",
  },
}

/**
 * Get personality theme colors
 */
export function getPersonalityTheme(personality: Personality) {
  return personalityTheme[personality]
}

/**
 * Apply personality theme to document root
 */
export function applyPersonalityTheme(personality: Personality) {
  const theme = personalityTheme[personality]
  const root = document.documentElement
  
  root.style.setProperty("--accent", theme.accent)
  root.style.setProperty("--accent-soft", theme.accentSoft)
}