import { describe, expect, it } from 'vitest'
import { resolvePublishedFunnel } from '@/lib/tracking/public-funnel'

describe('resolvePublishedFunnel', () => {
  const published = {
    funnel_id: 'funnel-a',
    user_id: 'owner-a',
    status: 'published',
    active: true,
  }

  it('uses the database owner for a public funnel', () => {
    expect(resolvePublishedFunnel(published, 'funnel-a')).toEqual({
      funnelId: 'funnel-a',
      ownerUserId: 'owner-a',
    })
  })

  it.each([
    ['another funnel', { ...published, funnel_id: 'funnel-b' }, 'funnel-a'],
    ['a draft', { ...published, status: 'draft' }, 'funnel-a'],
    ['an inactive funnel', { ...published, active: false }, 'funnel-a'],
    ['a funnel without an owner', { ...published, user_id: null }, 'funnel-a'],
  ])('rejects %s', (_description, funnel, requestedId) => {
    expect(resolvePublishedFunnel(funnel, requestedId)).toBeNull()
  })
})
