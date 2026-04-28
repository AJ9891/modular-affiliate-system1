import type { SupabaseClient } from '@supabase/supabase-js'
import { createServiceRoleClient } from '@/lib/supabase-server'
import { getAnalyticsCacheKey, getCachedAnalytics, setCachedAnalytics } from '@/lib/cache/analytics'
import type { AnalyticsEvent, AnalyticsSummary, GetAnalyticsSummaryInput } from '@/features/analytics/types'

function createEmptyAnalyticsPayload(): AnalyticsSummary {
  return {
    success: true,
    stats: {
      totalLeads: 0,
      totalClicks: 0,
      totalConversions: 0,
      totalRevenue: 0,
      conversionRate: 0,
      avgRevenuePerLead: 0,
      emailsSent: 0,
      emailOpenRate: 0,
    },
    clicksBySource: {},
    clicksByOffer: {},
    recentClicks: [],
    recentActivity: [],
  }
}

function isRecoverableAnalyticsError(issue: unknown): boolean {
  if (!issue || typeof issue !== 'object') return false

  const candidate = issue as { code?: string; message?: string }
  const code = candidate.code || ''
  const message = (candidate.message || '').toLowerCase()

  return (
    code === 'PGRST205' ||
    code === '42P01' ||
    code === '42501' ||
    message.includes('could not find the table') ||
    message.includes('schema cache') ||
    message.includes('permission denied') ||
    message.includes('column')
  )
}

function rangeToStartDate(range: string) {
  const now = new Date()
  const startDate = new Date(now)

  switch (range) {
    case '24h':
      startDate.setHours(now.getHours() - 24)
      break
    case '30d':
      startDate.setDate(now.getDate() - 30)
      break
    case '90d':
      startDate.setDate(now.getDate() - 90)
      break
    case '7d':
    default:
      startDate.setDate(now.getDate() - 7)
      break
  }

  return startDate
}

