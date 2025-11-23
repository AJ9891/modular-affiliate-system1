import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { checkSupabase } from '@/lib/check-supabase'

export async function POST(request: NextRequest) {
  const check = checkSupabase()
  if (check) return check
  
  try {
    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      )
    }

    console.log('Login attempt for:', email)

    const { data, error } = await supabase!.auth.signInWithPassword({
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

    console.log('Login successful for:', email)

    return NextResponse.json({ 
      user: data.user,
      session: data.session 
    }, { status: 200 })
  } catch (error: any) {
    console.error('Login error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
