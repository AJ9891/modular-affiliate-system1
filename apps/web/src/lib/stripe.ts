import Stripe from 'stripe'
import { PLAN_MONTHLY_PRICE_USD } from '@/lib/billing/plans'

if (!process.env.STRIPE_SECRET_KEY) {
  console.warn('Warning: STRIPE_SECRET_KEY not set. Stripe features will be disabled.')
}

export const stripe = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2025-12-15.clover',
    })
  : null

// credit conversion helper — decide how many credits per $1
export function dollarsToCredits(amountUSD: number) {
  // e.g., 1 USD = 10 credits (tweak to your pricing)
  return amountUSD * 10
}

export const STRIPE_PLANS = {
  starter: {
    name: 'Starter',
    priceId: process.env.STRIPE_STARTER_PRICE_ID || '',
    price: PLAN_MONTHLY_PRICE_USD.starter,
    features: [
      '3 Active Funnels',
      'Basic Templates',
      'Analytics Dashboard',
      'Email Support',
    ],
  },
  pro: {
    name: 'Pro',
    priceId: process.env.STRIPE_PRO_PRICE_ID || '',
    price: PLAN_MONTHLY_PRICE_USD.pro,
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
    price: PLAN_MONTHLY_PRICE_USD.agency,
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
