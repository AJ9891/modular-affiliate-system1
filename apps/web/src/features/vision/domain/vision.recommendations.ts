import type { VisionActionId, VisionContext, VisionRecommendation } from './vision.types'

export const VISION_ACTION_DEFINITIONS: Record<VisionActionId, Omit<VisionRecommendation, 'priority'> & { label: string; href: string; description: string }> = {
  'build-funnel': { actionId: 'build-funnel', label: 'Build a Funnel', href: '/visual-builder', description: 'Create a user-owned funnel instance.', reason: 'A funnel is the foundation for traffic and conversion.' },
  'view-analytics': { actionId: 'view-analytics', label: 'View Analytics', href: '/analytics', description: 'Inspect traffic, conversions, and revenue.', reason: 'Performance data will show where the journey is leaking.' },
  'optimize-funnel': { actionId: 'optimize-funnel', label: 'Optimize Funnel', href: '/ai-optimizer', description: 'Improve a selected funnel using its real performance.', reason: 'Traffic is present, but the conversion rate is below 1%.' },
  'manage-offers': { actionId: 'manage-offers', label: 'Manage Offers', href: '/offers', description: 'Attach and maintain affiliate destinations.', reason: 'Offer setup is the next required commercial step.' },
  'configure-email': { actionId: 'configure-email', label: 'Configure Email', href: '/email', description: 'Provision and configure the follow-up sequence.', reason: 'Leads exist, but email automation is not ready.' },
  'resume-draft': { actionId: 'resume-draft', label: 'Resume Draft', href: '/launchpad', description: 'Continue an unfinished Launchpad.', reason: 'An unfinished Launchpad is ready to resume.' },
  'upgrade-capacity': { actionId: 'upgrade-capacity', label: 'Review Capacity', href: '/subscription', description: 'Review plan capacity and active Launchpads.', reason: 'Active Launchpads have reached the current plan limit.' },
  'open-admin': { actionId: 'open-admin', label: 'Open Admin', href: '/admin', description: 'Manage authorized platform operations.', reason: 'Administrative controls match this request.' },
}

export function attachVisionContext(href: string, context: VisionContext, recommendation?: VisionRecommendation): string {
  const url = new URL(href, 'https://vision.local')
  const launchpadId = recommendation?.launchpadId ?? context.currentLocation.launchpadId
  const funnelId = recommendation?.funnelId ?? context.currentLocation.funnelId
  if (launchpadId) url.searchParams.set('launchpadId', launchpadId)
  if (funnelId) url.searchParams.set('funnelId', funnelId)
  url.searchParams.set('from', 'vision')
  return `${url.pathname}${url.search}`
}

export function recommendNextAction(context: VisionContext): VisionRecommendation {
  if (context.launchpads.active >= context.user.maxLaunchpads) return { actionId: 'upgrade-capacity', priority: 100, reason: VISION_ACTION_DEFINITIONS['upgrade-capacity'].reason }
  if (context.performance.visitors > 100 && context.performance.conversionRate < 1) return { actionId: 'optimize-funnel', priority: 90, reason: VISION_ACTION_DEFINITIONS['optimize-funnel'].reason, funnelId: context.currentLocation.funnelId }
  if (context.performance.leads > 0 && !context.emailAutomationReady) return { actionId: 'configure-email', priority: 80, reason: VISION_ACTION_DEFINITIONS['configure-email'].reason, launchpadId: context.currentLocation.launchpadId }
  if (context.launchpads.drafts > 0) return { actionId: 'resume-draft', priority: 70, reason: VISION_ACTION_DEFINITIONS['resume-draft'].reason, launchpadId: context.currentLocation.launchpadId }
  return { actionId: 'build-funnel', priority: 10, reason: VISION_ACTION_DEFINITIONS['build-funnel'].reason }
}
