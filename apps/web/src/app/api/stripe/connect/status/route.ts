import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import Stripe from 'stripe'
import { checkSupabase } from '@/lib/check-supabase'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-12-15.clover',
})

export async function GET(request: NextRequest) {
  const check = checkSupabase()
  if (check) return check

  try {
    const supabase = createRouteHandlerClient({ cookies })
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user's Stripe Connect account
    const { data: userData } = await supabase
      .from('users')
      .select('stripe_connect_account_id, stripe_connect_onboarding_complete, stripe_connect_charges_enabled, stripe_connect_payouts_enabled')
      .eq('id', user.id)
      .single()

    if (!userData?.stripe_connect_account_id) {
      return NextResponse.json({
        connected: false,
        onboardingComplete: false,
        chargesEnabled: false,
        payoutsEnabled: false
      })
    }

    // Check account status with Stripe
    const account = await stripe.accounts.retrieve(userData.stripe_connect_account_id)

    const onboardingComplete = account.details_submitted
    const chargesEnabled = account.capabilities?.card_payments === 'active'
    const payoutsEnabled = account.capabilities?.transfers === 'active'

    // Update database if status changed
    if (onboardingComplete !== userData.stripe_connect_onboarding_complete ||
        chargesEnabled !== userData.stripe_connect_charges_enabled ||
        payoutsEnabled !== userData.stripe_connect_payouts_enabled) {

      await supabase
        .from('users')
        .update({
          stripe_connect_onboarding_complete: onboardingComplete,
          stripe_connect_charges_enabled: chargesEnabled,
          stripe_connect_payouts_enabled: payoutsEnabled,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id)
    }

    return NextResponse.json({
      connected: true,
      onboardingComplete,
      chargesEnabled,
      payoutsEnabled,
      accountId: userData.stripe_connect_account_id
    })
  } catch (error: any) {
    console.error('Stripe Connect status error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}