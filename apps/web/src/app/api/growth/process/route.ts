import { NextRequest } from 'next/server'
import { checkSupabase } from '@/lib/check-supabase'
import { createServerRouteClient } from '@/lib/supabase-server'
import { requireUser } from '@/lib/authz'
import { error, ok, readJson } from '@/lib/http'
import { generateGrowthAssistantResult } from '@/lib/growth-assistant/service'
import type { GrowthRange } from '@/lib/growth-assistant/types'

type ProcessRequest = {
  range?: GrowthRange
  funnelId?: string
}

function parseRange(value: unknown): GrowthRange {
  if (value === '24h' || value === '30d' || value === '90d') return value
  return '7d'
}

export async function POST(request: NextRequest) {
  const check = checkSupabase()
  if (check) return check

  try {
    const supabase = await createServerRouteClient()
    const user = await requireUser(supabase)
    const body = await readJson<ProcessRequest>(request)

    const range = parseRange(body?.range)
    const result = await generateGrowthAssistantResult(user.id, {
      range,
      funnelId: body?.funnelId,
      persist: true,
    }, supabase)

    return ok({
      success: true,
      generatedAt: result.generatedAt,
      persisted: true,
      counts: {
        funnelScores: result.funnelScores.length,
        insights: result.insights.length,
        recommendations: result.recommendations.length,
        alerts: result.alerts.length,
        abTestSuggestions: result.abTestSuggestions.length,
        optimizationIdeas: result.optimizationIdeas.length,
        plainEnglishInsights: result.plainEnglishInsights.length,
        forecasts: result.forecasts.length,
      },
    })
  } catch (err) {
    return error(err)
  }
}
