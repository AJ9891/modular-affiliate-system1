import { NextRequest } from 'next/server'
import { checkSupabase } from '@/lib/check-supabase'
import { createServerRouteClient } from '@/lib/supabase-server'
import { requireUser } from '@/lib/authz'
import { error, ok } from '@/lib/http'
import { generateGrowthAssistantResult } from '@/lib/growth-assistant/service'
import type { GrowthRange, Severity } from '@/lib/growth-assistant/types'

function parseRange(value: string | null): GrowthRange {
  if (value === '24h' || value === '30d' || value === '90d') return value
  return '7d'
}

function isSeverity(value: string | null): value is Severity {
  return value === 'low' || value === 'medium' || value === 'high' || value === 'critical'
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
    const state = params.get('state') || 'active'
    const severity = params.get('severity')
    const limit = Math.min(Math.max(Number(params.get('limit') || '20') || 20, 1), 200)

    const result = await generateGrowthAssistantResult(user.id, { range, funnelId }, supabase)

    const alerts = result.alerts
      .filter((item) => (state ? item.state === state : true))
      .filter((item) => (isSeverity(severity) ? item.severity === severity : true))
      .slice(0, limit)

    return ok({
      success: true,
      range: result.range,
      generatedAt: result.generatedAt,
      alerts,
      total: alerts.length,
    })
  } catch (err) {
    return error(err)
  }
}
