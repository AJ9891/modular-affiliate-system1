export type Personality = "anchor" | "glitch" | "boost" | "rocket"

export const personalityTheme: Record<Personality, {
  accent: string
  accentSoft: string
  label: string
  description: string
}> = {
  anchor: {
    accent: "#7c8cff",
    accentSoft: "rgba(124, 140, 255, 0.15)",
    label: "Anchor",
    description: "Calm, professional, trustworthy",
  },
  glitch: {
    accent: "#ff6b6b",
    accentSoft: "rgba(255, 107, 107, 0.15)",
    label: "Glitch",
    description: "Bold, direct, high-energy",
  },
  boost: {
    accent: "#22d3ee",
    accentSoft: "rgba(34, 211, 238, 0.15)",
    label: "Boost",
    description: "Modern, dynamic, forward-thinking",
  },
  rocket: {
    accent: "#fbbf24",
    accentSoft: "rgba(251, 191, 36, 0.2)",
    label: "Rocket",
    description: "Ambitious, growth-focused, energetic",
  },
}

export function getPersonalityColor(personality: Personality, variant: "accent" | "soft" = "accent"): string {
  return personalityTheme[personality][variant === "accent" ? "accent" : "accentSoft"]
}