import { z } from 'zod'
import { ValidationError } from '../http'

export const offerSchema = z.object({
  name: z.string().trim().min(1),
  description: z.string().trim().optional().default(''),
  affiliate_link: z.string().url(),
  commission_rate: z.number().nonnegative().optional(),
  commission_type: z.enum(['percent', 'flat']).optional().default('percent'),
  commission_value: z.number().nonnegative().optional(),
  commission_currency: z.string().trim().length(3).optional().default('USD'),
  niche_label: z.string().trim().max(120).optional(),
  niche_id: z.string().uuid().optional().nullable(),
})

export function validateOffer(body: unknown) {
  const parsed = offerSchema.safeParse(body)
  if (!parsed.success) {
    throw new ValidationError('Invalid offer payload', parsed.error.format())
  }
  const data = parsed.data
  const normalizedType = data.commission_type || 'percent'
  const normalizedValue =
    typeof data.commission_value === 'number'
      ? data.commission_value
      : (typeof data.commission_rate === 'number' ? data.commission_rate : 0)
  const normalizedRate =
    normalizedType === 'percent'
      ? normalizedValue
      : (typeof data.commission_rate === 'number' ? data.commission_rate : 0)

  return {
    ...data,
    description: data.description || '',
    commission_type: normalizedType,
    commission_value: normalizedValue,
    commission_rate: normalizedRate,
    commission_currency: (data.commission_currency || 'USD').toUpperCase(),
  }
}
