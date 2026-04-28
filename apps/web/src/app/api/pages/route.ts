import { NextRequest, NextResponse } from 'next/server'
import { checkSupabase } from '@/lib/check-supabase'
import { createRouteHandlerClientCompat } from '@/lib/subdomain-auth'
import { getRouteUser } from '@/lib/auth/session'

export async function GET(request: NextRequest) {
  const check = checkSupabase()
  if (check) return check

  try {
    const userSupabase = await createRouteHandlerClientCompat()
    const { user, response } = await getRouteUser(userSupabase, 'Not authenticated')
    if (!user) return response!

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
    const userSupabase = await createRouteHandlerClientCompat()
    const { user, response } = await getRouteUser(userSupabase, 'Not authenticated')
    if (!user) return response!

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
