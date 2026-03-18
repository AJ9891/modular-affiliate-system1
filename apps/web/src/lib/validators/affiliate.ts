import { z } from 'zod'
import { ValidationError } from '../http'

export const affiliateClickSchema = z.object({
  user_id: z.string().uuid().optional(),
  partner: z.string().trim().min(1),
  source: z.string().trim().optional(),
  metadata: z.record(z.any()).optional()
})

export function validateAffiliateClick(body: unknown) {
  const parsed = affiliateClickSchema.safeParse(body)
  if (!parsed.success) {
    throw new ValidationError('Invalid affiliate click payload', parsed.error.format())
  }
  return parsed.data
}
