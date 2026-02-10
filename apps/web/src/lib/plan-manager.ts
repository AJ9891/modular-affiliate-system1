import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

export interface PlanLimits {
  maxFunnels: number | 'unlimited'
  maxLeadsPerMonth: number | 'unlimited'
  maxAIGenerationsPerMonth: number | 'unlimited'
  maxEmailSequences: number | 'unlimited'
  analyticsRetentionDays: number
  canUseCustomDomains: boolean
  canABTest: boolean
  canAutoOptimize: boolean
  canWhiteLabel: boolean
  maxTeamMembers: number
  supportLevel: 'community' | 'email'
}

export interface PlanDefinition {
  tier: string
  name: string
  price: number
  billingPeriod: 'month'
  limits: PlanLimits
  features: string[]
  upgradeHooks: string[]
}

export const PLAN_DEFINITIONS: Record<string, PlanDefinition> = {
  free: {
    tier: 'free',
    name: 'Launchpad Free',
    price: 0,
    billingPeriod: 'month',
    limits: {
      maxFunnels: 1,
      maxLeadsPerMonth: 50,
      maxAIGenerationsPerMonth: 25,
      maxEmailSequences: 0,
      analyticsRetentionDays: 7,
      canUseCustomDomains: false,
      canABTest: false,
      canAutoOptimize: false,
      canWhiteLabel: false,
      maxTeamMembers: 1,
      supportLevel: 'community'
    },
    features: [
      '1 active funnel (3 blocks max)',
      'Basic visual builder',
      '1 simple template',
      '25 AI generations/month',
      '50 leads/month',
      '7-day analytics retention',
      'Free subdomain',
      'Community support'
    ],
    upgradeHooks: [
      'Hit 50 leads limit',
      'Need more than 3 blocks',
      'Want professional templates',
      'Need email sequences'
    ]
  },

  starter: {
    tier: 'starter',
    name: 'Launchpad Starter',
    price: 30,
    billingPeriod: 'month',
    limits: {
      maxFunnels: 3,
      maxLeadsPerMonth: 500,
      maxAIGenerationsPerMonth: 200,
      maxEmailSequences: 5,
      analyticsRetentionDays: 30,
      canUseCustomDomains: false,
      canABTest: false,
      canAutoOptimize: false,
      canWhiteLabel: false,
      maxTeamMembers: 1,
      supportLevel: 'email'
    },
    features: [
      '3 active funnels',
      'All 7 block types + visual builder',
      '5 professional templates',
      '200 AI generations/month',
      '500 leads/month',
      '30-day analytics retention',
      'Basic email sequences (5 max)',
      'UTM tracking',
      'Email support'
    ],
    upgradeHooks: [
      'Hit 3 funnel limit',
      'Want custom domain',
      'Need A/B testing',
      'Hit 500 leads limit'
    ]
  },

  pro: {
    tier: 'pro',
    name: 'Launchpad Pro',
    price: 45,
    billingPeriod: 'month',
    limits: {
      maxFunnels: 'unlimited',
      maxLeadsPerMonth: 'unlimited',
      maxAIGenerationsPerMonth: 'unlimited',
      maxEmailSequences: 'unlimited',
      analyticsRetentionDays: 365,
      canUseCustomDomains: true,
      canABTest: true,
      canAutoOptimize: true,
      canWhiteLabel: false,
      maxTeamMembers: 1,
      supportLevel: 'email'
    },
    features: [
      'Unlimited funnels',
      'Custom domains',
      'Unlimited AI generations',
      'Unlimited leads',
      '12-month analytics retention',
      'Advanced templates & themes',
      'A/B testing with AI optimizer auto-apply',
      'Advanced email sequences (unlimited)',
      'Real-time analytics dashboard'
    ],
    upgradeHooks: [
      'Need team collaboration',
      'Want white-label options',
      'Require client management',
      'Need reseller capabilities'
    ]
  },

  agency: {
    tier: 'agency',
    name: 'Launchpad Agency',
    price: 60,
    billingPeriod: 'month',
    limits: {
      maxFunnels: 'unlimited',
      maxLeadsPerMonth: 'unlimited',
      maxAIGenerationsPerMonth: 'unlimited',
      maxEmailSequences: 'unlimited',
      analyticsRetentionDays: 365,
      canUseCustomDomains: true,
      canABTest: true,
      canAutoOptimize: true,
      canWhiteLabel: true,
      maxTeamMembers: 10,
      supportLevel: 'email'
    },
    features: [
      'Everything in Pro',
      'Team collaboration (up to 10 members)',
      'White-label options (remove branding)',
      'Client management dashboard',
      'Advanced team permissions & roles',
      'Team activity logging & audit trails',
      'Custom integrations',
      'Reseller capabilities'
    ],
    upgradeHooks: []
  }
}

export class PlanManager {
  private supabase

  constructor() {
    this.supabase = createRouteHandlerClient({ cookies })
  }

  // Check if user can perform action based on their plan limits
  async checkLimit(userId: string, limitType: keyof PlanLimits): Promise<boolean> {
    try {
      const { data, error } = await this.supabase.rpc('check_plan_limit', {
        user_id_param: userId,
        feature_name_param: this.limitTypeToFeatureName(limitType)
      })

      if (error) throw error
      return data
    } catch (error) {
      console.error('Error checking plan limit:', error)
      return false
    }
  }

