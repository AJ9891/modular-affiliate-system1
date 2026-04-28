import { NextResponse } from 'next/server'
import { withRouteHandler } from '@/features/shared/api/route-handler'
import { getAnalyticsSummary } from '@/features/analytics/server/analytics-summary.service'

export const dynamic = 'force-dynamic'

export const GET = withRouteHandler(async ({ request, supabase, user }) => {
  const searchParams = request.nextUrl.searchParams
  const range = searchParams.get('range') || '7d'
  const funnelId = searchParams.get('funnelId')

  const { payload, cache } = await getAnalyticsSummary(supabase, {
    userId: user!.id,
    range,
    funnelId,
  })

  return NextResponse.json(payload, {
    headers: {
      'X-Cache': cache,
    },
  })
})
