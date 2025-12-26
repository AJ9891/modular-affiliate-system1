import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(req: NextRequest) {
  // ✅ Allow public funnel pages - bypass auth completely
  if (req.nextUrl.pathname.startsWith('/f/')) {
    return NextResponse.next()
  }

  const res = NextResponse.next()
  const supabase = createMiddlewareClient({ req, res })

  // Refresh session if expired - required for Server Components
  const {
    data: { session },
  } = await supabase.auth.getSession()

  // Protect authenticated routes
  const protectedPaths = ['/launchpad', '/dashboard', '/admin', '/builder']
  const isProtectedPath = protectedPaths.some(path => req.nextUrl.pathname.startsWith(path))

  if (isProtectedPath && !session) {
    const redirectUrl = new URL('/login', req.url)
    redirectUrl.searchParams.set('redirect', req.nextUrl.pathname)
    return NextResponse.redirect(redirectUrl)
  }

  // Don't redirect authenticated users away from auth pages for now
  // This might interfere with login flow

  return res
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
    '/((?!_next/static|_next/image|favicon.ico|public|api).*)',
  ],
}