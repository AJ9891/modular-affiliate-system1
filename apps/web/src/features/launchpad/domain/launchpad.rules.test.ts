import { describe, expect, it } from 'vitest'
import {
  canCreateLaunchpad,
  canPublishLaunchpad,
  countActiveLaunchpads,
  getLaunchpadWorkflowStatus,
} from './launchpad.rules'

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
      { status: 'live', deleted_at: '2026-07-14T00:00:00.000Z' },
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

describe('getLaunchpadWorkflowStatus', () => {
  const complete = {
    preflightComplete: true,
    checklistComplete: true,
    hasFunnel: true,
    hasOffer: true,
    emailReady: true,
    checksPassed: true,
    published: false,
  }

  it('does not infer preflight completion from later data', () => {
    expect(getLaunchpadWorkflowStatus({
      ...complete,
      preflightComplete: false,
    })).toBe('ground-control')
  })

  it('reports readiness before publication', () => {
    expect(getLaunchpadWorkflowStatus(complete)).toBe('ready-to-publish')
  })

  it('reports live only after explicit publication', () => {
    expect(getLaunchpadWorkflowStatus({ ...complete, published: true })).toBe('live')
  })
})
