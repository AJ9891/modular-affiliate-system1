import { NextRequest, NextResponse } from 'next/server'
import { checkSupabase } from '@/lib/check-supabase'
import { createSubdomainRouteHandlerClientWithResponse } from '@/lib/subdomain-auth'
import { createServiceRoleClient, loadSupabaseEnv } from '@/lib/supabase-server'
import { log } from '@/lib/log'
import { withTrace } from '@/lib/observability/tracing'

function getSupabaseAdminClient() {
  try {
    loadSupabaseEnv(true)
    return createServiceRoleClient()
  } catch {
    return null
  }
}

function getAdminEmailAllowlist(): Set<string> {
  const raw = process.env.ADMIN_EMAILS || ''
  return new Set(
    raw
      .split(',')
      .map((value) => value.trim().toLowerCase())
      .filter((value) => value.length > 0)
  )
}

function shouldAutoGrantAdmin(email?: string | null): boolean {
  if (!email) return false
  const allowlist = getAdminEmailAllowlist()
  return allowlist.has(email.trim().toLowerCase())
}

export async function POST(request: NextRequest) {
  const check = checkSupabase()
  if (check) return check
  
  const { supabase, applyCookies } = createSubdomainRouteHandlerClientWithResponse(request)
  
  try {
    let body
    try {
      body = await request.json()
    } catch (parseError) {
      log.warn('Failed to parse request body', { error: String(parseError) })
      return applyCookies(NextResponse.json(
        { error: 'Invalid request body' },
        { status: 400 }
      ))
    }

    const { email, password } = body

    if (!email || !password) {
      return applyCookies(NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      ))
    }

    const { data, error } = await withTrace(
      'auth.signInWithPassword',
      () =>
        supabase.auth.signInWithPassword({
          email,
          password,
        }),
      { email }
    )

    if (error) {
      log.warn('Supabase auth error', { error: error?.message })
      return applyCookies(NextResponse.json({ 
        error: error.message || 'Invalid email or password' 
      }, { status: 401 }))
    }

    if (!data.user) {
      return applyCookies(NextResponse.json({ 
        error: 'Authentication failed' 
      }, { status: 401 }))
    }

    // Best effort: ensure user exists in public.users table if service key is configured.
    if (data.user) {
      try {
        const adminClient = getSupabaseAdminClient()
        if (!adminClient) {
          // Continue without blocking auth when service role is not configured.
          return applyCookies(createLoginSuccessResponse(data))
        }

        const { error: upsertError } = await adminClient.from('users').upsert({
          id: data.user.id,
          email: data.user.email || email,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'id',
          ignoreDuplicates: false
        })
        
        if (upsertError) {
          log.error('Failed to upsert user in public.users', { error: upsertError?.message })
        }

        const autoAdmin = shouldAutoGrantAdmin(data.user.email || email)
        if (autoAdmin) {
          const { error: adminError } = await adminClient
            .from('users')
            .update({ is_admin: true })
            .eq('id', data.user.id)

          if (adminError) {
            log.error('Failed to auto-grant admin role', { error: adminError.message, email: data.user.email })
          }

          // Best effort: mark onboarding complete for admin users.
          const { error: onboardingError } = await adminClient
            .from('users')
            .update({
              onboarding_seen: true,
              onboarding_complete: true,
              onboarding_step: 99,
            })
            .eq('id', data.user.id)

          if (onboardingError) {
            log.warn('Unable to mark onboarding complete for admin user', {
              error: onboardingError.message,
              email: data.user.email,
            })
          }
        }
      } catch (err) {
        log.error('Error upserting user', { error: String(err) })
      }
    }

    return applyCookies(createLoginSuccessResponse(data))
  } catch (error: any) {
    log.error('Login error', { error: error?.message })
    return applyCookies(NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    ))
  }
}

function createLoginSuccessResponse(data: { user: any; session: any }) {
  return NextResponse.json({
    user: data.user,
    session: data.session
  }, { status: 200 })
}
