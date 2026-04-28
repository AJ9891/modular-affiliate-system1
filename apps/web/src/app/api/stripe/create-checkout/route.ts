import { withRouteHandler } from '@/features/shared/api/route-handler'
import { readJson, ok, error } from '@/lib/http'
import { log } from '@/lib/log'
import { createAdminTopupCheckout } from '@/features/stripe/server/admin-topup-checkout.service'

// Force dynamic rendering for this API route
export const dynamic = 'force-dynamic'

export const POST = withRouteHandler(async ({ request, supabase, user }) => {
  try {
    const body = await readJson<Record<string, unknown>>(request)
    const session = await createAdminTopupCheckout(supabase, user!, body)
    return ok(session)
  } catch (err: any) {
    log.error('Stripe checkout error', { error: err?.message })
    return error(err)
  }
})
