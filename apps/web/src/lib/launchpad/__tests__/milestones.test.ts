import { describe, expect, it } from 'vitest'
import { getUnlockedMilestones } from '@/lib/launchpad/milestones'

describe('launchpad milestones', () => {
  it('returns no milestones below thresholds', () => {
    const unlocked = getUnlockedMilestones(
      { visitors: 99, conversions: 0 },
      new Set()
    )
    expect(unlocked).toEqual([])
  })

  it('unlocks first visitor milestone at 100 visitors', () => {
    const unlocked = getUnlockedMilestones(
      { visitors: 100, conversions: 0 },
      new Set()
    )
    expect(unlocked.map((item) => item.id)).toEqual(['first-100-visitors'])
  })

  it('unlocks conversion milestone at first conversion', () => {
    const unlocked = getUnlockedMilestones(
      { visitors: 10, conversions: 1 },
      new Set()
    )
    expect(unlocked.map((item) => item.id)).toEqual(['first-conversion'])
  })

  it('does not return milestones that are already seen', () => {
    const unlocked = getUnlockedMilestones(
      { visitors: 200, conversions: 3 },
      new Set(['first-100-visitors', 'first-conversion'])
    )
    expect(unlocked).toEqual([])
  })
})

