import { NextResponse } from 'next/server'
import { createRouteHandlerClientCompat } from '@/lib/subdomain-auth'
import { createServiceRoleClient } from '@/lib/supabase-server'
import { hasAdminAccess } from '@/lib/admin-access'

async function requireAdmin() {
  const supabase = await createRouteHandlerClientCompat()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) }
  }

  const { data: profile } = await supabase
    .from('users')
    .select('is_admin, role')
    .eq('id', user.id)
    .maybeSingle()

  const isAdmin = hasAdminAccess(profile)

  if (!isAdmin) {
    return { error: NextResponse.json({ error: 'Forbidden' }, { status: 403 }) }
  }

  return { user }
}

export async function GET() {
  const auth = await requireAdmin()
  if ('error' in auth) return auth.error

  try {
    const adminClient = createServiceRoleClient()
    const { data, error } = await adminClient
      .from('users')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(200)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    const users = (data || []).map((row: Record<string, unknown>) => ({
      id: String(row.id || ''),
      email: typeof row.email === 'string' ? row.email : '',
      role: typeof row.role === 'string' ? row.role : undefined,
      is_admin: typeof row.is_admin === 'boolean' ? row.is_admin : false,
      created_at: typeof row.created_at === 'string' ? row.created_at : undefined,
      subscription_plan:
        typeof row.subscription_plan === 'string'
          ? row.subscription_plan
          : typeof row.plan === 'string'
            ? row.plan
            : undefined,
      plan: typeof row.plan === 'string' ? row.plan : undefined,
    }))

    return NextResponse.json({ users }, { status: 200 })
  } catch (error: unknown) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch users' },
      { status: 500 }
    )
  }
}
