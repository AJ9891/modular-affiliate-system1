import Stripe from 'stripe'
import { NextRequest } from 'next/server'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

const PRICE_MAP: Record<string, string> = {
  starter: process.env.STRIPE_PRICE_STARTER!,
  pro: process.env.STRIPE_PRICE_PRO!,
  agency: process.env.STRIPE_PRICE_AGENCY!,
}

export async function POST(req: NextRequest) {
  const { plan, userId, email } = await req.json()

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
      userId,
      source: 'sales-bot',
    },
  })

  return Response.json({ url: session.url })
}
