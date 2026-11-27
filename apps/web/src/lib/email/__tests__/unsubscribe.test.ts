import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createUnsubscribeToken, verifyUnsubscribeToken } from '@/lib/email/unsubscribe'

describe('email unsubscribe tokens', () => {
  beforeEach(() => {
    vi.stubEnv('EMAIL_UNSUBSCRIBE_SECRET', 'test-secret-with-more-than-thirty-two-characters')
  })

  it('signs the normalized address and tenant scope', () => {
    const token = createUnsubscribeToken({
      email: 'Member@Example.test',
      userId: 'tenant-a',
    })

    expect(token).not.toContain('member@example.test')
    expect(verifyUnsubscribeToken(token)).toEqual({
      email: 'member@example.test',
      userId: 'tenant-a',
    })
  })

  it('rejects tampered tokens', () => {
    const token = createUnsubscribeToken({
      email: 'member@example.test',
      userId: 'tenant-a',
    })

    expect(verifyUnsubscribeToken(`${token.slice(0, -1)}x`)).toBeNull()
  })
})
