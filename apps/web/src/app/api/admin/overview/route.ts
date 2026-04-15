import { NextResponse } from 'next/server'
import { createRouteHandlerClientCompat } from '@/lib/subdomain-auth'
import { createServiceRoleClient } from '@/lib/supabase-server'

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

  const isAdmin = profile?.is_admin === true || profile?.role === 'admin' || profile?.role === 'owner'

  if (!isAdmin) {
    return { error: NextResponse.json({ error: 'Forbidden' }, { status: 403 }) }
  }

  return { user }
}

async function safeCount(table: string) {
  try {
    const adminClient = createServiceRoleClient()
    const { count } = await adminClient.from(table).select('*', { count: 'exact', head: true })
    return count || 0
  } catch {
    return 0
  }
}

async function safeRevenue() {
  try {
    const adminClient = createServiceRoleClient()
    const { data } = await adminClient.from('conversions').select('amount')
    return (data || []).reduce((sum, row: Record<string, unknown>) => {
      const amount = typeof row.amount === 'number' ? row.amount : Number(row.amount || 0)
      return sum + (Number.isFinite(amount) ? amount : 0)
    }, 0)
  } catch {
    return 0
  }
}

export async function GET() {
  const auth = await requireAdmin()
  if ('error' in auth) return auth.error

  const [totalUsers, totalFunnels, totalClicks, totalConversions, totalRevenue] = await Promise.all([
    safeCount('users'),
    safeCount('funnels'),
    safeCount('clicks'),
    safeCount('conversions'),
    safeRevenue(),
  ])

  return NextResponse.json(
    {
      totalUsers,
      totalFunnels,
      totalRevenue,
      totalClicks,
      totalConversions,
    },
    { status: 200 }
  )
}
