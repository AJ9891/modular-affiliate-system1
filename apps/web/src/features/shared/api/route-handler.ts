import { NextRequest } from 'next/server'
import type { SupabaseClient, User } from '@supabase/supabase-js'
import { createRouteHandlerClientCompat } from '@/lib/subdomain-auth'
import { getRouteUser } from '@/lib/auth/session'
import { checkSupabase } from '@/lib/check-supabase'
import { error } from '@/lib/http'

export type RouteContext = {
  request: NextRequest
  supabase: SupabaseClient
  user: User | null
}

type RouteOptions = {
  requireAuth?: boolean
}

export function withRouteHandler(
  handler: (ctx: RouteContext) => Promise<Response>,
  options: RouteOptions = { requireAuth: true }
) {
  return async function routeHandler(request: NextRequest): Promise<Response> {
    const supabaseCheck = checkSupabase()
    if (supabaseCheck) return supabaseCheck

    try {
      const supabase = await createRouteHandlerClientCompat()

      if (options.requireAuth !== false) {
        const auth = await getRouteUser(supabase)
        if (!auth.user) return auth.response!
        return handler({ request, supabase, user: auth.user })
      }

      return handler({ request, supabase, user: null })
    } catch (err) {
      return error(err)
    }
  }
}
