import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import Stripe from 'stripe'
import { checkSupabase } from '@/lib/check-supabase'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-12-15.clover',
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

    // Check if user already has a Stripe Connect account
    const { data: userData } = await supabase
      .from('users')
      .select('stripe_connect_account_id, stripe_connect_onboarding_complete')
      .eq('id', user.id)
      .single()

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
      await supabase
        .from('users')
        .update({
          stripe_connect_account_id: accountId,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id)
    }

    // Create an account link for onboarding
    const accountLink = await stripe.accountLinks.create({
      account: accountId,
      refresh_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard`,
      return_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard`,
      type: 'account_onboarding',
    })

    return NextResponse.json({
      url: accountLink.url,
      accountId: accountId
    })
  } catch (error: any) {
    console.error('Stripe Connect onboarding error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}