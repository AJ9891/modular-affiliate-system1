import { NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

export async function GET() {
  try {
    // Test environment variables
    const envCheck = {
      NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL ? 'Set' : 'Missing',
      NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'Set (length: ' + process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY.length + ')' : 'Missing',
    }

    // Test database connection
    const { data, error } = await supabase
      .from('users')
      .select('count')
      .limit(1)

    if (error) {
      return NextResponse.json({
        status: 'error',
        environment: envCheck,
        database_error: error.message,
        supabase_client: supabase ? 'Created' : 'Failed'
      }, { status: 500 })
    }

    // Test auth
    const { data: authData, error: authError } = await supabase.auth.getSession()

    return NextResponse.json({
      status: 'success',
      environment: envCheck,
      database_connection: 'OK',
      auth_service: authError ? 'Error: ' + authError.message : 'OK',
      supabase_client: 'Created',
      timestamp: new Date().toISOString()
    })
  } catch (error: any) {
    return NextResponse.json({
      status: 'error',
      error: error.message,
      environment: {
        NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL ? 'Set' : 'Missing',
        NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'Set' : 'Missing',
      }
    }, { status: 500 })
  }
}
