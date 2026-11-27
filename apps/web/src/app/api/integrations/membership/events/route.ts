import { createHash } from 'crypto'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { emailService } from '@/lib/email/service'
import { createServiceRoleClient } from '@/lib/supabase-server'

const enrolledEventSchema = z.object({
  type: z.literal('membership.enrolled'),
  eventId: z.string().min(1).max(255),
  membershipId: z.string().min(1).max(255),
  email: z.string().email().max(320),
  name: z.string().max(100).optional(),
  paymentStatus: z.literal('paid'),
}).strict()

const cancelledEventSchema = z.object({
  type: z.literal('membership.cancelled'),
  eventId: z.string().min(1).max(255),
  membershipId: z.string().min(1).max(255),
}).strict()

const membershipEventSchema = z.discriminatedUnion('type', [
  enrolledEventSchema,
  cancelledEventSchema,
])

function getBearerToken(request: NextRequest): string | null {
  const value = request.headers.get('authorization')
  if (!value?.startsWith('Bearer ')) return null
  const token = value.slice('Bearer '.length).trim()
  return token.length >= 32 ? token : null
}

function hashToken(token: string): string {
  return createHash('sha256').update(token).digest('hex')
}

export async function POST(request: NextRequest) {
  const token = getBearerToken(request)
  if (!token) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const parsed = membershipEventSchema.safeParse(await request.json().catch(() => null))
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid membership event' }, { status: 400 })
  }

  const event = parsed.data
  const admin = createServiceRoleClient()
  const { data: integration, error: integrationError } = await admin
    .from('membership_integrations')
    .select('id,user_id,automation_id')
    .eq('api_key_hash', hashToken(token))
    .eq('active', true)
    .maybeSingle()

  if (integrationError) {
    console.error('Membership integration lookup failed:', integrationError)
    return NextResponse.json({ error: 'Integration unavailable' }, { status: 503 })
  }
  if (!integration) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { data: claims, error: claimError } = await admin.rpc(
    'claim_membership_integration_event',
    {
      p_integration_id: integration.id,
      p_external_event_id: event.eventId,
      p_external_membership_id: event.membershipId,
      p_event_type: event.type,
      p_email: event.type === 'membership.enrolled' ? event.email.toLowerCase() : null,
    }
  )

  if (claimError) {
    console.error('Unable to claim membership event:', claimError)
    return NextResponse.json({ error: 'Unable to process membership event' }, { status: 503 })
  }

  const claim = Array.isArray(claims) ? claims[0] : null
  if (!claim?.should_process) {
    return NextResponse.json({ received: true, duplicate: true }, { status: 200 })
  }

  try {
    if (event.type === 'membership.enrolled') {
      const { data: automation, error: automationError } = await admin
        .from('email_automations')
        .select('id')
        .eq('id', integration.automation_id)
        .eq('user_id', integration.user_id)
        .eq('trigger', 'purchase')
        .eq('active', true)
        .maybeSingle()

      if (automationError) throw automationError
      if (!automation) throw new Error('Configured tenant purchase automation is unavailable')

      const { data: previousEnrollment, error: enrollmentReadError } = await admin
        .from('membership_enrollments')
        .select('status')
        .eq('integration_id', integration.id)
        .eq('external_membership_id', event.membershipId)
        .maybeSingle()

      if (enrollmentReadError) throw enrollmentReadError

      const { error: enrollmentError } = await admin
        .from('membership_enrollments')
        .upsert(
          {
            integration_id: integration.id,
            external_membership_id: event.membershipId,
            email: event.email.toLowerCase(),
            status: previousEnrollment?.status === 'active' ? 'active' : 'pending',
            updated_at: new Date().toISOString(),
          },
          { onConflict: 'integration_id,external_membership_id' }
        )
      if (enrollmentError) throw enrollmentError

      if (previousEnrollment?.status !== 'active') {
        await emailService.addSubscriber({
          userId: integration.user_id,
          email: event.email,
          name: event.name,
          listName: 'Membership',
          tags: ['bellaneuvo-membership'],
          triggerAutomations: false,
        })

        const result = await emailService.triggerAutomation(
          integration.automation_id,
          { email: event.email.toLowerCase(), name: event.name },
          {
            expectedUserId: integration.user_id,
            expectedTrigger: 'purchase',
            idempotencyKeyPrefix: `membership:${integration.id}:${event.membershipId}:${event.eventId}`,
            metadata: {
              integration_id: integration.id,
              membership_id: event.membershipId,
              membership_event_id: event.eventId,
            },
          }
        )

        if (result.triggered !== true) {
          throw new Error('Configured membership automation did not trigger')
        }

        const { error: activateError } = await admin
          .from('membership_enrollments')
          .update({ status: 'active', updated_at: new Date().toISOString() })
          .eq('integration_id', integration.id)
          .eq('external_membership_id', event.membershipId)
        if (activateError) throw activateError
      }
    } else {
      const { error: enrollmentError } = await admin
        .from('membership_enrollments')
        .upsert(
          {
            integration_id: integration.id,
            external_membership_id: event.membershipId,
            status: 'cancelled',
            updated_at: new Date().toISOString(),
          },
          { onConflict: 'integration_id,external_membership_id' }
        )
      if (enrollmentError) throw enrollmentError

      const { error: cancelJobsError } = await admin
        .from('email_autoresponder_jobs')
        .update({
          status: 'cancelled',
          last_error: 'Membership cancelled before delivery',
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', integration.user_id)
        .eq('status', 'queued')
        .contains('metadata', {
          integration_id: integration.id,
          membership_id: event.membershipId,
        })
      if (cancelJobsError) throw cancelJobsError
    }

    const { error: completeError } = await admin
      .from('membership_integration_events')
      .update({ status: 'processed', processed_at: new Date().toISOString(), updated_at: new Date().toISOString() })
      .eq('id', claim.event_id)
    if (completeError) throw completeError

    return NextResponse.json({ received: true, duplicate: false }, { status: 200 })
  } catch (error) {
    const { error: recordError } = await admin
      .from('membership_integration_events')
      .update({ status: 'failed', updated_at: new Date().toISOString() })
      .eq('id', claim.event_id)
    if (recordError) console.error('Unable to record membership event failure:', recordError)
    console.error('Membership integration event failed:', error)
    return NextResponse.json({ error: 'Membership event processing failed' }, { status: 500 })
  }
}
