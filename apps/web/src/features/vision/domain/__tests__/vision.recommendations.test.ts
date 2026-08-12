import { describe, expect, it } from 'vitest'
import { attachVisionContext, recommendNextAction, VISION_ACTION_DEFINITIONS } from '../vision.recommendations'
import type { VisionContext } from '../vision.types'

const context: VisionContext = {
  user: { id: 'user-1', plan: 'starter', maxLaunchpads: 2 },
  launchpads: { active: 1, capacity: 2, drafts: 0, live: 1 },
  performance: { visitors: 250, leads: 10, conversions: 1, revenue: 50, conversionRate: 0.4 },
  emailAutomationReady: true,
  currentLocation: { route: '/launchpad/vision-preview', launchpadId: 'launchpad-1', funnelId: 'funnel-3' },
}

describe('Vision recommendations', () => {
  it('prioritizes capacity before other recommendations', () => {
    expect(recommendNextAction({ ...context, launchpads: { ...context.launchpads, active: 2 } }).actionId).toBe('upgrade-capacity')
  })

  it('routes high traffic and low conversion to the optimizer', () => {
    expect(recommendNextAction(context).actionId).toBe('optimize-funnel')
  })

  it('uses routes that exist in the application', () => {
    expect(VISION_ACTION_DEFINITIONS['configure-email'].href).toBe('/email')
    expect(VISION_ACTION_DEFINITIONS['upgrade-capacity'].href).toBe('/subscription')
  })

  it('attaches stable resource context without allowing invented routes', () => {
    expect(attachVisionContext('/ai-optimizer', context)).toBe('/ai-optimizer?launchpadId=launchpad-1&funnelId=funnel-3&from=vision')
  })
})
