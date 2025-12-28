import { buildPromptEnvelope } from '../promptEnvelope'
import { HERO_SCHEMA } from '../schemas'
import { BrandMode } from '@/contexts/BrandModeContext'

export function buildHeroTask({
  brand,
  productName,
}: {
  brand: BrandMode
  productName: string
}) {
  return buildPromptEnvelope({
    brand,
    task: `
Write a hero section for a landing page.

Product name: ${productName}

Requirements:
- Clear value
- Honest framing
- Memorable but grounded
`,
    outputSchema: HERO_SCHEMA,
  })
}
