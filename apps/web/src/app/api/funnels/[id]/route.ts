import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { checkSupabase } from '@/lib/check-supabase'

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const check = checkSupabase()
  if (check) return check
  
  try {
    const body = await request.json()
    const { name, blocks, slug } = body

    const { data, error } = await supabase!
      .from('funnels')
      .update({
        name,
        slug,
        blocks: JSON.stringify(blocks),
        updated_at: new Date().toISOString(),
      })
      .eq('funnel_id', params.id)
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
  { params }: { params: { id: string } }
) {
  const check = checkSupabase()
  if (check) return check
  
  try {
    const { error } = await supabase!
      .from('funnels')
      .delete()
      .eq('funnel_id', params.id)

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
