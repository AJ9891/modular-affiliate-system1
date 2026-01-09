import { type Personality } from "@/lib/theme/personalityTheme"

/**
 * Determine personality based on pathname or context
 */
export function getPersonalityContext(pathname?: string): Personality {
  if (typeof window !== "undefined" && !pathname) {
    pathname = window.location.pathname
  }

  // Onboarding and get-started pages always use rocket
  if (pathname?.includes('/get-started') || 
      pathname?.includes('/onboarding') ||
      pathname?.includes('/signup') ||
      pathname?.includes('/welcome')) {
    return "rocket"
  }

  // AI-related pages use glitch
  if (pathname?.includes('/ai-generator') ||
      pathname?.includes('/chat') ||
      pathname?.includes('/ai-')) {
    return "glitch"
  }

  // Analytics and boost-related pages use boost
  if (pathname?.includes('/analytics') ||
      pathname?.includes('/dashboard') ||
      pathname?.includes('/performance')) {
    return "boost"
  }

  // Default to anchor (compliance, stable)
  return "anchor"
}

/**
 * Get personality from server-side context (for app router)
 */
export function getServerPersonality(pathname: string): Personality {
  return getPersonalityContext(pathname)
}