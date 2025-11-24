import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { supabase } from '@/lib/supabase'
import { headers } from 'next/headers'

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || ''

export async function POST(request: NextRequest) {
  try {
    if (!stripe) {
      return NextResponse.json(
        { error: 'Stripe not configured' },
        { status: 503 }
      )
    }

    const body = await request.text()
    const signature = headers().get('stripe-signature')

    if (!signature) {
      return NextResponse.json(
        { error: 'Missing stripe-signature header' },
        { status: 400 }
      )
    }

    let event: any

    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
    } catch (err: any) {
      console.error('Webhook signature verification failed:', err.message)
      return NextResponse.json(
        { error: `Webhook Error: ${err.message}` },
        { status: 400 }
      )
    }

    // Handle the event
    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutSessionCompleted(event.data.object)
        break

      case 'customer.subscription.updated':
        await handleSubscriptionUpdated(event.data.object)
        break

      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(event.data.object)
        break

      case 'invoice.payment_succeeded':
        await handleInvoicePaymentSucceeded(event.data.object)
        break

      case 'invoice.payment_failed':
        await handleInvoicePaymentFailed(event.data.object)
        break

      default:
        console.log(`Unhandled event type: ${event.type}`)
    }

    return NextResponse.json({ received: true })
  } catch (error: any) {
    console.error('Webhook error:', error)
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    )
  }
}

async function handleCheckoutSessionCompleted(session: any) {
  const userId = session.metadata?.userId
  const plan = session.metadata?.plan
  const customerId = session.customer
  const subscriptionId = session.subscription

  if (!userId || !supabase) return

  try {
    const { error } = await supabase
      .from('users')
      .update({
        stripe_customer_id: customerId,
        stripe_subscription_id: subscriptionId,
        subscription_plan: plan,
        subscription_status: 'active',
        updated_at: new Date().toISOString(),
      })
      .eq('id', userId)

    if (error) {
      console.error('Failed to update user subscription:', error)
    }
  } catch (error) {
    console.error('Error updating subscription:', error)
  }
}

async function handleSubscriptionUpdated(subscription: any) {
  const customerId = subscription.customer
  const status = subscription.status

  if (!supabase) return

  try {
    const { error } = await supabase
      .from('users')
      .update({
        subscription_status: status,
        updated_at: new Date().toISOString(),
      })
      .eq('stripe_customer_id', customerId)

    if (error) {
      console.error('Failed to update subscription status:', error)
    }
  } catch (error) {
    console.error('Error updating subscription:', error)
  }
}

async function handleSubscriptionDeleted(subscription: any) {
  const customerId = subscription.customer

  if (!supabase) return

  try {
    const { error } = await supabase
      .from('users')
      .update({
        subscription_status: 'canceled',
        updated_at: new Date().toISOString(),
      })
      .eq('stripe_customer_id', customerId)

    if (error) {
      console.error('Failed to update subscription status:', error)
    }
  } catch (error) {
    console.error('Error updating subscription:', error)
  }
}

async function handleInvoicePaymentSucceeded(invoice: any) {
  const customerId = invoice.customer
  
  if (!supabase) return

  try {
    const { error } = await supabase
      .from('users')
      .update({
        subscription_status: 'active',
        updated_at: new Date().toISOString(),
      })
      .eq('stripe_customer_id', customerId)

    if (error) {
      console.error('Failed to update payment status:', error)
    }
  } catch (error) {
    console.error('Error updating payment status:', error)
  }
}

async function handleInvoicePaymentFailed(invoice: any) {
  const customerId = invoice.customer
  
  if (!supabase) return

  try {
    const { error } = await supabase
      .from('users')
      .update({
        subscription_status: 'past_due',
        updated_at: new Date().toISOString(),
      })
      .eq('stripe_customer_id', customerId)

    if (error) {
      console.error('Failed to update payment status:', error)
    }
  } catch (error) {
    console.error('Error updating payment status:', error)
  }
}
