/**
 * Route-Based Personality Overrides
 * 
 * WARNING: Use sparingly. Personality should come from user preference.
 * 
 * This is for edge cases where specific flows need specific personalities:
 * - Onboarding (always optimistic)
 * - Marketing pages (varies by campaign)
 * - Admin tools (always direct)
 */

import type { BrandMode } from './types'

/**
 * Route-based personality rules
 * 
 * These override user brand_mode for specific routes
 */
const ROUTE_PERSONALITY_MAP: Record<string, BrandMode> = {
  '/onboarding': 'rocket_future',
  '/launchpad': 'rocket_future',
}

/**
 * Get personality for a specific route
 * 
 * Falls back to user's brand_mode if no route override exists
 * 
 * @param pathname - The current route path
 * @param userBrandMode - User's preferred brand mode
 * @returns The brand mode to use for this route
 */
export function getRoutePersonality(
  pathname: string,
  userBrandMode?: BrandMode | null
): BrandMode {
  // Check for exact match
  if (pathname in ROUTE_PERSONALITY_MAP) {
    return ROUTE_PERSONALITY_MAP[pathname]
  }
  
  // Check for prefix match
  for (const [route, personality] of Object.entries(ROUTE_PERSONALITY_MAP)) {
    if (pathname.startsWith(route)) {
      return personality
    }
  }
  
  // Fall back to user preference
  return userBrandMode || 'anti_guru'
}

/**
 * Check if route has personality override
 */
export function hasRouteOverride(pathname: string): boolean {
  for (const route of Object.keys(ROUTE_PERSONALITY_MAP)) {
    if (pathname === route || pathname.startsWith(route)) {
      return true
    }
  }
  return false
}

/**
 * Get all route overrides (for debugging)
 */
export function getRouteOverrides(): Record<string, BrandMode> {
  return { ...ROUTE_PERSONALITY_MAP }
}
