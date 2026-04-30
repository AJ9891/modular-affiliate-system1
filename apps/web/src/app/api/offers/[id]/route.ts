import { NextRequest } from 'next/server'
import { checkSupabase } from '@/lib/check-supabase'
import { createServerRouteClient, createServiceRoleClient } from '@/lib/supabase-server'
import { requireUser } from '@/lib/authz'
import { error, ok, readJson } from '@/lib/http'

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

function isPermissionDeniedError(issue: unknown): boolean {
  if (!issue || typeof issue !== 'object') return false
  const candidate = issue as {
    code?: string
    message?: string
    details?: string | null
    hint?: string | null
  }
  const code = (candidate.code || '').toUpperCase()
  const combined = [candidate.message, candidate.details, candidate.hint]
    .filter((part): part is string => typeof part === 'string' && part.length > 0)
    .join(' ')
    .toLowerCase()

  return (
    code === '42501' ||
    code === 'PGRST301' ||
    code === 'PGRST302' ||
    combined.includes('permission denied') ||
    combined.includes('row-level security') ||
    combined.includes('rls')
  )
}

export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const check = checkSupabase()
  if (check) return check

  try {
    const supabase = await createServerRouteClient()
    const user = await requireUser(supabase)
    const body = await readJson(request)
    const payload =
      body && typeof body === 'object' ? (body as Record<string, unknown>) : {}
    const { id: offerId } = await context.params

    const updatePayload: Record<string, unknown> = {}
    if (typeof payload.name === 'string') updatePayload.name = payload.name
    if (typeof payload.description === 'string') updatePayload.description = payload.description
    if (typeof payload.affiliate_link === 'string') updatePayload.affiliate_link = payload.affiliate_link
    if (typeof payload.commission_rate === 'number') updatePayload.commission_rate = payload.commission_rate
    if (typeof payload.niche_id === 'string' || payload.niche_id === null) updatePayload.niche_id = payload.niche_id
    if (typeof payload.niche_label === 'string' || payload.niche_label === null) updatePayload.niche_label = payload.niche_label
    if (typeof payload.commission_type === 'string') updatePayload.commission_type = payload.commission_type
    if (typeof payload.commission_value === 'number') updatePayload.commission_value = payload.commission_value
    if (typeof payload.commission_currency === 'string') updatePayload.commission_currency = payload.commission_currency

    const activeFlag = typeof payload.active === 'boolean'
      ? payload.active
      : (typeof payload.is_active === 'boolean' ? payload.is_active : undefined)
    if (typeof activeFlag === 'boolean') {
      updatePayload.active = activeFlag
    }

    if (Object.keys(updatePayload).length === 0) {
      return ok({ error: 'No valid fields to update' }, 400)
    }

    let { data, error: updateError } = await supabase
      .from('offers')
      .update(updatePayload)
      .eq('id', offerId)
      .select()

    if (updateError && isColumnMismatchError(updateError)) {
      const fallbackPayload: Record<string, unknown> = {}
      if (typeof updatePayload.name === 'string') fallbackPayload.name = updatePayload.name
      if (typeof updatePayload.description === 'string') fallbackPayload.description = updatePayload.description
      if (typeof updatePayload.affiliate_link === 'string') fallbackPayload.affiliate_link = updatePayload.affiliate_link
      if (typeof updatePayload.commission_rate === 'number') fallbackPayload.commission_rate = updatePayload.commission_rate
      if (Object.prototype.hasOwnProperty.call(updatePayload, 'niche_id')) fallbackPayload.niche_id = updatePayload.niche_id
      if (typeof updatePayload.active === 'boolean') fallbackPayload.active = updatePayload.active

      const fallbackResult = await supabase
        .from('offers')
        .update(fallbackPayload)
        .eq('id', offerId)
        .select()

      data = fallbackResult.data
      updateError = fallbackResult.error
    }

    if (updateError && isPermissionDeniedError(updateError)) {
      const adminClient = createServiceRoleClient()
      const ownershipFilter = `user_id.eq.${user.id},team_id.eq.${user.id}`

      let adminResult = await adminClient
        .from('offers')
        .update(updatePayload)
        .eq('id', offerId)
        .or(ownershipFilter)
        .select()

      if (adminResult.error && isColumnMismatchError(adminResult.error)) {
        const fallbackPayload: Record<string, unknown> = {}
        if (typeof updatePayload.name === 'string') fallbackPayload.name = updatePayload.name
        if (typeof updatePayload.description === 'string') fallbackPayload.description = updatePayload.description
        if (typeof updatePayload.affiliate_link === 'string') fallbackPayload.affiliate_link = updatePayload.affiliate_link
        if (typeof updatePayload.commission_rate === 'number') fallbackPayload.commission_rate = updatePayload.commission_rate
        if (Object.prototype.hasOwnProperty.call(updatePayload, 'niche_id')) fallbackPayload.niche_id = updatePayload.niche_id
        if (typeof updatePayload.active === 'boolean') fallbackPayload.active = updatePayload.active

        adminResult = await adminClient
          .from('offers')
          .update(fallbackPayload)
          .eq('id', offerId)
          .or(ownershipFilter)
          .select()
      }

      data = adminResult.data
      updateError = adminResult.error
    }

    if (updateError) {
      throw updateError
    }

    return ok({ offer: data?.[0] || null })
  } catch (err) {
    return error(err)
  }
}

export async function DELETE(
  _request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const check = checkSupabase()
  if (check) return check

  try {
    const supabase = await createServerRouteClient()
    const user = await requireUser(supabase)
    const { id: offerId } = await context.params

    const { error: deleteError } = await supabase
      .from('offers')
      .delete()
      .eq('id', offerId)

    if (deleteError && isPermissionDeniedError(deleteError)) {
      const adminClient = createServiceRoleClient()
      const ownershipFilter = `user_id.eq.${user.id},team_id.eq.${user.id}`
      const adminDelete = await adminClient
        .from('offers')
        .delete()
        .eq('id', offerId)
        .or(ownershipFilter)

      if (adminDelete.error) {
        throw adminDelete.error
      }
    } else if (deleteError) {
      throw deleteError
    }

    return ok({ success: true })
  } catch (err) {
    return error(err)
  }
}
