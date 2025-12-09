import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { checkSupabase } from '@/lib/check-supabase'
import { createClient } from '@supabase/supabase-js'

export async function POST(request: NextRequest) {
  const check = checkSupabase()
  if (check) return check
  
  try {
    // Get user from session
    const accessToken = request.cookies.get('sb-access-token')?.value
    
    if (!accessToken) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    const { data: { user }, error: authError } = await supabase!.auth.getUser(accessToken)

    if (authError || !user) {
      return NextResponse.json({ error: 'Invalid session' }, { status: 401 })
    }

    console.log('Creating user in public.users table:', user.id, user.email)

    // Use service role client to bypass RLS
    const adminClient = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )

    // Try to insert user into public.users table
    const { data, error } = await adminClient
      .from('users')
      .upsert({
        id: user.id,
        email: user.email || '',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'id'
      })
      .select()

    if (error) {
      console.error('Error creating user:', error)
      return NextResponse.json({ 
        error: error.message,
        details: error
      }, { status: 400 })
    }

    console.log('User created successfully:', data)
    return NextResponse.json({ 
      success: true,
      message: 'User created successfully in public.users table',
      user: data 
    }, { status: 200 })
  } catch (error: any) {
    console.error('User creation error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
