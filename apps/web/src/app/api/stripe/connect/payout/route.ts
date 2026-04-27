import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClientCompat } from '@/lib/subdomain-auth'
import { checkSupabase } from '@/lib/check-supabase'
import { payoutSchema } from '@/lib/validators/stripe'
import { log } from '@/lib/log'
import { getStripeServerClient } from '@/lib/stripe-server'
import { hasAdminAccess } from '@/lib/admin-access'

// Force dynamic rendering for this API route
export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  const check = checkSupabase()
  if (check) return check

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

    const payoutId = pendingRows?.[0]?.id

    // Create transfer to affiliate's Stripe Connect account
    const transfer = await stripe.transfers.create({
      amount: Math.round(amount * 100), // Convert to cents
      currency: 'usd',
      destination: affiliateData.stripe_connect_account_id,
      description: description || 'Affiliate commission payout',
      transfer_group: payoutId ? `payout_${payoutId}` : undefined
    })

    // Record the payout in database
    const { error: payoutError } = await supabase
      .from('affiliate_payouts')
      .insert({
        id: payoutId,
        user_id: affiliateId,
        amount: amount,
        currency: 'usd',
        stripe_transfer_id: transfer.id,
        status: 'paid',
        payout_date: new Date().toISOString()
      })
      .select()

    if (payoutError) {
      log.error('Error recording payout', { error: payoutError.message })
      // Don't fail the request if database insert fails, but log it
    }

    return NextResponse.json({
      success: true,
      transferId: transfer.id,
      amount: amount
    })
  } catch (error: any) {
    log.error('Stripe payout error', { error: error?.message })
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
