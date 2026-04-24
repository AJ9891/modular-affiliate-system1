import { NextRequest } from 'next/server'
import { checkSupabase } from '@/lib/check-supabase'
import { createServiceRoleClient, createServerRouteClient } from '@/lib/supabase-server'
import { requireUser } from '@/lib/authz'
import { validateOffer } from '@/lib/validators/offers'
import { error, ok, readJson } from '@/lib/http'

function isRecoverableOffersReadError(issue: unknown): boolean {
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

export async function GET() {
  const check = checkSupabase()
  if (check) return check

  try {
    const supabase = await createServerRouteClient()
    const user = await requireUser(supabase) // ensure caller is authenticated
    const { data, error: offersError } = await supabase!
      .from('offers')
      .select('*')
      .order('created_at', { ascending: false })

    if (offersError) {
      if (isRecoverableOffersReadError(offersError)) {
        console.warn('Offers read degraded, using service-role fallback:', offersError)

        const adminClient = createServiceRoleClient()
        const visibilityFilter = `active.eq.true,user_id.eq.${user.id},team_id.eq.${user.id}`
        const { data: fallbackData, error: fallbackError } = await adminClient
          .from('offers')
          .select('*')
          .or(visibilityFilter)
          .order('created_at', { ascending: false })

        if (fallbackError) {
          const isColumnMismatch =
            fallbackError.code === '42703' ||
            fallbackError.code === 'PGRST204' ||
            `${fallbackError.message || ''}`.toLowerCase().includes('column')

          if (isColumnMismatch) {
            const { data: activeOnlyData, error: activeOnlyError } = await adminClient
              .from('offers')
              .select('*')
              .eq('active', true)
              .order('created_at', { ascending: false })

            if (activeOnlyError) {
              throw activeOnlyError
            }

            return ok({ offers: activeOnlyData || [] })
          }

          throw fallbackError
        }

        return ok({ offers: fallbackData || [] })
      }

      throw offersError
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
    const supabase = await createServerRouteClient()
    const user = await requireUser(supabase)
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
        user_id: user.id,
        team_id: user.id,
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
