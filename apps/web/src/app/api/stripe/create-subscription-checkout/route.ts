import { NextRequest, NextResponse } from 'next/server'
import { log } from '@/lib/log'
import { validateSubscription } from '@/lib/validators/stripe'
import { ok, error } from '@/lib/http'
import { getStripeServerClient, resolveAppBaseUrl } from '@/lib/stripe-server'
import { getExpectedPlanAmountCents, type BillingCycle, type BillingPlan } from '@/lib/billing/plans'

const verifiedPlanPrices = new Set<string>()

const PRICE_MAP: Record<BillingPlan, Record<BillingCycle, string>> = {
  starter: {
    monthly: process.env.STRIPE_STARTER_PRICE_ID || process.env.STRIPE_PRICE_STARTER || '',
    annual:
      process.env.STRIPE_STARTER_ANNUAL_PRICE_ID ||
      process.env.STRIPE_PRICE_STARTER_ANNUAL ||
      '',
  },
  pro: {
    monthly: process.env.STRIPE_PRO_PRICE_ID || process.env.STRIPE_PRICE_PRO || '',
    annual: process.env.STRIPE_PRO_ANNUAL_PRICE_ID || process.env.STRIPE_PRICE_PRO_ANNUAL || '',
  },
  agency: {
    monthly: process.env.STRIPE_AGENCY_PRICE_ID || process.env.STRIPE_PRICE_AGENCY || '',
    annual:
      process.env.STRIPE_AGENCY_ANNUAL_PRICE_ID ||
      process.env.STRIPE_PRICE_AGENCY_ANNUAL ||
      '',
  },
}

function validatePayload(plan: BillingPlan, billingCycle: BillingCycle, email?: string) {
  if (!email) throw new Error('Email is required')

  const priceId = PRICE_MAP[plan][billingCycle]
  if (!priceId) {
    throw new Error(`Stripe price ID is not configured for ${plan} (${billingCycle})`)
  }

  return priceId
}

async function assertPlanPriceMatchesLanding(
  stripe: ReturnType<typeof getStripeServerClient>,
  plan: BillingPlan,
  billingCycle: BillingCycle,
  priceId: string
) {
  const cacheKey = `${plan}:${billingCycle}:${priceId}`
  if (verifiedPlanPrices.has(cacheKey)) return

  const expectedAmountCents = getExpectedPlanAmountCents(plan, billingCycle)
  const expectedInterval = billingCycle === 'annual' ? 'year' : 'month'
  const price = await stripe.prices.retrieve(priceId)

  const isExpectedPrice =
    price.active &&
    price.currency === 'usd' &&
    price.type === 'recurring' &&
    price.recurring?.interval === expectedInterval &&
    price.unit_amount === expectedAmountCents

  if (!isExpectedPrice) {
    throw new Error(
      `Configured Stripe price for ${plan} (${billingCycle}) does not match landing-page pricing.`
    )
  }

  verifiedPlanPrices.add(cacheKey)
}

export async function POST(req: NextRequest) {
  try {
    const { plan, billingCycle, userId, email } = validateSubscription(await req.json())
    const selectedPlan = plan as BillingPlan
    const selectedBillingCycle = billingCycle as BillingCycle
    const priceId = validatePayload(selectedPlan, selectedBillingCycle, email)

    const stripe = getStripeServerClient()
    const baseUrl = resolveAppBaseUrl(req)
    await assertPlanPriceMatchesLanding(stripe, selectedPlan, selectedBillingCycle, priceId)

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
        billingCycle: selectedBillingCycle,
        source: 'sales-bot',
      },
    })

    return ok({ url: session.url })
  } catch (err: any) {
    log.error('Create subscription checkout failed', { error: err?.message })
    return error(err)
  }
}
