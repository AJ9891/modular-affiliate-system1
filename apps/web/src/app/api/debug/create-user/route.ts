import { NextRequest, NextResponse } from 'next/server'
import { checkSupabase } from '@/lib/check-supabase'
import { createServiceRoleClient, createServerRouteClient } from '@/lib/supabase-server'
import { requireUser } from '@/lib/authz'

export async function POST(request: NextRequest) {
  const check = checkSupabase()
  if (check) return check
  
  try {
    const supabase = await createServerRouteClient()
    const user = await requireUser(supabase)

    console.log('Creating user in public.users table:', user.id, user.email)

    // Use service role client to bypass RLS
    const adminClient = createServiceRoleClient()

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
      { status: error.status ?? 500 }
    )
  }
}
