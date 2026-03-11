import { z } from 'zod'
import { ValidationError } from '../http'

export const domainSchema = z.object({
  domain: z.string().trim().min(1),
  type: z.enum(['subdomain', 'custom'])
})

export function validateDomain(body: unknown) {
  const parsed = domainSchema.safeParse(body)
  if (!parsed.success) {
    throw new ValidationError('Invalid domain payload', parsed.error.format())
  }
  return parsed.data
}
