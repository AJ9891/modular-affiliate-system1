import { describe, expect, it } from 'vitest'
import {
  getHesitationTip,
  getStepUnlockMessage,
  isLaunchpadStepId,
} from '@/lib/launchpad/contextualGuidance'

describe('launchpad contextual guidance', () => {
  it('returns unlock messaging for known steps', () => {
    expect(getStepUnlockMessage('welcome')).toContain('Mission context unlocked')
    expect(getStepUnlockMessage('launch')).toContain('Launch controls unlocked')
  })

  it('returns hesitation tips for known steps', () => {
    expect(getHesitationTip('offers')).toContain('Attach one offer first')
    expect(getHesitationTip('email')).toContain('Enable automation now')
  })

  it('guards valid step ids', () => {
    expect(isLaunchpadStepId('welcome')).toBe(true)
    expect(isLaunchpadStepId('launch')).toBe(true)
    expect(isLaunchpadStepId('analytics')).toBe(false)
  })
})
