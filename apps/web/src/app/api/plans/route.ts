import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { withRateLimit, withAuth, withErrorHandling } from '@/lib/api-middleware'
import { PLAN_DEFINITIONS } from '@/lib/plan-manager'

// GET /api/plans - Get all available plans
async function getPlans(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const includeFeatures = searchParams.get('includeFeatures') === 'true'

  const plans = Object.values(PLAN_DEFINITIONS).map(plan => ({
    tier: plan.tier,
    name: plan.name,
    price: plan.price,
    billingPeriod: plan.billingPeriod,
    ...(includeFeatures && {
      features: plan.features,
      limits: plan.limits,
      upgradeHooks: plan.upgradeHooks
    })
  }))

  return NextResponse.json({ plans })
}

// GET /api/plans/current - Get current user's plan status
async function getCurrentPlan(request: NextRequest) {
  const supabase = createRouteHandlerClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()

  // Get user's current plan and usage
  const { data: userData, error } = await supabase
    .from('users')
    .select('plan_tier')
    .eq('id', user!.id)
    .single()

  if (error) {
    throw new Error(`Failed to get user plan: ${error.message}`)
  }

  const currentPlan = PLAN_DEFINITIONS[userData.plan_tier] || PLAN_DEFINITIONS.free

  // Get current month's usage
  const today = new Date().toISOString().split('T')[0]
  const { data: usage } = await supabase
    .from('user_usage_tracking')
    .select('usage_type, usage_count')
    .eq('user_id', user!.id)
    .eq('reset_date', today)

  const currentUsage = (usage || []).reduce((acc, item) => {
    acc[item.usage_type] = item.usage_count
    return acc
  }, {} as Record<string, number>)

  // Get funnel count
  const { count: funnelCount } = await supabase
    .from('funnels')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', user!.id)
    .eq('active', true)

  return NextResponse.json({
    currentPlan: {
      tier: currentPlan.tier,
      name: currentPlan.name,
      price: currentPlan.price,
      limits: currentPlan.limits
    },
    usage: {
      funnels: funnelCount || 0,
      aiGenerations: currentUsage.ai_generation || 0,
      leadCaptures: currentUsage.lead_capture || 0
    },
    utilizationPercentage: {
      funnels: currentPlan.limits.maxFunnels === 'unlimited' ? 0 : 
        Math.round(((funnelCount || 0) / (currentPlan.limits.maxFunnels as number)) * 100),
      aiGenerations: currentPlan.limits.maxAIGenerationsPerMonth === 'unlimited' ? 0 :
        Math.round(((currentUsage.ai_generation || 0) / (currentPlan.limits.maxAIGenerationsPerMonth as number)) * 100),
      leadCaptures: currentPlan.limits.maxLeadsPerMonth === 'unlimited' ? 0 :
        Math.round(((currentUsage.lead_capture || 0) / (currentPlan.limits.maxLeadsPerMonth as number)) * 100)
    }
  })
}

// POST /api/plans/check-limit - Check if user can perform action
async function checkLimit(request: NextRequest) {
  const supabase = createRouteHandlerClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()
  
  const { action } = await request.json()

  if (!action) {
    throw new Error('Action is required')
  }

  const { data: result, error } = await supabase.rpc('check_plan_limit', {
    user_id_param: user!.id,
    feature_name_param: action
  })

  if (error) {
    throw new Error(`Failed to check limit: ${error.message}`)
  }

  return NextResponse.json({ canPerform: result })
}

// POST /api/plans/usage - Increment usage counter  
async function incrementUsage(request: NextRequest) {
  const supabase = createRouteHandlerClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()
  
  const { usageType } = await request.json()

  if (!usageType || !['ai_generation', 'lead_capture', 'funnel_creation'].includes(usageType)) {
    throw new Error('Valid usageType is required (ai_generation, lead_capture, funnel_creation)')
  }

  const { error } = await supabase.rpc('increment_usage', {
    user_id_param: user!.id,
    usage_type_param: usageType
  })

  if (error) {
    throw new Error(`Failed to increment usage: ${error.message}`)
  }

  return NextResponse.json({ success: true })
}

// GET /api/plans/upgrade-suggestions - Get personalized upgrade suggestions
async function getUpgradeSuggestions(request: NextRequest) {
  const supabase = createRouteHandlerClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()

  // Get current plan status
  const currentPlanResponse = await getCurrentPlan(request)
  const currentPlanData = await currentPlanResponse.json()

  const suggestions = []
  const { currentPlan, usage, utilizationPercentage } = currentPlanData

  // Free tier upgrade suggestions
  if (currentPlan.tier === 'free') {
    if (utilizationPercentage.leadCaptures >= 80) {
      suggestions.push({
        reason: 'You\'re approaching your 50 leads/month limit',
        suggestedTier: 'starter',
        urgency: 'high',
        benefit: 'Get 500 leads/month with professional templates'
      })
    }
    if (utilizationPercentage.aiGenerations >= 80) {
      suggestions.push({
        reason: 'You\'re using AI heavily',
        suggestedTier: 'starter', 
        urgency: 'medium',
        benefit: 'Get 200 AI generations/month plus email sequences'
      })
    }
    if (usage.funnels >= 1) {
      suggestions.push({
        reason: 'Ready to scale with multiple funnels?',
        suggestedTier: 'starter',
        urgency: 'low', 
        benefit: 'Create up to 3 funnels with all block types'
      })
    }
  }

  // Starter tier upgrade suggestions  
  if (currentPlan.tier === 'starter') {
    if (utilizationPercentage.leadCaptures >= 80) {
      suggestions.push({
        reason: 'Amazing growth! You\'re approaching 500 leads/month',
        suggestedTier: 'pro',
        urgency: 'high',
        benefit: 'Get unlimited leads plus custom domains'
      })
    }
    if (usage.funnels >= 2) {
      suggestions.push({
        reason: 'Ready for unlimited funnels?',
        suggestedTier: 'pro',
        urgency: 'medium', 
        benefit: 'Unlimited funnels, A/B testing, and AI optimization'
      })
    }
  }

  // Pro tier upgrade suggestions
  if (currentPlan.tier === 'pro') {
    // Check for team members
    const { count: teamCount } = await supabase
      .from('team_members')
      .select('id', { count: 'exact', head: true })
      .eq('account_owner_id', user!.id)
      .eq('status', 'active')

    if (teamCount > 0) {
      suggestions.push({
        reason: 'Managing a team?',
        suggestedTier: 'agency',
        urgency: 'medium',
        benefit: 'Team collaboration, white-label options, and client management'
      })
    }
  }

  return NextResponse.json({
    suggestions,
    currentPlan: currentPlan.tier,
    hasActiveSuggestions: suggestions.length > 0
  })
}

export const GET = withErrorHandling(withRateLimit(async (request: NextRequest) => {
  const { pathname } = new URL(request.url)
  
  if (pathname.endsWith('/current')) {
    return withAuth(getCurrentPlan)(request)
  } else if (pathname.endsWith('/upgrade-suggestions')) {
    return withAuth(getUpgradeSuggestions)(request)
  } else {
    return getPlans(request)
  }
}, { requests: 60, window: 60 }))

export const POST = withErrorHandling(withAuth(withRateLimit(async (request: NextRequest) => {
  const { pathname } = new URL(request.url)
  
  if (pathname.endsWith('/check-limit')) {
    return checkLimit(request)
  } else if (pathname.endsWith('/usage')) {
    return incrementUsage(request)
  }
  
  throw new Error('Invalid endpoint')
}, { requests: 30, window: 60 })))