import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClientCompat } from '@/lib/subdomain-auth'
import { checkSupabase } from '@/lib/check-supabase'
import { payoutSchema } from '@/lib/validators/stripe'
import { log } from '@/lib/log'
import { appendAttributionAuditEvent } from '@/lib/attribution-audit'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-12-15.clover',
})

// Force dynamic rendering for this API route
export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  const check = checkSupabase()
  if (check) return check

  let payoutId: string | null = null

  try {
    const stripe = getStripeServerClient()
    const supabase = await createRouteHandlerClientCompat()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Only admins can process payouts
    const { data: userData } = await supabase
      .from('users')
      .select('is_admin, role')
      .eq('id', user.id)
      .single()

    if (!hasAdminAccess(userData)) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
    }

    const { affiliateId, amount, description, idempotencyKey } = payoutSchema.parse(await request.json())

    if (!affiliateId || !amount) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Get affiliate's Stripe Connect account
    const { data: affiliateData } = await supabase
      .from('users')
      .select('stripe_connect_account_id, stripe_connect_payouts_enabled')
      .eq('id', affiliateId)
      .single()

    if (!affiliateData?.stripe_connect_account_id) {
      return NextResponse.json({ error: 'Affiliate has no Stripe Connect account' }, { status: 400 })
    }

    if (!affiliateData.stripe_connect_payouts_enabled) {
      return NextResponse.json({ error: 'Affiliate payouts not enabled' }, { status: 400 })
    }

    // Idempotency: if there is a pending/paid payout with same idempotency key, reuse
    if (idempotencyKey) {
      const { data: existing } = await supabase
        .from('affiliate_payouts')
        .select('stripe_transfer_id, status')
        .eq('idempotency_key', idempotencyKey)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle()

      if (existing?.stripe_transfer_id) {
        return NextResponse.json({
          success: existing.status === 'paid',
          transferId: existing.stripe_transfer_id,
          amount
        })
      }
    }

    // Record the payout as pending
    const { data: pendingRows, error: insertErr } = await supabase
      .from('affiliate_payouts')
      .insert({
        user_id: affiliateId,
        amount: amount,
        currency: 'usd',
        status: 'pending',
        idempotency_key: idempotencyKey || null,
        payout_date: new Date().toISOString()
      })
      .select('id')
      .limit(1)

    if (insertErr) {
      log.error('Failed to insert pending payout', { error: insertErr.message })
      return NextResponse.json({ error: 'Could not record payout' }, { status: 500 })
    }

    payoutId = pendingRows?.[0]?.id || null

    await appendAttributionAuditEvent({
      eventType: 'commission_pending',
      payoutId,
      affiliateUserId: affiliateId,
      amount,
      currency: 'usd',
      source: 'api.stripe.connect.payout',
      metadata: {
        idempotency_key: idempotencyKey || null,
      },
    })

    // Create transfer to affiliate's Stripe Connect account
    try {
      const transfer = await stripe.transfers.create({
        amount: Math.round(amount * 100), // Convert to cents
        currency: 'usd',
        destination: affiliateData.stripe_connect_account_id,
        description: description || 'Affiliate commission payout',
        transfer_group: payoutId ? `payout_${payoutId}` : undefined
      })

      // Record the paid status for the payout
      const payoutPayload = {
        stripe_transfer_id: transfer.id,
        status: 'paid',
        payout_date: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }
      const { error: payoutError } = payoutId
        ? await supabase
          .from('affiliate_payouts')
          .update(payoutPayload)
          .eq('id', payoutId)
        : await supabase
          .from('affiliate_payouts')
          .insert({
            user_id: affiliateId,
            amount,
            currency: 'usd',
            ...payoutPayload,
          })

      if (payoutError) {
        log.error('Error recording payout', { error: payoutError.message })
        // Don't fail the request if database update fails, but log it
      }

      await appendAttributionAuditEvent({
        eventType: 'commission_paid',
        payoutId,
        affiliateUserId: affiliateId,
        amount,
        currency: 'usd',
        source: 'api.stripe.connect.payout',
        metadata: {
          stripe_transfer_id: transfer.id,
          idempotency_key: idempotencyKey || null,
        },
      })

      return NextResponse.json({
        success: true,
        transferId: transfer.id,
        amount: amount
      })
    } catch (transferError: any) {
      if (payoutId) {
        const { error: updateError } = await supabase
          .from('affiliate_payouts')
          .update({
            status: 'failed',
            updated_at: new Date().toISOString(),
          })
          .eq('id', payoutId)

        if (updateError) {
          log.error('Failed to mark payout as failed', { error: updateError.message, payoutId })
        }
      }

      await appendAttributionAuditEvent({
        eventType: 'commission_failed',
        payoutId,
        affiliateUserId: affiliateId,
        amount,
        currency: 'usd',
        source: 'api.stripe.connect.payout',
        metadata: {
          idempotency_key: idempotencyKey || null,
          error: transferError?.message || 'Stripe transfer failed',
        },
      })

      throw transferError
    }
  } catch (error: any) {
    log.error('Stripe payout error', { error: error?.message })
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
