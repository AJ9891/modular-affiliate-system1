import { NextRequest } from 'next/server'
import { checkSupabase } from '@/lib/check-supabase'
import { createServerRouteClient } from '@/lib/supabase-server'
import { requireUser } from '@/lib/authz'
import { error, ok } from '@/lib/http'
import { generateGrowthAssistantResult } from '@/lib/growth-assistant/service'
import type { GrowthRange } from '@/lib/growth-assistant/types'

function parseRange(value: string | null): GrowthRange {
  if (value === '24h' || value === '30d' || value === '90d') return value
  return '7d'
}

export async function GET(request: NextRequest) {
  const check = checkSupabase()
  if (check) return check

  try {
    const supabase = await createServerRouteClient()
    const user = await requireUser(supabase)

    const params = request.nextUrl.searchParams
    const range = parseRange(params.get('range'))
    const funnelId = params.get('funnelId') || undefined
    const limit = Math.min(Math.max(Number(params.get('limit') || '20') || 20, 1), 200)

    const result = await generateGrowthAssistantResult(user.id, { range, funnelId }, supabase)

    return ok({
      success: true,
      range: result.range,
      generatedAt: result.generatedAt,
      periodStart: result.periodStart,
      periodEnd: result.periodEnd,
      funnelScores: result.funnelScores,
      pageDiagnostics: result.pageDiagnostics,
      dropoffPoints: result.dropoffPoints,
      insights: result.insights.slice(0, limit),
      total: result.insights.length,
    })
  } catch (err) {
    return error(err)
  }
}
