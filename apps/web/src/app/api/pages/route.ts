import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { checkSupabase } from '@/lib/check-supabase'

export async function GET(request: NextRequest) {
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

    // Get pages for user's funnels
    const { data: pages, error } = await userSupabase
      .from('pages')
      .select(`
        *,
        funnels!inner(name, funnel_id)
      `)
      .eq('funnels.user_id', user.id)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({ pages }, { status: 200 })
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
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

    const body = await request.json()
    const { name, content, funnel_id, slug } = body

    if (!name || !funnel_id) {
      return NextResponse.json({ error: 'Name and funnel_id are required' }, { status: 400 })
    }

    // Verify funnel belongs to user
    const { data: funnel } = await userSupabase
      .from('funnels')
      .select('funnel_id')
      .eq('funnel_id', funnel_id)
      .eq('user_id', user.id)
      .single()

    if (!funnel) {
      return NextResponse.json({ error: 'Funnel not found or access denied' }, { status: 404 })
    }

    const { data, error } = await userSupabase
      .from('pages')
      .insert({
        name,
        content: JSON.stringify(content || {}),
        funnel_id,
        slug,
        created_at: new Date().toISOString()
      })
      .select()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({ 
      page: data[0],
      pageId: data[0].id 
    }, { status: 201 })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}