import { describe, expect, it } from 'vitest'
import { canCreateLaunchpad, canPublishLaunchpad, countActiveLaunchpads } from './launchpad.rules'

describe('canCreateLaunchpad', () => {
  it.each([
    [0, 1, true],
    [1, 1, false],
    [19, 20, true],
    [20, 20, false],
    [0, 0, false],
  ])('returns %s < %s as %s', (activeCount, maxLaunchpads, expected) => {
    expect(canCreateLaunchpad({ activeCount, maxLaunchpads })).toBe(expected)
  })

  it('does not count archived launchpads', () => {
    expect(countActiveLaunchpads([
      { status: 'draft' },
      { status: 'live' },
      { status: 'archived' },
    ])).toBe(2)
  })
})

describe('canPublishLaunchpad', () => {
  it('requires every publishing prerequisite', () => {
    expect(canPublishLaunchpad({
      hasFunnel: true,
      hasOffer: true,
      emailReady: true,
      checksPassed: false,
    })).toBe(false)
  })

  it('allows publishing when every prerequisite passes', () => {
    expect(canPublishLaunchpad({
      hasFunnel: true,
      hasOffer: true,
      emailReady: true,
      checksPassed: true,
    })).toBe(true)
  })
})
