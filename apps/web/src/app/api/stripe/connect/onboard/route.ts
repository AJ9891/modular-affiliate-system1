import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClientCompat } from '@/lib/subdomain-auth'
import { checkSupabase } from '@/lib/check-supabase'
import { getStripeServerClient, resolveAppBaseUrl } from '@/lib/stripe-server'

// Force dynamic rendering for this API route
export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  const check = checkSupabase()
  if (check) return check

  try {
    const stripe = getStripeServerClient()
    const appBaseUrl = resolveAppBaseUrl(request)
    const supabase = await createRouteHandlerClientCompat()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user already has a Stripe Connect account
    const { data: userData, error: userQueryError } = await supabase
      .from('users')
      .select('stripe_connect_account_id, stripe_connect_onboarding_complete')
      .eq('id', user.id)
      .single()

    if (userQueryError) {
      throw new Error(`Unable to load user profile: ${userQueryError.message}`)
    }

    let accountId = userData?.stripe_connect_account_id

    if (!accountId) {
      // Create a new Stripe Connect account
      const account = await stripe.accounts.create({
        type: 'express',
        country: 'US',
        email: user.email,
        capabilities: {
          card_payments: { requested: true },
          transfers: { requested: true },
        },
      })

      accountId = account.id

      // Save the account ID to the database
      const { error: saveError } = await supabase
        .from('users')
        .update({
          stripe_connect_account_id: accountId,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id)

      if (saveError) {
        throw new Error(`Unable to save Stripe account: ${saveError.message}`)
      }
    }

    const account = await stripe.accounts.retrieve(accountId)
    const onboardingComplete = Boolean(account.details_submitted)

    if (onboardingComplete) {
      const loginLink = await stripe.accounts.createLoginLink(accountId)
      return NextResponse.json({
        url: loginLink.url,
        accountId,
        action: 'dashboard_login',
      })
    }

    // Create an account link for onboarding
    const accountLink = await stripe.accountLinks.create({
      account: accountId,
      refresh_url: `${appBaseUrl}/subscription`,
      return_url: `${appBaseUrl}/subscription`,
      type: 'account_onboarding',
    })

    return NextResponse.json({
      url: accountLink.url,
      accountId,
      action: 'onboarding',
    })
  } catch (error: any) {
    console.error('Stripe Connect onboarding error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
