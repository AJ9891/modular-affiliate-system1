import { NextRequest, NextResponse } from 'next/server'
import { checkSupabase } from '@/lib/check-supabase'
import { createSubdomainRouteHandlerClientWithResponse } from '@/lib/subdomain-auth'
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
  
  const { supabase, applyCookies } = createSubdomainRouteHandlerClientWithResponse(request)
  
  try {
    const { email, password, betaInvite } = await request.json()

    const normalizedEmail = typeof email === 'string' ? email.trim().toLowerCase() : ''
    const betaInviteToken = typeof betaInvite === 'string' ? betaInvite.trim() : ''

    let betaTesterId: string | null = null
    let adminClient = null

    if (betaInviteToken) {
      adminClient = getSupabaseAdminClient()
      if (!adminClient) {
        return NextResponse.json({ error: 'Beta invite validation is unavailable right now' }, { status: 500 })
      }

      const { data: betaRecord, error: betaError } = await adminClient
        .from('beta_testers')
        .select('id,email,status')
        .eq('invite_token', betaInviteToken)
        .single<{ id: string; email: string; status: string }>()

      if (betaError || !betaRecord) {
        return NextResponse.json({ error: 'Invalid beta invite token' }, { status: 400 })
      }

      if (betaRecord.status === 'paused') {
        return NextResponse.json({ error: 'This beta invite is paused' }, { status: 403 })
      }

      if (betaRecord.email.trim().toLowerCase() !== normalizedEmail) {
        return NextResponse.json({ error: 'Invite email does not match signup email' }, { status: 400 })
      }

      betaTesterId = betaRecord.id
    }

    const { data, error } = await supabase.auth.signUp({
      email: normalizedEmail,
      password,
    })

    if (error) {
      log.warn('Signup error', { error: error.message })
      return applyCookies(NextResponse.json({ error: error.message }, { status: 400 }))
    }

    // Best effort: create user in public.users table if service key is configured.
    if (data.user) {
      try {
        adminClient = adminClient || getSupabaseAdminClient()
        if (!adminClient) {
          return applyCookies(NextResponse.json({ user: data.user }, { status: 201 }))
        }

        const { error: insertError } = await adminClient.from('users').upsert({
          id: data.user.id,
          email: data.user.email || normalizedEmail,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'id'
        })
        
        if (insertError) {
          log.error('Failed to create user in public.users', { error: insertError.message })
        }

        if (betaTesterId) {
          const { error: betaUpdateError } = await adminClient
            .from('beta_testers')
            .update({
              status: 'active',
              accepted_user_id: data.user.id,
              invite_accepted_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            })
            .eq('id', betaTesterId)

          if (betaUpdateError) {
            log.error('Failed to mark beta tester invite accepted', { error: betaUpdateError.message })
          }
        }
      } catch (err) {
        log.error('Error creating user', { error: String(err) })
      }
    }

    return applyCookies(NextResponse.json({ user: data.user }, { status: 201 }))
  } catch (error: any) {
    log.error('Signup handler failed', { error: error?.message })
    return applyCookies(NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: error.status ?? 500 }
    ))
  }
}
