import { beforeEach, describe, expect, it, vi } from 'vitest'
import { NextRequest } from 'next/server'

const mocks = vi.hoisted(() => ({
  from: vi.fn(),
  rpc: vi.fn(),
  upsert: vi.fn(),
  addSubscriber: vi.fn(),
  triggerAutomation: vi.fn(),
}))

vi.mock('@/lib/supabase-server', () => ({
  createServiceRoleClient: () => ({ from: mocks.from, rpc: mocks.rpc }),
}))

vi.mock('@/lib/email/service', () => ({
  emailService: {
    addSubscriber: mocks.addSubscriber,
    triggerAutomation: mocks.triggerAutomation,
  },
}))

import { POST } from '@/app/api/integrations/membership/events/route'

const integration = { id: 'integration-a', user_id: 'tenant-a', automation_id: 'automation-a' }
const token = 'mock-integration-token-with-more-than-thirty-two-characters'

function installDatabaseMocks(shouldProcess = true, previousEnrollmentStatus: string | null = null) {
  mocks.from.mockImplementation((table: string) => {
    const query: Record<string, any> = {
      select: vi.fn(() => query),
      eq: vi.fn(() => query),
      update: vi.fn(() => query),
      upsert: vi.fn((values: unknown) => {
        mocks.upsert(table, values)
        return query
      }),
      contains: vi.fn(() => query),
      maybeSingle: vi.fn(async () => {
        if (table === 'membership_integrations') return { data: integration, error: null }
        if (table === 'email_automations') return { data: { id: integration.automation_id }, error: null }
        if (table === 'membership_enrollments') {
          return { data: previousEnrollmentStatus ? { status: previousEnrollmentStatus } : null, error: null }
        }
        return { data: null, error: null }
      }),
      then: (resolve: (value: unknown) => unknown, reject: (error: unknown) => unknown) =>
        Promise.resolve({ data: null, error: null }).then(resolve, reject),
    }
    return query
  })
  mocks.rpc.mockResolvedValue({
    data: [{ event_id: 'database-event-a', should_process: shouldProcess }],
    error: null,
  })
}

function request(body: unknown) {
  return new NextRequest('https://launchpad.example.test/api/integrations/membership/events', {
    method: 'POST',
    headers: {
      authorization: `Bearer ${token}`,
      'content-type': 'application/json',
    },
    body: JSON.stringify(body),
  })
}

describe('membership event integration', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mocks.upsert.mockReset()
    installDatabaseMocks()
    mocks.addSubscriber.mockResolvedValue({ id: 'subscriber-a' })
    mocks.triggerAutomation.mockResolvedValue({ triggered: true })
  })

  it('rejects events not marked paid by the verified sender', async () => {
    const response = await POST(request({
      type: 'membership.enrolled',
      eventId: 'evt-unpaid',
      membershipId: 'member-a',
      email: 'member@example.test',
      paymentStatus: 'unpaid',
    }))

    expect(response.status).toBe(400)
    expect(mocks.from).not.toHaveBeenCalled()
    expect(mocks.addSubscriber).not.toHaveBeenCalled()
  })

  it('uses the integration tenant and configured automation, not caller-supplied IDs', async () => {
    const response = await POST(request({
      type: 'membership.enrolled',
      eventId: 'evt-paid',
      membershipId: 'member-a',
      email: 'Member@Example.test',
      paymentStatus: 'paid',
      userId: 'tenant-b',
      automationId: 'automation-b',
    }))

    expect(response.status).toBe(400)
    expect(mocks.addSubscriber).not.toHaveBeenCalled()
  })

  it('idempotently enrolls a paid member in the integration tenant automation', async () => {
    const response = await POST(request({
      type: 'membership.enrolled',
      eventId: 'evt-paid',
      membershipId: 'member-a',
      email: 'Member@Example.test',
      paymentStatus: 'paid',
    }))

    expect(response.status).toBe(200)
    expect(mocks.addSubscriber).toHaveBeenCalledWith(expect.objectContaining({
      userId: 'tenant-a',
      email: 'Member@Example.test',
      triggerAutomations: false,
    }))
    expect(mocks.triggerAutomation).toHaveBeenCalledWith(
      'automation-a',
      { email: 'member@example.test', name: undefined },
      expect.objectContaining({
        expectedUserId: 'tenant-a',
        expectedTrigger: 'purchase',
        idempotencyKeyPrefix: expect.stringContaining('member-a'),
      })
    )
  })

  it('does not repeat email enrollment for a duplicate event', async () => {
    installDatabaseMocks(false)
    const response = await POST(request({
      type: 'membership.enrolled',
      eventId: 'evt-duplicate',
      membershipId: 'member-a',
      email: 'member@example.test',
      paymentStatus: 'paid',
    }))

    expect(response.status).toBe(200)
    expect(mocks.addSubscriber).not.toHaveBeenCalled()
    expect(mocks.triggerAutomation).not.toHaveBeenCalled()
  })

  it('keeps an active enrollment active on a later distinct enrollment event', async () => {
    installDatabaseMocks(true, 'active')
    const response = await POST(request({
      type: 'membership.enrolled',
      eventId: 'evt-later',
      membershipId: 'member-a',
      email: 'member@example.test',
      paymentStatus: 'paid',
    }))

    expect(response.status).toBe(200)
    expect(mocks.upsert).toHaveBeenCalledWith(
      'membership_enrollments',
      expect.objectContaining({ status: 'active' })
    )
    expect(mocks.triggerAutomation).not.toHaveBeenCalled()
  })

  it('cancels queued messages for the integration-scoped membership', async () => {
    const response = await POST(request({
      type: 'membership.cancelled',
      eventId: 'evt-cancelled',
      membershipId: 'member-a',
    }))

    expect(response.status).toBe(200)
    expect(mocks.addSubscriber).not.toHaveBeenCalled()
    expect(mocks.triggerAutomation).not.toHaveBeenCalled()
    expect(mocks.from).toHaveBeenCalledWith('email_autoresponder_jobs')
  })
})
