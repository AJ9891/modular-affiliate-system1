import { NextResponse } from 'next/server'
import { requireDebugAccess } from '@/lib/debug-access'
import { createServiceRoleClient } from '@/lib/supabase-server'

export async function POST() {
  const access = await requireDebugAccess()
  if (!access.allowed) return access.response

  try {
    const admin = createServiceRoleClient()
    const testEmail = `test-${Date.now()}@example.com`
    const testPassword = 'TestPassword123!'

    console.log('Creating test user:', testEmail)

    const { data, error } = await admin.auth.admin.createUser({
      email: testEmail,
      password: testPassword,
      email_confirm: true,
    })

    if (error) {
      return NextResponse.json({
        status: 'error',
        error: error.message,
        testEmail,
        suggestion: 'Check if email confirmation is required in Supabase settings'
      }, { status: 400 })
    }

    return NextResponse.json({
      status: 'success',
      createdUser: {
        user: data.user,
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
