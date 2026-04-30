import { checkSupabase } from '@/lib/check-supabase'
import { requireUser } from '@/lib/authz'
import { error, ok } from '@/lib/http'
import { createServerRouteClient } from '@/lib/supabase-server'

export async function GET() {
  const check = checkSupabase()
  if (check) return check

  try {
    const supabase = await createServerRouteClient()
    const user = await requireUser(supabase)

    const { data, error: offersError, count } = await supabase
      .from('offers')
      .select('id,active,created_at,user_id,team_id', { count: 'exact' })
      .order('created_at', { ascending: false })
      .limit(5)

    if (offersError) {
      return ok(
        {
          status: 'error',
          authenticated: true,
          userId: user.id,
          offersQuery: {
            ok: false,
            code: offersError.code ?? null,
            message: offersError.message,
            details: offersError.details ?? null,
            hint: offersError.hint ?? null,
          },
          timestamp: new Date().toISOString(),
        },
        500
      )
    }

    return ok({
      status: 'ok',
      authenticated: true,
      userId: user.id,
      offersQuery: {
        ok: true,
        count: count ?? 0,
        sample: data ?? [],
      },
      timestamp: new Date().toISOString(),
    })
  } catch (err) {
    return error(err)
  }
}
