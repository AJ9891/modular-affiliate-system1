import { NextRequest, NextResponse } from 'next/server'
import { checkSupabase } from '@/lib/check-supabase'
import { createSubdomainRouteHandlerClient } from '@/lib/subdomain-auth'
import { createServiceRoleClient, loadSupabaseEnv } from '@/lib/supabase-server'
import { log } from '@/lib/log'

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
  
  const supabase = await createSubdomainRouteHandlerClient(request)
  
  try {
    const { email, password } = await request.json()

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    })

    if (error) {
      log.warn('Signup error', { error: error.message })
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    // Best effort: create user in public.users table if service key is configured.
    if (data.user) {
      try {
        const adminClient = getSupabaseAdminClient()
        if (!adminClient) {
          return NextResponse.json({ user: data.user }, { status: 201 })
        }

        const { error: insertError } = await adminClient.from('users').upsert({
          id: data.user.id,
          email: data.user.email || email,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'id'
        })
        
        if (insertError) {
          log.error('Failed to create user in public.users', { error: insertError.message })
        }

        const autoAdmin = shouldAutoGrantAdmin(data.user.email || email)
        if (autoAdmin) {
          const { error: adminError } = await adminClient
            .from('users')
            .update({ is_admin: true })
            .eq('id', data.user.id)

          if (adminError) {
            log.error('Failed to auto-grant admin role on signup', { error: adminError.message, email: data.user.email })
          }

          const { error: onboardingError } = await adminClient
            .from('users')
            .update({
              onboarding_seen: true,
              onboarding_complete: true,
              onboarding_step: 99,
            })
            .eq('id', data.user.id)

          if (onboardingError) {
            log.warn('Unable to mark onboarding complete for admin user on signup', {
              error: onboardingError.message,
              email: data.user.email,
            })
          }
        }
      } catch (err) {
        log.error('Error creating user', { error: String(err) })
      }
    }

    return NextResponse.json({ user: data.user }, { status: 201 })
  } catch (error: any) {
    log.error('Signup handler failed', { error: error?.message })
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: error.status ?? 500 }
    )
  }
}