  // Increment usage counter for plan limit tracking
  async incrementUsage(userId: string, usageType: 'ai_generation' | 'lead_capture' | 'funnel_creation'): Promise<void> {
    try {
      const { error } = await this.supabase.rpc('increment_usage', {
        user_id_param: userId,
        usage_type_param: usageType
      })

      if (error) throw error
    } catch (error) {
      console.error('Error incrementing usage:', error)
    }
  }

  // Get user's current plan and usage
  async getUserPlanStatus(userId: string) {
    try {
      const { data: user, error: userError } = await this.supabase
        .from('users')
        .select('plan_tier, max_funnels, max_leads_per_month, max_ai_generations_per_month, can_use_custom_domains, can_ab_test, can_auto_optimize')
        .eq('id', userId)
        .single()

      if (userError) throw userError

      const { data: usage, error: usageError } = await this.supabase
        .from('user_usage_tracking')
        .select('usage_type, usage_count')
        .eq('user_id', userId)
        .eq('reset_date', new Date().toISOString().split('T')[0])

      if (usageError) throw usageError

      const currentUsage = usage.reduce((acc, item) => {
        acc[item.usage_type] = item.usage_count
        return acc
      }, {} as Record<string, number>)

      return {
        plan: user.plan_tier,
        limits: PLAN_DEFINITIONS[user.plan_tier]?.limits || PLAN_DEFINITIONS.free.limits,
        currentUsage: {
          aiGenerations: currentUsage.ai_generation || 0,
          leadCaptures: currentUsage.lead_capture || 0,
          funnelCreations: currentUsage.funnel_creation || 0
        }
      }
    } catch (error) {
      console.error('Error getting user plan status:', error)
      throw error
    }
  }

  // Check if user needs to upgrade based on usage
  async shouldSuggestUpgrade(userId: string): Promise<{ shouldUpgrade: boolean, reason: string, suggestedTier: string }> {
    try {
      const status = await getUserPlanStatus(userId)
      const currentPlan = PLAN_DEFINITIONS[status.plan]

      // Check various upgrade triggers
      if (status.plan === 'free') {
        if (status.currentUsage.leadCaptures >= 40) { // 80% of limit
          return {
            shouldUpgrade: true,
            reason: 'You\'re approaching your 50 leads/month limit. Upgrade to Starter for 500 leads/month.',
            suggestedTier: 'starter'
          }
        }
        if (status.currentUsage.aiGenerations >= 20) { // 80% of limit
          return {
            shouldUpgrade: true,
            reason: 'You\'re using AI heavily! Upgrade to Starter for 200 generations/month.',
            suggestedTier: 'starter'
          }
        }
      }

      if (status.plan === 'starter') {
        if (status.currentUsage.leadCaptures >= 400) { // 80% of limit
          return {
            shouldUpgrade: true,
            reason: 'Amazing growth! Upgrade to Pro for unlimited leads and custom domains.',
            suggestedTier: 'pro'
          }
        }

        // Check funnel count
        const { count: funnelCount } = await this.supabase
          .from('funnels')
          .select('id', { count: 'exact', head: true })
          .eq('user_id', userId)
          .eq('active', true)

        if ((funnelCount ?? 0) >= 2) {
          return {
            shouldUpgrade: true,
            reason: 'Ready for more funnels? Upgrade to Pro for unlimited funnels and A/B testing.',
            suggestedTier: 'pro'
          }
        }
      }

      if (status.plan === 'pro') {
        // Check if they have team members (would need agency)
        const { count: teamCount } = await this.supabase
          .from('team_members')
          .select('id', { count: 'exact', head: true })
          .eq('account_owner_id', userId)
          .eq('status', 'active')

        if ((teamCount ?? 0) > 0) {
          return {
            shouldUpgrade: true,
            reason: 'Managing a team? Upgrade to Agency for collaboration tools and white-label options.',
            suggestedTier: 'agency'
          }
        }
      }

      return { shouldUpgrade: false, reason: '', suggestedTier: '' }
    } catch (error) {
      console.error('Error checking upgrade suggestion:', error)
      return { shouldUpgrade: false, reason: '', suggestedTier: '' }
    }
  }

  private limitTypeToFeatureName(limitType: keyof PlanLimits): string {
    const mapping: Record<keyof PlanLimits, string> = {
      maxFunnels: 'max_funnels',
      maxLeadsPerMonth: 'max_leads_per_month',
      maxAIGenerationsPerMonth: 'max_ai_generations_per_month',
      maxEmailSequences: 'max_email_sequences',
      analyticsRetentionDays: 'analytics_retention_days',
      canUseCustomDomains: 'can_use_custom_domains',
      canABTest: 'can_ab_test',
      canAutoOptimize: 'can_auto_optimize',
      canWhiteLabel: 'can_white_label',
      maxTeamMembers: 'max_team_members',
      supportLevel: 'support_level'
    }
    return mapping[limitType]
  }
}

// Helper functions
export async function getUserPlanStatus(userId: string) {
  const planManager = new PlanManager()
  return await planManager.getUserPlanStatus(userId)
}

export async function checkUserCanPerform(userId: string, action: keyof PlanLimits): Promise<boolean> {
  const planManager = new PlanManager()
  return await planManager.checkLimit(userId, action)
}

export async function incrementUserUsage(userId: string, usageType: 'ai_generation' | 'lead_capture' | 'funnel_creation'): Promise<void> {
  const planManager = new PlanManager()
  return await planManager.incrementUsage(userId, usageType)
}

export default PlanManager
