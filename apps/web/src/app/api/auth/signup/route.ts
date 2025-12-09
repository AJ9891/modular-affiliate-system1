import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { checkSupabase } from '@/lib/check-supabase'
import { createClient } from '@supabase/supabase-js'

export async function POST(request: NextRequest) {
  const check = checkSupabase()
  if (check) return check
  
  try {
    const { email, password } = await request.json()

    const { data, error } = await supabase!.auth.signUp({
      email,
      password,
    })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    // Create user in public.users table using service role key to bypass RLS
    if (data.user && process.env.SUPABASE_SERVICE_ROLE_KEY) {
      try {
        const adminClient = createClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.SUPABASE_SERVICE_ROLE_KEY,
          {
            auth: {
              autoRefreshToken: false,
              persistSession: false
            }
          }
        )

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
        } else {
          console.log('User created in public.users table')
        }
      } catch (err) {
        console.error('Error creating user:', err)
      }
    } else if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
      console.warn('SUPABASE_SERVICE_ROLE_KEY not set - cannot create user in public.users table')
    }

    return NextResponse.json({ user: data.user }, { status: 201 })
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
