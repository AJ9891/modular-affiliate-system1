import { z } from 'zod'
import { ValidationError } from '../http'

const blockSchema = z.record(z.string(), z.any())

export const funnelSchema = z.object({
  name: z.string().trim().min(1),
  template: z.unknown().optional(),
  niche: z.unknown().optional(),
  blocks: z.array(blockSchema),
  theme: z.unknown().optional(),
  slug: z.string().trim().optional()
})

export function validateFunnel(body: unknown) {
  const parsed = funnelSchema.safeParse(body)
  if (!parsed.success) {
    throw new ValidationError('Invalid funnel payload', parsed.error.format())
  }
  return parsed.data
}
