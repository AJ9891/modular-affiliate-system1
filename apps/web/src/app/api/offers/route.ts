import { NextRequest } from 'next/server'
import { checkSupabase } from '@/lib/check-supabase'
import { createServiceRoleClient, createServerRouteClient } from '@/lib/supabase-server'
import { requireUser } from '@/lib/authz'
import { validateOffer } from '@/lib/validators/offers'
import { error, ok, readJson } from '@/lib/http'

export async function GET() {
  const check = checkSupabase()
  if (check) return check

  try {
    const supabase = await createServerRouteClient()
    await requireUser(supabase) // ensure caller is authenticated
    const { data, error } = await supabase!
      .from('offers')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      throw error
    }

    return ok({ offers: data })
  } catch (err) {
    return error(err)
  }
}

export async function POST(request: NextRequest) {
  const check = checkSupabase()
  if (check) return check

  try {
    const body = await readJson(request)
    const { name, description, affiliate_link, commission_rate, niche_id } = validateOffer(body)

    console.log('Creating offer:', { name, description, affiliate_link, commission_rate, niche_id })

    // Use service role client to bypass RLS
    const adminClient = createServiceRoleClient()

    const { data, error } = await adminClient
      .from('offers')
      .insert({
        name,
        description,
        affiliate_link,
        commission_rate,
        niche_id,
        active: true,
      })
      .select()

    if (error) {
      throw error
    }

    console.log('Offer created successfully:', data)
    return ok({ offer: data[0] }, 201)
  } catch (err) {
    console.error('Exception creating offer:', err)
    return error(err)
  }
}
