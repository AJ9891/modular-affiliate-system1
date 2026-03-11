import { NextRequest } from 'next/server'
import { checkSupabase } from '@/lib/check-supabase'
import { createServiceRoleClient, createServerRouteClient } from '@/lib/supabase-server'
import { requireUser } from '@/lib/authz'
import { validateOffer } from '@/lib/validators/offers'
import { error, ok, readJson } from '@/lib/http'

export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const check = checkSupabase()
  if (check) return check

  try {
    const supabase = await createServerRouteClient()
    await requireUser(supabase)

    const body = validateOffer(await readJson(request))
    const { id: offerId } = await context.params

    // Use service role client to bypass RLS
    const adminClient = createServiceRoleClient()

    const { data, error } = await adminClient
      .from('offers')
      .update(body)
      .eq('id', offerId)
      .select()

    if (error) {
      throw error
    }

    return ok({ offer: data[0] })
  } catch (err) {
    return error(err)
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
      throw error
    }

    return ok({ success: true })
  } catch (err) {
    return error(err)
  }
}
