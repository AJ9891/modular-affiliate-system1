import { NextRequest, NextResponse } from 'next/server'
import { checkSupabase } from '@/lib/check-supabase'
import { createServiceRoleClient, createServerRouteClient } from '@/lib/supabase-server'
import { requireUser } from '@/lib/authz'

export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const check = checkSupabase()
  if (check) return check

  try {
    const supabase = await createServerRouteClient()
    await requireUser(supabase)

    const body = await request.json()
    const { id: offerId } = await context.params

    // Use service role client to bypass RLS
    const adminClient = createServiceRoleClient()

    const { data, error } = await adminClient
      .from('offers')
      .update(body)
      .eq('id', offerId)
      .select()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({ offer: data[0] })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: error.status ?? 500 }
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
    const supabase = await createServerRouteClient()
    await requireUser(supabase)

    const { id: offerId } = await context.params

    // Use service role client to bypass RLS
    const adminClient = createServiceRoleClient()

    const { error } = await adminClient
      .from('offers')
      .delete()
      .eq('id', offerId)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: error.status ?? 500 }
    )
  }
}
