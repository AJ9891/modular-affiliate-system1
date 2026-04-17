import { NextRequest, NextResponse } from 'next/server'
import { log } from '@/lib/log'
import { validateSubscription } from '@/lib/validators/stripe'
import { ok, error } from '@/lib/http'
import { getStripeServerClient, resolveAppBaseUrl } from '@/lib/stripe-server'
import { getExpectedPlanAmountCents, type BillingPlan } from '@/lib/billing/plans'

const verifiedPlanPrices = new Set<string>()

const PRICE_MAP: Record<BillingPlan, string> = {
  starter: process.env.STRIPE_STARTER_PRICE_ID || process.env.STRIPE_PRICE_STARTER || '',
  pro: process.env.STRIPE_PRO_PRICE_ID || process.env.STRIPE_PRICE_PRO || '',
  agency: process.env.STRIPE_AGENCY_PRICE_ID || process.env.STRIPE_PRICE_AGENCY || '',
}

function validatePayload(plan: BillingPlan, email?: string) {
  if (!email) throw new Error('Email is required')

  const priceId = PRICE_MAP[plan]
  if (!priceId) {
    throw new Error(`Stripe price ID is not configured for plan: ${plan}`)
  }

  return priceId
}

async function assertPlanPriceMatchesLanding(
  stripe: ReturnType<typeof getStripeServerClient>,
  plan: BillingPlan,
  priceId: string
) {
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

export async function POST(req: NextRequest) {
  try {
    const { plan, userId, email } = validateSubscription(await req.json())
    const selectedPlan = plan as BillingPlan
    const priceId = validatePayload(selectedPlan, email)

    const stripe = getStripeServerClient()
    const baseUrl = resolveAppBaseUrl(req)
    await assertPlanPriceMatchesLanding(stripe, selectedPlan, priceId)

    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      customer_email: email,
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: `${baseUrl}/dashboard?success=1`,
      cancel_url: `${baseUrl}/pricing`,
      metadata: {
        userId: userId || 'unknown',
        plan: selectedPlan,
        source: 'sales-bot',
      },
    })

    return ok({ url: session.url })
  } catch (error: any) {
    log.error('Create subscription checkout failed', { error: error?.message })
    return error(error)
  }
}
