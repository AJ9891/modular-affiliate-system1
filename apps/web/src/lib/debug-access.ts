import type { SupabaseClient, User } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'
import { hasAdminAccess } from '@/lib/admin-access'
import { createServerRouteClient } from '@/lib/supabase-server'
import { requireUser } from '@/lib/authz'

type DebugAccessResult =
  | {
      allowed: true
      supabase: SupabaseClient
      user: User
    }
  | {
      allowed: false
      response: Response
    }

export async function requireDebugAccess(): Promise<DebugAccessResult> {
  if (process.env.NODE_ENV === 'production' && process.env.ENABLE_DEBUG_API !== '1') {
    return {
      allowed: false,
      response: NextResponse.json({ error: 'Not found' }, { status: 404 }),
    }
  }

  try {
    const supabase = await createServerRouteClient()
    const user = await requireUser(supabase)
    const { data: profile, error } = await supabase
      .from('users')
      .select('is_admin, role')
      .eq('id', user.id)
      .maybeSingle()

    if (error || !hasAdminAccess(profile)) {
      return {
        allowed: false,
        response: NextResponse.json({ error: 'Forbidden' }, { status: 403 }),
      }
    }

    return { allowed: true, supabase, user }
  } catch {
    return {
      allowed: false,
      response: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }),
    }
  }
}
