import type { SupabaseClient, User } from '@supabase/supabase-js'
import { hasAdminAccess } from '@/lib/admin-access'
import { stripe, dollarsToCredits } from '@/lib/stripe'
import { createServiceRoleClient } from '@/lib/supabase-server'
import { validateCheckout } from '@/lib/validators/stripe'

export async function createAdminTopupCheckout(
  supabase: SupabaseClient,
  user: User,
  body: unknown
) {
  const { data: profile } = await supabase
    .from('users')
    .select('is_admin, role')
    .eq('id', user.id)
    .single()

  if (!hasAdminAccess(profile)) {
    const err = new Error('Admin only')
    ;(err as Error & { status?: number }).status = 403
    throw err
  }

  const { target_user_id, amount_usd } = validateCheckout(body)

  if (!stripe) {
    const err = new Error('Stripe not configured')
    ;(err as Error & { status?: number }).status = 500
    throw err
  }

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
          unit_amount: Math.round(Number(amount_usd) * 100),
        },
        quantity: 1,
      },
    ],
    success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/admin/topup?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/admin/topup`,
    metadata: {
      admin_id: user.id,
      target_user_id,
      amount_usd: String(amount_usd),
    },
  })

  const adminClient = createServiceRoleClient()
  await adminClient.from('topups').insert({
    admin_id: user.id,
    user_id: target_user_id,
    amount: amount_usd,
    credits_added: dollarsToCredits(Number(amount_usd)),
    stripe_checkout_session: session.id,
    status: 'pending',
  })

  return {
    url: session.url,
    id: session.id,
  }
}
