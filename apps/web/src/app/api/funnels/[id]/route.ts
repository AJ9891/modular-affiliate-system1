import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { checkSupabase } from '@/lib/check-supabase'

export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const check = checkSupabase()
  if (check) return check

  try {
    const supabase = createRouteHandlerClient({ cookies })
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await context.params

    // Allow direct UUID fetch and slug fallback for compatibility.
    let query = supabase
      .from('funnels')
      .select('*')
      .eq('user_id', user.id)
      .eq('funnel_id', id)
      .maybeSingle()

    let { data: funnel, error } = await query

    if ((!funnel || error) && id) {
      const slugResult = await supabase
        .from('funnels')
        .select('*')
        .eq('user_id', user.id)
        .eq('slug', id)
        .maybeSingle()
      funnel = slugResult.data
      error = slugResult.error
    }

    if (error || !funnel) {
      return NextResponse.json({ error: 'Funnel not found' }, { status: 404 })
    }

    return NextResponse.json({ funnel }, { status: 200 })
  } catch (_error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const check = checkSupabase()
  if (check) return check
  
  try {
    const supabase = createRouteHandlerClient({ cookies })
    const body = await request.json()
    const { name, blocks, slug } = body

    const { id } = await context.params
    const { data, error } = await supabase!
      .from('funnels')
      .update({
        name,
        slug,
        blocks: JSON.stringify(blocks),
        updated_at: new Date().toISOString(),
      })
      .eq('funnel_id', id)
      .select()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({ funnel: data[0] }, { status: 200 })
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const check = checkSupabase()
  if (check) return check
  
  try {
    const supabase = createRouteHandlerClient({ cookies })
    const { id } = await context.params
    const { error } = await supabase!
      .from('funnels')
      .delete()
      .eq('funnel_id', id)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json(
      { message: 'Funnel deleted successfully' },
      { status: 200 }
    )
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
