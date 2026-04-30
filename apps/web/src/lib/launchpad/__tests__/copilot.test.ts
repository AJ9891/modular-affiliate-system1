import { describe, expect, it } from 'vitest'
import { getLaunchpadCopilotReply } from '@/lib/launchpad/copilot'

const baseContext = {
  stepId: 'funnel',
  hasFunnel: false,
  offerAttached: false,
  emailReady: false,
  launchChecksPassed: false,
  funnelPublished: false,
  selectedTemplate: '',
}

describe('launchpad copilot reply routing', () => {
  it('routes best-next-step questions to funnel when no draft exists', () => {
    const reply = getLaunchpadCopilotReply('What is the best next step?', baseContext)
    expect(reply.targetStep).toBe('funnel')
    expect(reply.suggestedAction).toBe('Build Funnel Draft')
  })

  it('routes to offers after funnel exists but offer is missing', () => {
    const reply = getLaunchpadCopilotReply('best next step', {
      ...baseContext,
      hasFunnel: true,
      selectedTemplate: 'lead-gen',
    })
    expect(reply.targetStep).toBe('offers')
  })

  it('routes email-specific questions to offers first when offer is missing', () => {
    const reply = getLaunchpadCopilotReply('how do i set email automation?', {
      ...baseContext,
      hasFunnel: true,
      offerAttached: false,
    })
    expect(reply.targetStep).toBe('offers')
    expect(reply.suggestedAction).toContain('Offer')
  })

  it('routes launch/publish intent to launch step', () => {
    const reply = getLaunchpadCopilotReply('ready to publish', {
      ...baseContext,
      hasFunnel: true,
      offerAttached: true,
      emailReady: true,
    })
    expect(reply.targetStep).toBe('launch')
  })
})