export async function getAnalyticsSummary(
  supabase: SupabaseClient,
  input: GetAnalyticsSummaryInput
): Promise<{ payload: AnalyticsSummary; cache: 'HIT' | 'MISS' }> {
  const { userId, range, funnelId } = input
  const cacheKey = getAnalyticsCacheKey(userId, range, funnelId)
  const cachedPayload = getCachedAnalytics(cacheKey)
  if (cachedPayload) {
    return { payload: cachedPayload, cache: 'HIT' }
  }

  const startDate = rangeToStartDate(range)
  const payload = createEmptyAnalyticsPayload()
  const reader = process.env.SUPABASE_SERVICE_ROLE_KEY ? createServiceRoleClient() : supabase

  let funnelQuery = reader
    .from('funnels')
    .select('funnel_id')
    .eq('user_id', userId)

  if (funnelId) {
    funnelQuery = funnelQuery.eq('funnel_id', funnelId)
  }

  const { data: funnelRows, error: funnelError } = await funnelQuery

  if (funnelError) {
    if (!isRecoverableAnalyticsError(funnelError)) {
      throw funnelError
    }
    console.warn('Analytics funnel lookup degraded:', funnelError)
    setCachedAnalytics(cacheKey, payload)
    return { payload, cache: 'MISS' }
  }

  const funnelIds = (funnelRows || []).map((row) => row.funnel_id).filter(Boolean)

  if (funnelIds.length === 0) {
    setCachedAnalytics(cacheKey, payload)
    return { payload, cache: 'MISS' }
  }

  const [
    { data: leadsData, error: leadsError },
    { data: clicksData, error: clicksError },
  ] = await Promise.all([
    reader
      .from('leads')
      .select('id,email,source,funnel_id,created_at')
      .in('funnel_id', funnelIds)
      .gte('created_at', startDate.toISOString()),
    reader
      .from('clicks')
      .select('click_id,offer_id,funnel_id,utm_source,user_agent,ip_address,clicked_at')
      .in('funnel_id', funnelIds)
      .gte('clicked_at', startDate.toISOString()),
  ])

  if (leadsError && !isRecoverableAnalyticsError(leadsError)) {
    throw leadsError
  }
  if (clicksError && !isRecoverableAnalyticsError(clicksError)) {
    throw clicksError
  }

  if (leadsError) {
    console.warn('Analytics leads degraded:', leadsError)
  }
  if (clicksError) {
    console.warn('Analytics clicks degraded:', clicksError)
  }

  const leads = (leadsData || []) as Array<{
    email?: string | null
    source?: string | null
    funnel_id?: string | null
    created_at?: string | null
  }>

  const clicks = (clicksData || []) as Array<{
    click_id?: string | null
    offer_id?: string | null
    funnel_id?: string | null
    utm_source?: string | null
    user_agent?: string | null
    ip_address?: string | null
    clicked_at?: string | null
  }>

  const clickIds = clicks
    .map((click) => click.click_id)
    .filter((value): value is string => typeof value === 'string' && value.length > 0)

  let conversions: Array<{ amount?: number | null; converted_at?: string | null; click_id?: string | null }> = []

  if (clickIds.length > 0) {
    const { data: conversionsData, error: conversionsError } = await reader
      .from('conversions')
      .select('conversion_id,click_id,amount,converted_at')
      .in('click_id', clickIds)
      .gte('converted_at', startDate.toISOString())

    if (conversionsError && !isRecoverableAnalyticsError(conversionsError)) {
      throw conversionsError
    }

    if (conversionsError) {
      console.warn('Analytics conversions degraded:', conversionsError)
    } else {
      conversions = (conversionsData || []) as Array<{ amount?: number | null; converted_at?: string | null; click_id?: string | null }>
    }
  }

  const totalLeads = leads.length
  const totalClicks = clicks.length
  const totalConversions = conversions.length
  const totalRevenue = conversions.reduce((sum, conversion) => {
    const amount = typeof conversion.amount === 'number' ? conversion.amount : 0
    return sum + amount
  }, 0)
  const conversionRate = totalClicks > 0 ? Number(((totalConversions / totalClicks) * 100).toFixed(2)) : 0
  const avgRevenuePerLead = totalLeads > 0 ? Number((totalRevenue / totalLeads).toFixed(2)) : 0

  const clicksBySource = clicks.reduce<Record<string, number>>((acc, click) => {
    const source = click.utm_source || 'direct'
    acc[source] = (acc[source] || 0) + 1
    return acc
  }, {})

  const clicksByOffer = clicks.reduce<Record<string, number>>((acc, click) => {
    const offer = click.offer_id || click.funnel_id || 'unknown'
    acc[offer] = (acc[offer] || 0) + 1
    return acc
  }, {})

  const recentClicks: AnalyticsEvent[] = clicks
    .filter((click) => typeof click.clicked_at === 'string')
    .sort((a, b) => new Date(b.clicked_at as string).getTime() - new Date(a.clicked_at as string).getTime())
    .slice(0, 20)
    .map((click) => ({
      type: 'click',
      timestamp: click.clicked_at as string,
      source: click.utm_source || 'direct',
      funnel: click.funnel_id || undefined,
    }))

  const recentLeads: AnalyticsEvent[] = leads
    .filter((lead) => typeof lead.created_at === 'string')
    .sort((a, b) => new Date(b.created_at as string).getTime() - new Date(a.created_at as string).getTime())
    .slice(0, 20)
    .map((lead) => ({
      type: 'lead',
      timestamp: lead.created_at as string,
      email: lead.email || undefined,
      source: lead.source || 'unknown',
      funnel: lead.funnel_id || undefined,
    }))

  const recentConversions: AnalyticsEvent[] = conversions
    .filter((conversion) => typeof conversion.converted_at === 'string')
    .sort((a, b) => new Date(b.converted_at as string).getTime() - new Date(a.converted_at as string).getTime())
    .slice(0, 20)
    .map((conversion) => ({
      type: 'conversion',
      timestamp: conversion.converted_at as string,
      amount: typeof conversion.amount === 'number' ? conversion.amount : undefined,
    }))

  const recentActivity = [...recentClicks, ...recentLeads, ...recentConversions]
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .slice(0, 20)

  const responsePayload: AnalyticsSummary = {
    success: true,
    stats: {
      totalLeads,
      totalClicks,
      totalConversions,
      totalRevenue,
      conversionRate,
      avgRevenuePerLead,
      emailsSent: 0,
      emailOpenRate: 0,
    },
    clicksBySource,
    clicksByOffer,
    recentClicks,
    recentActivity,
  }

  setCachedAnalytics(cacheKey, responsePayload)
  return { payload: responsePayload, cache: 'MISS' }
}
