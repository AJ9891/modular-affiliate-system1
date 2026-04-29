import { NextRequest, NextResponse } from 'next/server'
import { checkSupabase } from '@/lib/check-supabase'
import { createClient } from '@supabase/supabase-js'

function isColumnMismatchError(issue: unknown): boolean {
  if (!issue || typeof issue !== 'object') return false
  const candidate = issue as { code?: string; message?: string }
  const code = (candidate.code || '').toUpperCase()
  const message = (candidate.message || '').toLowerCase()
  return (
    code === '42703' ||
    code === 'PGRST204' ||
    message.includes('column') ||
    message.includes('does not exist')
  )
}

export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const check = checkSupabase()
  if (check) return check

  try {
    const body = await request.json()
    const { id: offerId } = await context.params

    // Use service role client to bypass RLS
    const adminClient = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )

    const updatePayload: Record<string, unknown> = {}
    if (typeof body.name === 'string') updatePayload.name = body.name
    if (typeof body.description === 'string') updatePayload.description = body.description
    if (typeof body.affiliate_link === 'string') updatePayload.affiliate_link = body.affiliate_link
    if (typeof body.commission_rate === 'number') updatePayload.commission_rate = body.commission_rate
    if (typeof body.niche_id === 'string' || body.niche_id === null) updatePayload.niche_id = body.niche_id
    if (typeof body.niche_label === 'string' || body.niche_label === null) updatePayload.niche_label = body.niche_label
    if (typeof body.commission_type === 'string') updatePayload.commission_type = body.commission_type
    if (typeof body.commission_value === 'number') updatePayload.commission_value = body.commission_value
    if (typeof body.commission_currency === 'string') updatePayload.commission_currency = body.commission_currency

    const activeFlag = typeof body.active === 'boolean'
      ? body.active
      : (typeof body.is_active === 'boolean' ? body.is_active : undefined)
    if (typeof activeFlag === 'boolean') {
      updatePayload.active = activeFlag
    }

    if (Object.keys(updatePayload).length === 0) {
      return NextResponse.json({ error: 'No valid fields to update' }, { status: 400 })
    }

    let { data, error } = await adminClient
      .from('offers')
      .update(updatePayload)
      .eq('id', offerId)
      .select()

    if (error && isColumnMismatchError(error)) {
      const fallbackPayload: Record<string, unknown> = {}
      if (typeof updatePayload.name === 'string') fallbackPayload.name = updatePayload.name
      if (typeof updatePayload.description === 'string') fallbackPayload.description = updatePayload.description
      if (typeof updatePayload.affiliate_link === 'string') fallbackPayload.affiliate_link = updatePayload.affiliate_link
      if (typeof updatePayload.commission_rate === 'number') fallbackPayload.commission_rate = updatePayload.commission_rate
      if (Object.prototype.hasOwnProperty.call(updatePayload, 'niche_id')) fallbackPayload.niche_id = updatePayload.niche_id
      if (typeof updatePayload.active === 'boolean') fallbackPayload.active = updatePayload.active

      const fallbackResult = await adminClient
        .from('offers')
        .update(fallbackPayload)
        .eq('id', offerId)
        .select()

      data = fallbackResult.data
      error = fallbackResult.error
    }

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({ offer: data?.[0] || null })
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
    const { id: offerId } = await context.params

    // Use service role client to bypass RLS
    const adminClient = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )

    const { error } = await adminClient
      .from('offers')
      .delete()
      .eq('id', offerId)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
