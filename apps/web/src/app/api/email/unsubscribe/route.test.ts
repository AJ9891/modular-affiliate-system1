import { beforeEach, describe, expect, it, vi } from 'vitest'
import { NextRequest } from 'next/server'
import { createUnsubscribeToken } from '@/lib/email/unsubscribe'

const mocks = vi.hoisted(() => ({
  from: vi.fn(),
  upsert: vi.fn(),
  update: vi.fn(),
}))

vi.mock('@/lib/supabase-server', () => ({
  createServiceRoleClient: () => ({ from: mocks.from }),
}))

import { POST } from '@/app/api/email/unsubscribe/route'

describe('email unsubscribe endpoint', () => {
  beforeEach(() => {
    vi.stubEnv('EMAIL_UNSUBSCRIBE_SECRET', 'test-secret-with-more-than-thirty-two-characters')
    mocks.from.mockImplementation((table: string) => {
      const query = {
        upsert: vi.fn((values: unknown, options: unknown) => {
          mocks.upsert(table, values, options)
          return Promise.resolve({ error: null })
        }),
        update: vi.fn((values: unknown) => {
          mocks.update(table, values)
          return query
        }),
        ilike: vi.fn(() => query),
        eq: vi.fn(() => query),
        is: vi.fn(() => query),
        then: (resolve: (value: unknown) => unknown, reject: (error: unknown) => unknown) =>
          Promise.resolve({ error: null }).then(resolve, reject),
      }
      return query
    })
  })

  it('persists tenant-scoped suppression for a valid one-click unsubscribe', async () => {
    const token = createUnsubscribeToken({
      email: 'Member@Example.test',
      userId: 'tenant-a',
    })
    const request = new NextRequest(
      `https://launchpad.example.test/api/email/unsubscribe?token=${encodeURIComponent(token)}`,
      {
        method: 'POST',
        headers: { 'content-type': 'application/x-www-form-urlencoded' },
        body: 'List-Unsubscribe=One-Click',
      }
    )

    const response = await POST(request)

    expect(response.status).toBe(200)
    expect(mocks.upsert).toHaveBeenCalledWith(
      'email_suppressions',
      expect.objectContaining({
        tenant_scope: 'tenant-a',
        user_id: 'tenant-a',
        email: 'member@example.test',
        reason: 'unsubscribed',
      }),
      { onConflict: 'tenant_scope,email' }
    )
    expect(mocks.update).toHaveBeenCalledWith(
      'email_subscribers',
      expect.objectContaining({ status: 'unsubscribed' })
    )
  })
})
