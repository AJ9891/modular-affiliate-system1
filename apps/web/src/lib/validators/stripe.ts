import { z } from 'zod'
import { ValidationError } from '../http'

export const createCheckoutSchema = z.object({
  target_user_id: z.string().uuid(),
  amount_usd: z.number().positive()
})

export const subscriptionCheckoutSchema = z.object({
  plan: z.enum(['starter', 'pro', 'agency']),
  userId: z.string().uuid().optional(),
  email: z.string().email()
})

export function validateCheckout(body: unknown) {
  const parsed = createCheckoutSchema.safeParse(body)
  if (!parsed.success) throw new ValidationError('Invalid checkout payload', parsed.error.format())
  return parsed.data
}

export function validateSubscription(body: unknown) {
  const parsed = subscriptionCheckoutSchema.safeParse(body)
  if (!parsed.success) throw new ValidationError('Invalid subscription payload', parsed.error.format())
  return parsed.data
}
