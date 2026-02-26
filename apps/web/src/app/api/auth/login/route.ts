import { NextRequest, NextResponse } from 'next/server'
import { checkSupabase } from '@/lib/check-supabase'
import { createSubdomainRouteHandlerClient } from '@/lib/subdomain-auth'
import { createClient } from '@supabase/supabase-js'

const AUTH_COOKIE_CHUNK_SIZE = 3180

function getSupabaseAuthCookieBaseName(): string | null {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  if (!supabaseUrl) return null

  try {
    const projectRef = new URL(supabaseUrl).hostname.split('.')[0]
    return projectRef ? `sb-${projectRef}-auth-token` : null
  } catch {
    return null
  }
}

function serializeSessionForCookie(session: any): string {
  return JSON.stringify([
    session?.access_token,
    session?.refresh_token,
    session?.provider_token,
    session?.provider_refresh_token,
    session?.user?.factors ?? null,
  ])
}

function chunkCookieValue(value: string): string[] {
  const chunks = value.match(new RegExp(`.{1,${AUTH_COOKIE_CHUNK_SIZE}}`, 'g'))
  return chunks ?? [value]
}

function getSupabaseAdminClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!supabaseUrl || !serviceRoleKey) return null

  return createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })
}

export async function POST(request: NextRequest) {
  const check = checkSupabase()
  if (check) return check
  
  const supabase = await createSubdomainRouteHandlerClient(request)
  
  try {
    let body
    try {
      body = await request.json()
    } catch (parseError) {
      console.error('Failed to parse request body:', parseError)
      return NextResponse.json(
        { error: 'Invalid request body' },
        { status: 400 }
      )
    }

    const { email, password } = body

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      )
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      console.error('Supabase auth error:', error)
      return NextResponse.json({ 
        error: error.message || 'Invalid email or password' 
      }, { status: 401 })
    }

    if (!data.user) {
      return NextResponse.json({ 
        error: 'Authentication failed' 
      }, { status: 401 })
    }

    // Best effort: ensure user exists in public.users table if service key is configured.
    if (data.user) {
      try {
        const adminClient = getSupabaseAdminClient()
        if (!adminClient) {
          // Continue without blocking auth when service role is not configured.
          return createLoginSuccessResponse(data)
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
          console.error('Failed to upsert user in public.users:', upsertError)
        }
      } catch (err) {
        console.error('Error upserting user:', err)
      }
    }

    return createLoginSuccessResponse(data)
  } catch (error: any) {
    console.error('Login error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

function createLoginSuccessResponse(data: { user: any; session: any }) {
  const response = NextResponse.json({
    user: data.user,
    session: data.session
  }, { status: 200 })

  // Keep legacy token cookies for routes that still read sb-access-token directly.
  const secure = process.env.NODE_ENV === 'production'
  const cookieOptions = {
    path: '/',
    sameSite: 'lax' as const,
    secure,
    maxAge: 60 * 60 * 24 * 30,
  }

  if (data.session?.access_token) {
    response.cookies.set('sb-access-token', data.session.access_token, cookieOptions)
  }

  if (data.session?.refresh_token) {
    response.cookies.set('sb-refresh-token', data.session.refresh_token, cookieOptions)
  }

  // Also set the auth-helpers cookie format explicitly so /api/auth/me can read it reliably.
  const authCookieBase = getSupabaseAuthCookieBaseName()
  if (authCookieBase && data.session) {
    const serializedSession = serializeSessionForCookie(data.session)
    const sessionChunks = chunkCookieValue(serializedSession)

    if (sessionChunks.length === 1) {
      response.cookies.set(authCookieBase, serializedSession, cookieOptions)
    } else {
      sessionChunks.forEach((chunk, index) => {
        response.cookies.set(`${authCookieBase}.${index}`, chunk, cookieOptions)
      })
    }
  }

  return response
}
