import { NextRequest, NextResponse } from 'next/server'
import { stripe, STRIPE_PLANS, PlanType } from '@/lib/stripe'

export async function POST(request: NextRequest) {
  try {
    if (!stripe) {
      return NextResponse.json(
        { error: 'Stripe not configured' },
        { status: 503 }
      )
    }

    const body = await request.json()
    const { plan, userId, email } = body

    if (!plan || !STRIPE_PLANS[plan as PlanType]) {
      return NextResponse.json(
        { error: 'Invalid plan selected' },
        { status: 400 }
      )
    }

    const planConfig = STRIPE_PLANS[plan as PlanType]

    if (!planConfig.priceId) {
      return NextResponse.json(
        { error: 'Plan not configured. Please set Stripe price IDs in environment variables.' },
        { status: 500 }
      )
    }

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
      client_reference_id: userId,
      customer_email: email,
      metadata: {
        userId,
        plan,
      },
      subscription_data: {
        metadata: {
          userId,
          plan,
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
