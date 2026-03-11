import Stripe from 'stripe'
import { NextRequest, NextResponse } from 'next/server'
import { log } from '@/lib/log'

function getStripe() {
  const key = process.env.STRIPE_SECRET_KEY
  if (!key) throw new Error('STRIPE_SECRET_KEY is not set')
  return new Stripe(key)
}

const PRICE_MAP: Record<string, string> = {
  starter: process.env.STRIPE_PRICE_STARTER || '',
  pro: process.env.STRIPE_PRICE_PRO || '',
  agency: process.env.STRIPE_PRICE_AGENCY || '',
}

function validatePayload(plan: string, email?: string) {
  if (!email) throw new Error('Email is required')
  if (!plan || !PRICE_MAP[plan]) throw new Error('Invalid plan')
}

export async function POST(req: NextRequest) {
  try {
    const { plan, userId, email } = await req.json()
    validatePayload(plan, email)

    const stripe = getStripe()

    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      customer_email: email,
      line_items: [
        {
          price: PRICE_MAP[plan],
          quantity: 1,
        },
      ],
      success_url: `${process.env.NEXT_PUBLIC_SITE_URL}/dashboard?success=1`,
      cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL}/pricing`,
      metadata: {
        userId: userId || 'unknown',
        source: 'sales-bot',
      },
    })

    return NextResponse.json({ url: session.url })
  } catch (error: any) {
    log.error('Create subscription checkout failed', { error: error?.message })
    return NextResponse.json(
      { error: error?.message || 'Unable to create checkout session' },
      { status: 400 }
    )
  }
}
