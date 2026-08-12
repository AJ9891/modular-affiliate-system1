import type { ElementType } from 'react'

export type VisionPlan = 'free' | 'starter' | 'pro' | 'agency'

export type VisionContext = {
  user: { id: string; plan: VisionPlan; maxLaunchpads: number }
  launchpads: { active: number; capacity: number; drafts: number; live: number }
  performance: {
    visitors: number
    leads: number
    conversions: number
    revenue: number
    conversionRate: number
  }
  emailAutomationReady: boolean
  currentLocation: { route: string; launchpadId?: string; funnelId?: string }
}

export type VisionActionId =
  | 'build-funnel'
  | 'view-analytics'
  | 'optimize-funnel'
  | 'manage-offers'
  | 'configure-email'
  | 'resume-draft'
  | 'upgrade-capacity'
  | 'open-admin'

export type VisionIntent =
  | 'build'
  | 'analytics'
  | 'optimize'
  | 'offers'
  | 'email'
  | 'admin'
  | 'next-best-action'
  | 'unknown'

export type VisionAction = {
  id: VisionActionId
  label: string
  description: string
  href: string
  icon: ElementType
  accent: 'cyan' | 'blue' | 'purple' | 'amber'
}

export type VisionRecommendation = {
  actionId: VisionActionId
  reason: string
  priority: number
  launchpadId?: string
  funnelId?: string
}

export type VisionChatMessage = {
  id: string
  role: 'user' | 'system'
  content: string
  actionId?: VisionActionId
  actionLabel?: string
  actionHref?: string
}

export type VisionResponse = {
  message: string
  intent: VisionIntent
  confidence: number
  recommendedAction?: { id: VisionActionId; label: string; href: string; reason: string }
  followUpQuestion?: string
}

export type VisionStat = { label: string; value: string; hint?: string }
