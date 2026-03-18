import { NextRequest, NextResponse } from 'next/server'
import { stripe, dollarsToCredits } from '@/lib/stripe'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { log } from '@/lib/log'
import { validateCheckout } from '@/lib/validators/stripe'
import { error, ok } from '@/lib/http'

// Force dynamic rendering for this API route
export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  const supabase = createRouteHandlerClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Check admin flag
  const { data: profile } = await supabase
    .from('users')
    .select('is_admin')
    .eq('id', user.id)
    .single()
  
  if (!profile?.is_admin) {
    return NextResponse.json({ error: 'Admin only' }, { status: 403 })
  }

  const { target_user_id, amount_usd } = validateCheckout(await req.json())
  
  if (!target_user_id || !amount_usd) {
    return NextResponse.json(
      { error: 'Missing target_user_id or amount_usd' },
      { status: 400 }
    )
  }

  if (!stripe) {
    log.error('Stripe not configured')
    return NextResponse.json(
      { error: 'Stripe not configured' },
      { status: 500 }
    )
  }

  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: `Top-up credits for user ${target_user_id}`,
            },
            unit_amount: Math.round(Number(amount_usd) * 100), // cents
          },
          quantity: 1,
        },
      ],
      success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/admin/topup?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/admin/topup`,
      metadata: {
        admin_id: user.id,
        target_user_id,
        amount_usd: String(amount_usd)
      }
    })

    // Insert a pending topup row
    await supabase.from('topups').insert({
      admin_id: user.id,
      user_id: target_user_id,
      amount: amount_usd,
      credits_added: dollarsToCredits(Number(amount_usd)),
      stripe_checkout_session: session.id,
      status: 'pending'
    })

    return ok({ url: session.url, id: session.id })
  } catch (err: any) {
    log.error('Stripe checkout error', { error: err?.message })
    return error(err)
  }
}
