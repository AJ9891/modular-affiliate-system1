import { buildPromptEnvelope } from '../promptEnvelope'
import { ANTIGURU_SCHEMA } from '../schemas'
import { BrandMode } from '@/contexts/BrandModeContext'

export function buildAntiGuruTask({
  brand,
  productName,
}: {
  brand: BrandMode
  productName: string
}) {
  return buildPromptEnvelope({
    brand,
    task: `
Write an Anti-Guru comparison section.

Product name: ${productName}

List common marketing promises that the product explicitly does NOT make,
followed by what it does instead.

Requirements:
- Honest, slightly sarcastic, but calm
- No named competitors
- No insults
- Humor must feel grounded
`,
    outputSchema: ANTIGURU_SCHEMA,
  })
}
