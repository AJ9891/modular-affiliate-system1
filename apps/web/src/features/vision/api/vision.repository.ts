import { supabase } from '@/lib/supabase'
import type { VisionContext, VisionPlan } from '../domain/vision.types'

export async function loadVisionContext(route: string): Promise<VisionContext> {
  const { data: auth } = await supabase.auth.getUser()
  if (!auth.user) throw new Error('Sign in to load Vision platform context.')

  const [{ data: profile }, { data: launchpads }, analyticsResponse] = await Promise.all([
    supabase.from('users').select('plan,max_launchpads,email_automation_provisioned').eq('id', auth.user.id).single(),
    supabase.from('launchpads').select('id,status,funnel_id').eq('user_id', auth.user.id).is('deleted_at', null),
    fetch('/api/analytics?range=30d', { credentials: 'same-origin' }),
  ])
  const analytics = analyticsResponse.ok ? await analyticsResponse.json() : null
  const rows = launchpads ?? []
  const totals = analytics?.totals ?? analytics?.data?.totals ?? {}
  const active = rows.filter((item: { status?: string }) => item.status !== 'archived').length
  const latest = rows[0] as { id?: string; funnel_id?: string } | undefined

  return {
    user: { id: auth.user.id, plan: (profile?.plan ?? 'free') as VisionPlan, maxLaunchpads: profile?.max_launchpads ?? 0 },
    launchpads: {
      active, capacity: profile?.max_launchpads ?? 0,
      drafts: rows.filter((item: { status?: string }) => item.status === 'draft').length,
      live: rows.filter((item: { status?: string }) => item.status === 'live').length,
    },
    performance: {
      visitors: Number(totals.clicks ?? totals.visitors ?? 0), leads: Number(totals.leads ?? 0),
      conversions: Number(totals.conversions ?? 0), revenue: Number(totals.revenue ?? 0),
      conversionRate: Number(totals.conversionRate ?? 0),
    },
    emailAutomationReady: Boolean(profile?.email_automation_provisioned),
    currentLocation: { route, launchpadId: latest?.id, funnelId: latest?.funnel_id },
  }
}
