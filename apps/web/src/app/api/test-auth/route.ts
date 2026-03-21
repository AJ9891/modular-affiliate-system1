import { NextResponse } from 'next/server'
import { createServerRouteClient, loadSupabaseEnv } from '@/lib/supabase-server'

export async function GET() {
  try {
    loadSupabaseEnv()
    const supabase = await createServerRouteClient()

    // Test database connection
    const { error } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true })

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
