import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import {
  parseSubdomain,
  getSubdomainRedirectUrl,
} from './lib/subdomain-auth'
import { addSecurityHeaders } from './lib/security'
import { isPublicPath } from './config/publicPaths'
import { getRateLimitKey, rateLimit, RATE_LIMIT_CONFIGS } from './lib/rate-limit'
import { createClient as createSsrMiddlewareClient } from './utils/supabase/middleware'

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl
  const allowSameOriginFrame = pathname === '/f' || pathname.startsWith('/f/')
  const supabasePublicKey =
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  const supabaseEnvReady =
    !!process.env.NEXT_PUBLIC_SUPABASE_URL &&
    !!supabasePublicKey

  // API rate limiting (covers auth + public abuse-prone endpoints)
  if (pathname.startsWith('/api/')) {
    const AUTH_PATHS = ['/api/auth/login', '/api/auth/signup']
    const PUBLIC_ABUSE_PATHS = [
      '/api/leads/capture',
      '/api/track/affiliate-click',
      '/api/chat',
      '/api/ai/generate-content',
      '/api/ai/optimize',
    ]

    let bucket: (typeof RATE_LIMIT_CONFIGS)[keyof typeof RATE_LIMIT_CONFIGS] = RATE_LIMIT_CONFIGS.api
    if (AUTH_PATHS.some(p => pathname.startsWith(p))) {
      bucket = RATE_LIMIT_CONFIGS.auth
    } else if (PUBLIC_ABUSE_PATHS.some(p => pathname.startsWith(p))) {
      bucket = RATE_LIMIT_CONFIGS.api
    }

    const key = getRateLimitKey(req, pathname.startsWith('/api/auth') ? 'auth' : 'api')
    const result = await rateLimit(key, bucket)

    if (!result.success) {
      return NextResponse.json(
        { error: 'Rate limit exceeded. Please slow down.' },
        {
          status: 429,
          headers: {
            'Retry-After': Math.ceil((result.resetTime - Date.now()) / 1000).toString(),
            'X-RateLimit-Limit': bucket.limit.toString(),
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': result.resetTime.toString(),
          },
        }
      )
    }

    const res = NextResponse.next()
    res.headers.set('X-RateLimit-Limit', bucket.limit.toString())
    res.headers.set('X-RateLimit-Remaining', result.remaining.toString())
    res.headers.set('X-RateLimit-Reset', result.resetTime.toString())
    return res
  }

  // Allow public pages without auth and still attach security headers
  if (isPublicPath(pathname)) {
    const res = NextResponse.next()
    return addSecurityHeaders(res, { allowSameOriginFrame })
  }

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
  if (!supabaseEnvReady) {
    // In local/preview runs without Supabase creds, skip auth enforcement but keep security headers.
    const res = NextResponse.next()
    return addSecurityHeaders(res, { allowSameOriginFrame })
  }

  const { supabase, response: res } = createSsrMiddlewareClient(req)
  if (!supabase) {
    return addSecurityHeaders(res, { allowSameOriginFrame })
  }

  // Single auth check path to avoid duplicate refresh-token consumption in the same request.
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Add user ID to headers for rate limiting if authenticated
  if (user) {
    res.headers.set('x-user-id', user.id)
  }

  // Protect authenticated routes
  const protectedPaths = ['/launchpad', '/dashboard', '/admin', '/builder', '/domains', '/link-funnel']
  const isProtectedPath = protectedPaths.some((path) => req.nextUrl.pathname.startsWith(path))

  if (isProtectedPath && !user) {
    const redirectUrl = getSubdomainRedirectUrl(req, '/login')
    const loginUrl = new URL(redirectUrl)
    loginUrl.searchParams.set('redirect', req.nextUrl.pathname)
    return NextResponse.redirect(loginUrl)
  }

  // For subdomain requests, allow unauthenticated access to public content
  if (isSubdomain) {
    return addSecurityHeaders(res, { allowSameOriginFrame })
  }

  return addSecurityHeaders(res, { allowSameOriginFrame })
}

export const config = {
  matcher: [
    // API routes (rate limiting)
    '/api/:path*',
    // All other routes except static assets
    '/((?!_next/static|_next/image|favicon.ico|.*\\..*|public/).*)',
  ],
}
