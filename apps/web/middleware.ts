import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { createSubdomainMiddlewareClient } from './src/lib/subdomain-auth'
import { createClient } from '@supabase/supabase-js'

const PUBLIC_PATHS = new Set([
  '/',
  '/about',
  '/pricing',
  '/signup',
  '/login',
  '/do_not_click'
])

function isPublicPath(pathname: string) {
  if (PUBLIC_PATHS.has(pathname)) return true
  // allow static and api auth helpers
  if (pathname.startsWith('/_next')) return true
  if (pathname.startsWith('/favicon') || pathname.startsWith('/robots')) return true
  if (pathname.startsWith('/api/auth')) return true
  // Let API routes handle auth/authorization themselves and return JSON errors.
  if (pathname.startsWith('/api/')) return true
  return false
}

const ONBOARDING_COMPLETE = 8

async function getOnboardingStep(userId: string) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !serviceKey) return null

  const admin = createClient(url, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false }
  })

  const { data, error } = await admin
    .from('users')
    .select('onboarding_step')
    .eq('id', userId)
    .maybeSingle()

  if (error || !data) return null
  return data.onboarding_step ?? null
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl
  if (isPublicPath(pathname)) {
    return NextResponse.next()
  }

  const res = NextResponse.next()

  // Use Supabase middleware client when configured; otherwise allow access in dev
  const supabase = createSubdomainMiddlewareClient(req, res)
  if (!supabase) {
    return res
  }

  const {
    data: { session }
  } = await supabase.auth.getSession()

  if (!session) {
    const redirectUrl = new URL('/login', req.url)
    redirectUrl.searchParams.set('redirectTo', pathname)
    return NextResponse.redirect(redirectUrl)
  }

  // Enforce admin-only access for /admin routes based on role or is_admin
  if (pathname.startsWith('/admin')) {
    const { data, error } = await supabase
      .from('users')
      .select('role, is_admin')
      .eq('id', session.user.id)
      .maybeSingle()

    const isAdmin =
      (!error && data && (data.role === 'admin' || data.role === 'owner')) ||
      data?.is_admin === true

    if (!isAdmin) {
      return NextResponse.redirect(new URL('/dashboard', req.url))
    }
  }

  const isOnboardingPath = pathname.startsWith('/launchpad') || pathname.startsWith('/welcome')
  const skipOnboarding =
    req.nextUrl.searchParams.get('skip_onboarding') === '1' ||
    req.cookies.get('lp_skip_onboarding')?.value === '1'

  if (!isOnboardingPath && !skipOnboarding) {
    const step = await getOnboardingStep(session.user.id)
    if (step !== null && step < ONBOARDING_COMPLETE) {
      return NextResponse.redirect(new URL('/launchpad', req.url))
    }
  }

  // Signed-in users hitting the marketing root go to cockpit home
  if (pathname === '/') {
    return NextResponse.redirect(new URL('/cockpit', req.url))
  }

  return res
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)']
}
