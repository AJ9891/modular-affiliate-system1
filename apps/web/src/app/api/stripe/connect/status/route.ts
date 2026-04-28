import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClientCompat } from '@/lib/subdomain-auth'
import { checkSupabase } from '@/lib/check-supabase'
import { getStripeServerClient } from '@/lib/stripe-server'

// Force dynamic rendering for this API route
export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  const check = checkSupabase()
  if (check) return check

  try {
    const stripe = getStripeServerClient()
    const supabase = await createRouteHandlerClientCompat()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user's Stripe Connect account
    const { data: userData, error: userQueryError } = await supabase
      .from('users')
      .select('stripe_connect_account_id, stripe_connect_onboarding_complete, stripe_connect_charges_enabled, stripe_connect_payouts_enabled')
      .eq('id', user.id)
      .single()

    if (userQueryError) {
      throw new Error(`Unable to load Stripe status: ${userQueryError.message}`)
    }

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

    const onboardingComplete = Boolean(account.details_submitted)
    const chargesEnabled = Boolean(account.charges_enabled)
    const payoutsEnabled = Boolean(account.payouts_enabled)

    // Update database if status changed
    if (onboardingComplete !== userData.stripe_connect_onboarding_complete ||
        chargesEnabled !== userData.stripe_connect_charges_enabled ||
        payoutsEnabled !== userData.stripe_connect_payouts_enabled) {

      const { error: updateError } = await supabase
        .from('users')
        .update({
          stripe_connect_onboarding_complete: onboardingComplete,
          stripe_connect_charges_enabled: chargesEnabled,
          stripe_connect_payouts_enabled: payoutsEnabled,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id)

      if (updateError) {
        throw new Error(`Unable to persist Stripe status: ${updateError.message}`)
      }
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
