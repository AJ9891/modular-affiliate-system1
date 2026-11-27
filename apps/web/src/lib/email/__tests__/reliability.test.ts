import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { AutoresponderEmailProvider } from '@/lib/email/providers/autoresponder'
import { getEmailRetryDelayMs, isTransientEmailFailure } from '@/lib/email/reliability'
import type { SendEmailParams } from '@/lib/email/types'

const message: SendEmailParams = {
  to: { email: 'member@example.test' },
  userId: 'tenant-a',
  from: { email: 'noreply@example.test', name: 'Test' },
  subject: 'Membership update',
  html: '<p>Membership update</p>',
  messageType: 'transactional',
}

describe('email delivery reliability', () => {
  beforeEach(() => {
    vi.stubEnv('EMAIL_UNSUBSCRIBE_SECRET', 'test-secret-with-more-than-thirty-two-characters')
    vi.stubEnv('NEXT_PUBLIC_APP_URL', 'https://launchpad.example.test')
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('uses capped exponential backoff and retries only known transient failures', () => {
    expect(getEmailRetryDelayMs(1)).toBe(60_000)
    expect(getEmailRetryDelayMs(3)).toBe(240_000)
    expect(getEmailRetryDelayMs(99)).toBeLessThanOrEqual(60 * 60 * 1000)
    expect(isTransientEmailFailure({ name: 'ThrottlingException' })).toBe(true)
    expect(isTransientEmailFailure({ code: 'ECONNRESET' })).toBe(true)
    expect(isTransientEmailFailure({ name: 'MessageRejected' })).toBe(false)
  })

  it('retries a transient failure after backoff without sending before it is due', async () => {
    vi.useFakeTimers()
    const sendEmail = vi.fn()
      .mockRejectedValueOnce({ name: 'ThrottlingException' })
      .mockResolvedValue({ id: 'mock-message' })
    const provider = new AutoresponderEmailProvider({ sendEmail }, () => null)

    await provider.sendEmail({ ...message, idempotencyKey: 'retry-once' })
    expect(sendEmail).toHaveBeenCalledTimes(1)

    await provider.runDueJobs(1)
    expect(sendEmail).toHaveBeenCalledTimes(1)

    await vi.advanceTimersByTimeAsync(60_000)
    await provider.runDueJobs(1)
    expect(sendEmail).toHaveBeenCalledTimes(2)
    vi.useRealTimers()
  })

  it('deduplicates jobs with the same idempotency key', async () => {
    const sendEmail = vi.fn().mockResolvedValue({ id: 'mock-message' })
    const provider = new AutoresponderEmailProvider({ sendEmail }, () => null)

    const first = await provider.sendEmail({ ...message, idempotencyKey: 'same-job' })
    const second = await provider.sendEmail({ ...message, idempotencyKey: 'same-job' })

    expect(second.id).toBe(first.id)
    expect(sendEmail).toHaveBeenCalledTimes(1)
  })

  it('dispatches scheduled campaign recipients when they become due', async () => {
    vi.useFakeTimers()
    const sendEmail = vi.fn().mockResolvedValue({ id: 'mock-message' })
    const provider = new AutoresponderEmailProvider({ sendEmail }, () => null)
    const scheduledAt = new Date(Date.now() + 60_000)

    const campaign = await provider.createCampaign({
      userId: 'tenant-a',
      name: 'Scheduled campaign',
      fromEmail: 'noreply@example.test',
      fromName: 'Test',
      subject: 'Campaign update',
      template: { name: 'Campaign', subject: 'Campaign update', html: '<p>Campaign</p>' },
      recipients: [{ email: 'member@example.test' }],
      scheduledAt,
    })

    expect(campaign.status).toBe('scheduled')
    expect(sendEmail).not.toHaveBeenCalled()
    await vi.advanceTimersByTimeAsync(60_000)
    await provider.runDueJobs(1)
    expect(sendEmail).toHaveBeenCalledTimes(1)
  })

  it('processes the new immediate message ahead of older due jobs', async () => {
    vi.useFakeTimers()
    const sendEmail = vi.fn().mockResolvedValue({ id: 'mock-message' })
    const provider = new AutoresponderEmailProvider({ sendEmail }, () => null)
    const automation = await provider.createAutomation({
      userId: 'tenant-a',
      name: 'Delayed sequence',
      trigger: 'purchase',
      active: true,
      emails: [{
        delay: 1,
        template: { name: 'Follow-up', subject: 'Older due message', html: '<p>Follow-up</p>' },
      }],
    })

    await provider.triggerAutomation(automation.id!, { email: message.to.email })
    await vi.advanceTimersByTimeAsync(60 * 60 * 1000)
    await provider.sendEmail({
      ...message,
      subject: 'Immediate welcome',
      idempotencyKey: 'immediate-welcome',
    })

    expect(sendEmail).toHaveBeenCalledTimes(1)
    expect(sendEmail.mock.calls[0][0].subject).toBe('Immediate welcome')
    await provider.runDueJobs(1)
    expect(sendEmail).toHaveBeenCalledTimes(2)
    expect(sendEmail.mock.calls[1][0].subject).toBe('Older due message')
  })

  it('allows only one concurrent worker to claim an in-memory due job', async () => {
    vi.useFakeTimers()
    const sendEmail = vi.fn().mockResolvedValue({ id: 'mock-message' })
    const provider = new AutoresponderEmailProvider({ sendEmail }, () => null)
    const automation = await provider.createAutomation({
      userId: 'tenant-a',
      name: 'Membership follow-up',
      trigger: 'purchase',
      active: true,
      emails: [{ delay: 1, template: { name: 'Follow-up', subject: 'Follow-up', html: '<p>Follow-up</p>' } }],
    })

    await provider.triggerAutomation(automation.id!, { email: message.to.email }, {
      expectedUserId: 'tenant-a',
      expectedTrigger: 'purchase',
    })
    await vi.advanceTimersByTimeAsync(60 * 60 * 1000)
    await Promise.all([provider.runDueJobs(1), provider.runDueJobs(1)])

    expect(sendEmail).toHaveBeenCalledTimes(1)
    vi.useRealTimers()
  })
})
