import { NextRequest } from 'next/server'
import type { SupabaseClient, User } from '@supabase/supabase-js'
import { createRouteHandlerClientCompat } from '@/lib/subdomain-auth'
import { getRouteUser } from '@/lib/auth/session'
import { checkSupabase } from '@/lib/check-supabase'
import { error } from '@/lib/http'

type RouteParams = Record<string, string>

export type RouteContext<TParams extends RouteParams = RouteParams> = {
  request: NextRequest
  supabase: SupabaseClient
  user: User | null
  params?: Promise<TParams> | TParams
}

type RouteOptions = {
  requireAuth?: boolean
}

export function withRouteHandler(
  handler: (ctx: RouteContext) => Promise<Response>,
  options: RouteOptions = { requireAuth: true }
) {
  return async function routeHandler(
    request: NextRequest,
    context?: { params?: Promise<RouteParams> | RouteParams }
  ): Promise<Response> {
    const supabaseCheck = checkSupabase()
    if (supabaseCheck) return supabaseCheck

    try {
      const supabase = await createRouteHandlerClientCompat()

      if (options.requireAuth !== false) {
        const auth = await getRouteUser(supabase)
        if (!auth.user) return auth.response!
        return handler({ request, supabase, user: auth.user, params: context?.params })
      }

      return handler({ request, supabase, user: null, params: context?.params })
    } catch (err) {
      return error(err)
    }
  }
}
