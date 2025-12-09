import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { supabase } from '@/lib/supabase'
import { sendshark } from '@/lib/sendshark'
import { headers } from 'next/headers'
import { createClient } from '@supabase/supabase-js'

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
  const customerEmail = session.customer_details?.email

  if (!userId || !supabase) return

  try {
    // Use service role client to bypass RLS
    const adminClient = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )

    const { error } = await adminClient
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
    } else {
      console.log(`Subscription activated for user ${userId}, plan: ${plan}`)
    }

    // Auto-provision Sendshark account for the user
    if (customerEmail) {
      await provisionSendsharkAccount(userId, customerEmail, plan)
    }
  } catch (error) {
    console.error('Error updating subscription:', error)
  }
}

async function provisionSendsharkAccount(userId: string, email: string, plan: string) {
  try {
    console.log(`Provisioning Sendshark account for user ${userId}, email: ${email}`)
    
    // Create a dedicated list for the user
    const listName = `Launchpad4Success - ${email}`
    
    // Add user to Sendshark as a subscriber with special tags
    const subscriber = await sendshark.addSubscriber({
      listName,
      email,
      name: email.split('@')[0],
      tags: ['launchpad4success', 'paid-subscriber', `plan-${plan}`, 'sendshark-provisioned'],
      customFields: {
        user_id: userId,
        subscription_plan: plan,
        provisioned_at: new Date().toISOString(),
        source: 'stripe-checkout'
      }
    })

    if (subscriber) {
      console.log(`✅ Sendshark account provisioned for ${email}`)
      
      // Update user record with Sendshark info
      const adminClient = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!,
        {
          auth: {
            autoRefreshToken: false,
            persistSession: false
          }
        }
      )

      await adminClient
        .from('users')
        .update({
          sendshark_provisioned: true,
          sendshark_email: email,
          updated_at: new Date().toISOString(),
        })
        .eq('id', userId)

      // Send welcome email with Sendshark access info
      await sendWelcomeEmail(email, listName)
    }
  } catch (error) {
    console.error('Error provisioning Sendshark account:', error)
    // Don't fail the webhook if Sendshark provisioning fails
  }
}

async function sendWelcomeEmail(email: string, listName: string) {
  try {
    // Send welcome email via Sendshark API
    await sendshark.sendEmail({
      to: { email },
      from: {
        email: 'support@launchpad4success.com',
        name: 'Launchpad4Success Team'
      },
      subject: '🎉 Welcome to Launchpad4Success + Sendshark!',
      html: `
        <h1>Welcome to Launchpad4Success!</h1>
        <p>Great news! Your Sendshark email automation is now active and included with your subscription.</p>
        <h2>Your Sendshark Account Details:</h2>
        <ul>
          <li><strong>Email List:</strong> ${listName}</li>
          <li><strong>Status:</strong> Active & Ready</li>
          <li><strong>Integration:</strong> Automatic lead capture enabled</li>
        </ul>
        <p>All leads from your funnels will automatically be added to Sendshark for email follow-up.</p>
        <p>To access your Sendshark dashboard and set up email sequences:</p>
        <a href="https://sendshark.com/launch/ecfunnel?id=Abby9891" style="display: inline-block; padding: 12px 24px; background: #ff6b35; color: white; text-decoration: none; border-radius: 6px; font-weight: bold;">
          Access Your Sendshark Account →
        </a>
        <p>Questions? We're here to help!</p>
        <p>Best,<br>The Launchpad4Success Team</p>
      `
    })
    console.log(`Welcome email sent to ${email}`)
  } catch (error) {
    console.error('Error sending welcome email:', error)
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
  const customerEmail = invoice.customer_email
  
  if (!supabase) return

  try {
    // Use service role client to bypass RLS
    const adminClient = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )

    // Get user info
    const { data: userData } = await adminClient
      .from('users')
      .select('id, email, subscription_plan, sendshark_provisioned')
      .eq('stripe_customer_id', customerId)
      .single()

    const { error } = await adminClient
      .from('users')
      .update({
        subscription_status: 'active',
        updated_at: new Date().toISOString(),
      })
      .eq('stripe_customer_id', customerId)

    if (error) {
      console.error('Failed to update payment status:', error)
    } else {
      console.log(`Payment succeeded for customer ${customerId}`)
      
      // If Sendshark hasn't been provisioned yet, do it now
      if (userData && !userData.sendshark_provisioned && userData.email) {
        await provisionSendsharkAccount(userData.id, userData.email, userData.subscription_plan)
      }
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
