import { supabase } from '@/lib/supabase'
import type { VisionContext, VisionPlan } from '../domain/vision.types'

type LaunchpadRow = { id?: string; status?: string; funnel_id?: string }
type FunnelRow = { funnel_id?: string; status?: string }

export async function loadVisionContext(route: string): Promise<VisionContext> {
  const { data: auth, error: authError } = await supabase.auth.getUser()
  if (authError) throw new Error(`Unable to authenticate Vision: ${authError.message}`)
  if (!auth.user) throw new Error('Sign in to load Vision platform context.')

  const [profileResult, launchpadResult, analyticsResponse] = await Promise.all([
    supabase.from('users').select('plan,max_launchpads,email_automation_provisioned').eq('id', auth.user.id).single(),
    supabase.from('launchpads').select('id,status,funnel_id').eq('user_id', auth.user.id).is('deleted_at', null),
    fetch('/api/analytics?range=30d', { credentials: 'same-origin' }),
  ])

  if (profileResult.error) {
    throw new Error(`Unable to load Vision profile: ${profileResult.error.message}`)
  }
  if (launchpadResult.error) {
    throw new Error(`Unable to load Vision Launchpads: ${launchpadResult.error.message}`)
  }
  if (!analyticsResponse.ok || analyticsResponse.headers.get('X-Analytics-Degraded') === '1') {
    throw new Error('Unable to load reliable Vision analytics.')
  }

  const analytics = await analyticsResponse.json()
  const stats = analytics?.stats ?? {}
  const rows = (launchpadResult.data ?? []) as LaunchpadRow[]
  const funnelIds = rows.flatMap((item) => item.funnel_id ? [item.funnel_id] : [])
  let publishedFunnelIds = new Set<string>()

  if (funnelIds.length > 0) {
    const { data: funnels, error: funnelError } = await supabase
      .from('funnels')
      .select('funnel_id,status')
      .eq('user_id', auth.user.id)
      .in('funnel_id', funnelIds)

    if (funnelError) {
      throw new Error(`Unable to load Vision funnel state: ${funnelError.message}`)
    }

    publishedFunnelIds = new Set(
      ((funnels ?? []) as FunnelRow[])
        .filter((item) => item.status === 'published' && item.funnel_id)
        .map((item) => item.funnel_id as string)
    )
  }

  const isLive = (item: LaunchpadRow) =>
    item.status === 'live' || Boolean(item.funnel_id && publishedFunnelIds.has(item.funnel_id))
  const activeRows = rows.filter((item) => item.status !== 'archived')
  const latest = activeRows[0]

  return {
    user: {
      id: auth.user.id,
      plan: (profileResult.data?.plan ?? 'free') as VisionPlan,
      maxLaunchpads: profileResult.data?.max_launchpads ?? 0,
    },
    launchpads: {
      active: activeRows.length,
      capacity: profileResult.data?.max_launchpads ?? 0,
      drafts: activeRows.filter((item) => item.status === 'draft' && !isLive(item)).length,
      live: activeRows.filter(isLive).length,
    },
    performance: {
      visitors: Number(stats.totalClicks ?? 0),
      leads: Number(stats.totalLeads ?? 0),
      conversions: Number(stats.totalConversions ?? 0),
      revenue: Number(stats.totalRevenue ?? 0),
      conversionRate: Number(stats.conversionRate ?? 0),
    },
    emailAutomationReady: Boolean(profileResult.data?.email_automation_provisioned),
    currentLocation: { route, launchpadId: latest?.id, funnelId: latest?.funnel_id },
  }
}
