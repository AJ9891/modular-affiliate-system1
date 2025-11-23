import Stripe from 'stripe'

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('Missing STRIPE_SECRET_KEY environment variable')
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2024-11-20.acacia',
  typescript: true,
})

export const STRIPE_PLANS = {
  starter: {
    name: 'Starter',
    priceId: process.env.STRIPE_STARTER_PRICE_ID || '',
    price: 29,
    features: [
      '1 Active Funnel',
      'Basic Templates',
      'Analytics Dashboard',
      'Email Support',
    ],
  },
  pro: {
    name: 'Pro',
    priceId: process.env.STRIPE_PRO_PRICE_ID || '',
    price: 79,
    features: [
      'Unlimited Funnels',
      'Premium Templates',
      'AI Content Generation',
      'Advanced Analytics',
      'Priority Support',
    ],
  },
  agency: {
    name: 'Agency',
    priceId: process.env.STRIPE_AGENCY_PRICE_ID || '',
    price: 199,
    features: [
      'Everything in Pro',
      'White Label Options',
      'Team Collaboration',
      'Dedicated Account Manager',
      'Custom Integrations',
    ],
  },
} as const

export type PlanType = keyof typeof STRIPE_PLANS
