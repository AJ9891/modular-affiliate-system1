import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { checkSupabase } from '@/lib/check-supabase'

export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  const check = checkSupabase()
  if (check) return check

  try {
    // Get user from session
    const accessToken = request.cookies.get('sb-access-token')?.value

    if (!accessToken) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    const { createClient } = await import('@supabase/supabase-js')
    const userSupabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        global: {
          headers: {
            Authorization: `Bearer ${accessToken}`
          }
        }
      }
    )

    const { data: { user }, error: authError } = await userSupabase.auth.getUser(accessToken)

    if (authError || !user) {
      return NextResponse.json({ error: 'Invalid session' }, { status: 401 })
    }

    const { data: funnel, error } = await userSupabase
      .from('funnels')
      .select('*')
      .eq('slug', params.slug)
      .eq('user_id', user.id)
      .single()

    if (error || !funnel) {
      return NextResponse.json({ error: 'Funnel not found' }, { status: 404 })
    }

    // Parse blocks JSON
    const blocks = typeof funnel.blocks === 'string' 
      ? JSON.parse(funnel.blocks) 
      : funnel.blocks

    return NextResponse.json({ 
      funnel: {
        ...funnel,
        blocks
      }
    }, { status: 200 })
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}