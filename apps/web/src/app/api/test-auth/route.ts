import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

export async function GET() {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    if (!supabase) {
      return NextResponse.json({ 
        status: 'error',
        message: 'Supabase not configured' 
      })
    }

    // Test database connection
    const { data, error } = await supabase
      .from('users')
      .select('count')
      .limit(1)

    if (error) {
      return NextResponse.json({
        status: 'error',
        message: 'Database connection failed',
        error: error.message
      })
    }

    return NextResponse.json({
      status: 'ok',
      message: 'Supabase connected successfully',
      supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
      hasAnonKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    })
  } catch (error: any) {
    return NextResponse.json({
      status: 'error',
      message: error.message
    })
  }
}
