import { NextRequest, NextResponse } from 'next/server'
import { checkSupabase } from '@/lib/check-supabase'
import { createClient } from '@supabase/supabase-js'
import { createSubdomainRouteHandlerClient } from '@/lib/subdomain-auth'

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
    const { email, password } = await request.json()

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    })

    if (error) {
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
          console.error('Failed to create user in public.users:', insertError)
        }
      } catch (err) {
        console.error('Error creating user:', err)
      }
    }

    return NextResponse.json({ user: data.user }, { status: 201 })
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
