import { AIContext, RiskLevel } from './Context.types'

// Basic risk escalation helper; can be replaced with analytics-driven logic later.
export function assessRisk(context: AIContext): RiskLevel {
  if (context.location === 'CTAEditor' || context.location === 'FunnelComposer') return 'high'
  if (context.mode === 'live_funnel') return 'high'
  if (context.mode === 'onboarding') return 'low'
  return context.risk
}
