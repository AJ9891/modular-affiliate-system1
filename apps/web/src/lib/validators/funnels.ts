import { z } from 'zod'
import { ValidationError } from '../http'

const blockSchema = z.record(z.string(), z.any())

export const funnelSchema = z.object({
  name: z.string().trim().min(1),
  template: z.unknown().optional(),
  niche: z.unknown().optional(),
  blocks: z.array(blockSchema).optional().default([]),
  theme: z.unknown().optional(),
  slug: z.string().trim().optional()
})

const toneSchema = z.enum(['professional', 'casual', 'urgent', 'friendly'])

const normalizedUrlSchema = z
  .string()
  .trim()
  .min(1)
  .transform((value) => {
    if (/^[a-z][a-z0-9+.-]*:\/\//i.test(value)) return value
    return `https://${value}`
  })
  .pipe(z.string().url())

function optionalHintSchema(maxLength: number) {
  return z
    .string()
    .trim()
    .max(maxLength)
    .optional()
    .transform((value) => {
      if (!value) return undefined
      return value.length >= 2 ? value : undefined
    })
}

export const generateFromUrlSchema = z.object({
  url: normalizedUrlSchema,
  nicheHint: optionalHintSchema(120),
  audienceHint: optionalHintSchema(160),
  tone: toneSchema.optional(),
  persist: z.boolean().optional(),
})

export function validateFunnel(body: unknown) {
  const parsed = funnelSchema.safeParse(body)
  if (!parsed.success) {
    throw new ValidationError('Invalid funnel payload', parsed.error.format())
  }
  return parsed.data
}

export function validateGenerateFromUrl(body: unknown) {
  const parsed = generateFromUrlSchema.safeParse(body)
  if (!parsed.success) {
    throw new ValidationError('Invalid generate-from-url payload', parsed.error.format())
  }
  return parsed.data
}
