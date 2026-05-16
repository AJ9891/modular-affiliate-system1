import { createServiceRoleClient } from '@/lib/supabase-server'
import { log } from '@/lib/log'

export const ATTRIBUTION_CLICK_COOKIE = 'aff_click_id'
export const ATTRIBUTION_SESSION_COOKIE = 'aff_session_id'
export const ATTRIBUTION_COOKIE_MAX_AGE = 30 * 24 * 60 * 60

export type AttributionAuditEventType =
  | 'session_started'
  | 'click_tracked'
  | 'conversion_tracked'
  | 'commission_pending'
  | 'commission_paid'
  | 'commission_failed'

type AuditMetadata = Record<string, unknown>

type AppendAttributionAuditEventInput = {
  eventType: AttributionAuditEventType
  clickId?: string | null
  conversionId?: string | null
  payoutId?: string | null
  attributionSessionId?: string | null
  affiliateUserId?: string | null
  offerId?: string | null
  funnelId?: string | null
  amount?: number | null
  currency?: string | null
  source?: string | null
  metadata?: AuditMetadata
}

export async function appendAttributionAuditEvent(input: AppendAttributionAuditEventInput) {
  try {
    const supabase = createServiceRoleClient()

    const { error } = await supabase.from('attribution_audit_events').insert({
      event_type: input.eventType,
      click_id: input.clickId ?? null,
      conversion_id: input.conversionId ?? null,
      payout_id: input.payoutId ?? null,
      attribution_session_id: input.attributionSessionId ?? null,
      affiliate_user_id: input.affiliateUserId ?? null,
      offer_id: input.offerId ?? null,
      funnel_id: input.funnelId ?? null,
      amount: input.amount ?? null,
      currency: input.currency ?? null,
      source: input.source ?? null,
      metadata: input.metadata ?? {},
      occurred_at: new Date().toISOString(),
    })

    if (error) {
      log.warn('Failed to append attribution audit event', {
        error: error.message,
        eventType: input.eventType,
        source: input.source ?? 'unknown',
      })
    }
  } catch (error: any) {
    log.warn('Attribution audit logger failed', {
      error: error?.message || 'unknown',
      eventType: input.eventType,
      source: input.source ?? 'unknown',
    })
  }
}
