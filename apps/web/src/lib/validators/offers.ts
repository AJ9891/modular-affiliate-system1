import { z } from 'zod'
import { ValidationError } from '../http'

export const offerSchema = z.object({
  name: z.string().trim().min(1),
  description: z.string().trim().min(1),
  affiliate_link: z.string().url(),
  commission_rate: z.number().nonnegative(),
  niche_id: z.string().uuid().optional().nullable(),
})

export function validateOffer(body: unknown) {
  const parsed = offerSchema.safeParse(body)
  if (!parsed.success) {
    throw new ValidationError('Invalid offer payload', parsed.error.format())
  }
  return parsed.data
}
