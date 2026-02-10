import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import {
  parseSubdomain,
  createSubdomainMiddlewareClient,
  getSubdomainRedirectUrl,
} from './lib/subdomain-auth'
import { addSecurityHeaders } from './lib/security'
import { isPublicPath } from './config/publicPaths'

export async function proxy(req: NextRequest) {
  // Allow public pages without auth and still attach security headers
  if (isPublicPath(req.nextUrl.pathname)) {
    const res = NextResponse.next()
    return addSecurityHeaders(res)
  }

  const res = NextResponse.next()
  const { isSubdomain, subdomain } = parseSubdomain(req)

  // Handle subdomain routing
  if (isSubdomain && subdomain) {
    // Check if this is a subdomain-specific route
    if (!req.nextUrl.pathname.startsWith('/subdomain/')) {
      // Rewrite to subdomain route
      const url = req.nextUrl.clone()
      url.pathname = `/subdomain/${subdomain}${req.nextUrl.pathname}`
      return NextResponse.rewrite(url)
    }
  }

  // Configure Supabase client with proper cookie domain handling for subdomains
  const supabase = createSubdomainMiddlewareClient(req, res)

  // Refresh session if expired - required for Server Components
  const {
    data: { session },
  } = await supabase.auth.getSession()

  // Add user ID to headers for rate limiting if authenticated
  if (session?.user) {
    res.headers.set('x-user-id', session.user.id)
  }

  // Protect authenticated routes
  const protectedPaths = ['/launchpad', '/dashboard', '/admin', '/builder', '/domains']
  const isProtectedPath = protectedPaths.some((path) => req.nextUrl.pathname.startsWith(path))

  if (isProtectedPath && !session) {
    const redirectUrl = getSubdomainRedirectUrl(req, '/login')
    const loginUrl = new URL(redirectUrl)
    loginUrl.searchParams.set('redirect', req.nextUrl.pathname)
    return NextResponse.redirect(loginUrl)
  }

  // For subdomain requests, allow unauthenticated access to public content
  if (isSubdomain) {
    return addSecurityHeaders(res)
  }

  return addSecurityHeaders(res)
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     * - api routes (important for auth callbacks)
     */
    '/((?!api/|_next/static|_next/image|favicon.ico|.*\\..*|public/).*)',
  ],
}