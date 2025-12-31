import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import Stripe from 'stripe'
import { checkSupabase } from '@/lib/check-supabase'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-12-15.clover' as any,
})

export async function POST(request: NextRequest) {
  const check = checkSupabase()
  if (check) return check

  try {
    const supabase = createRouteHandlerClient({ cookies })
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Only admins can process payouts
    const { data: userData } = await supabase
      .from('users')
      .select('is_admin')
      .eq('id', user.id)
      .single()

    if (!userData?.is_admin) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
    }

    const { affiliateId, amount, description } = await request.json()

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

    // Create transfer to affiliate's Stripe Connect account
    const transfer = await stripe.transfers.create({
      amount: Math.round(amount * 100), // Convert to cents
      currency: 'usd',
      destination: affiliateData.stripe_connect_account_id,
      description: description || 'Affiliate commission payout',
    })

    // Record the payout in database
    const { error: payoutError } = await supabase
      .from('affiliate_payouts')
      .insert({
        user_id: affiliateId,
        amount: amount,
        currency: 'usd',
        stripe_transfer_id: transfer.id,
        status: 'paid',
        payout_date: new Date().toISOString()
      })

    if (payoutError) {
      console.error('Error recording payout:', payoutError)
      // Don't fail the request if database insert fails, but log it
    }

    return NextResponse.json({
      success: true,
      transferId: transfer.id,
      amount: amount
    })
  } catch (error: any) {
    console.error('Stripe payout error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}