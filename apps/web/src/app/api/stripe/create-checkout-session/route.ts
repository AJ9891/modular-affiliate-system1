import { NextRequest, NextResponse } from 'next/server'
import { stripe, STRIPE_PLANS, PlanType } from '@/lib/stripe'
import { getExpectedPlanAmountCents } from '@/lib/billing/plans'
import { checkSupabase } from '@/lib/check-supabase'
import { createServerRouteClient } from '@/lib/supabase-server'
import { requireUser } from '@/lib/authz'

const verifiedPlanPrices = new Set<string>()

async function assertPlanPriceMatchesLanding(plan: PlanType, priceId: string) {
  if (!stripe) {
    throw new Error('Stripe not configured')
  }

  const cacheKey = `${plan}:${priceId}`
  if (verifiedPlanPrices.has(cacheKey)) return

  const expectedAmountCents = getExpectedPlanAmountCents(plan)
  const price = await stripe.prices.retrieve(priceId)

  const isExpectedPrice =
    price.active &&
    price.currency === 'usd' &&
    price.type === 'recurring' &&
    price.recurring?.interval === 'month' &&
    price.unit_amount === expectedAmountCents

  if (!isExpectedPrice) {
    throw new Error(
      `Configured Stripe price for ${plan} does not match landing-page pricing ($${expectedAmountCents / 100}/mo).`
    )
  }

  verifiedPlanPrices.add(cacheKey)
}

export async function POST(request: NextRequest) {
  const check = checkSupabase()
  if (check) return check

  try {
    if (!stripe) {
      return NextResponse.json(
        { error: 'Stripe not configured' },
        { status: 503 }
      )
    }

    const body = await request.json()
    const { plan } = body
    const supabase = await createServerRouteClient()
    const user = await requireUser(supabase)
    const email = user.email

    if (!plan || !STRIPE_PLANS[plan as PlanType]) {
      return NextResponse.json(
        { error: 'Invalid plan selected' },
        { status: 400 }
      )
    }

    if (!email) {
      return NextResponse.json(
        { error: 'Authenticated user email is required for checkout' },
        { status: 400 }
      )
    }

    const selectedPlan = plan as PlanType
    const planConfig = STRIPE_PLANS[selectedPlan]

    if (!planConfig.priceId) {
      return NextResponse.json(
        { error: 'Plan not configured. Please set Stripe price IDs in environment variables.' },
        { status: 500 }
      )
    }

    await assertPlanPriceMatchesLanding(selectedPlan, planConfig.priceId)

    // Create Stripe Checkout Session
    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [
        {
          price: planConfig.priceId,
          quantity: 1,
        },
      ],
      success_url: `${request.nextUrl.origin}/dashboard?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${request.nextUrl.origin}/pricing`,
      client_reference_id: user.id,
      customer_email: email,
      metadata: {
        userId: user.id,
        plan: selectedPlan,
      },
      subscription_data: {
        metadata: {
          userId: user.id,
          plan: selectedPlan,
        },
      },
    })

    return NextResponse.json({ sessionId: session.id, url: session.url })
  } catch (error: any) {
    console.error('Stripe checkout error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to create checkout session' },
      { status: 500 }
    )
  }
}
