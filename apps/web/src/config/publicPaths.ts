/**
 * Centralized Public Paths Configuration
 * Single source of truth for all authentication bypasses and UI conditionals
 */

export const PUBLIC_PATHS = [
  '/',
  '/login',
  '/signup',
  '/pricing',
  '/features',
  '/get-started',
  '/niches',
  '/do_not_click',
  '/f',  // Funnel pages
] as const

export type PublicPath = typeof PUBLIC_PATHS[number]

/**
 * Check if a pathname is public (no auth required)
 * Handles exact matches and path prefixes (e.g., /f/my-funnel)
 */
export function isPublicPath(pathname: string): boolean {
  return PUBLIC_PATHS.some(path => {
    if (path === '/') return pathname === '/'
    return pathname === path || pathname.startsWith(path + '/')
  })
}

/**
 * Check if pathname exactly matches a public path
 */
export function isExactPublicPath(pathname: string): boolean {
  return PUBLIC_PATHS.includes(pathname as PublicPath)
}
