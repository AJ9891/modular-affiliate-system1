import { NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

export async function POST() {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    const testEmail = `test-${Date.now()}@example.com`
    const testPassword = 'TestPassword123!'

    console.log('Creating test user:', testEmail)

    // Try to sign up
    const { data, error } = await supabase.auth.signUp({
      email: testEmail,
      password: testPassword,
      options: {
        emailRedirectTo: undefined, // Disable email confirmation
      }
    })

    if (error) {
      return NextResponse.json({
        status: 'error',
        error: error.message,
        testEmail,
        suggestion: 'Check if email confirmation is required in Supabase settings'
      }, { status: 400 })
    }

    // Try to sign in immediately
    const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
      email: testEmail,
      password: testPassword,
    })

    return NextResponse.json({
      status: 'success',
      signup: {
        user: data.user,
        session: data.session,
        confirmation_required: !data.session
      },
      login: loginError ? {
        error: loginError.message
      } : {
        success: true,
        user: loginData.user,
        session: !!loginData.session
      },
      testCredentials: {
        email: testEmail,
        password: testPassword
      }
    })
  } catch (error: any) {
    return NextResponse.json({
      status: 'error',
      error: error.message
    }, { status: 500 })
  }
}
