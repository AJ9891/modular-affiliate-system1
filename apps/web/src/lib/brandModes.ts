import { createClient } from '@supabase/supabase-js'
import { BRAND_MODES, BrandMode, BrandModeKey } from '@/contexts/BrandModeContext'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const supabaseClient = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export async function getFunnelBrandMode(
  funnelId: string
): Promise<BrandMode> {
  const { data, error } = await supabaseAdmin
    .from('funnels')
    .select('brand_mode')
    .eq('id', funnelId)
    .single()

  if (error || !data?.brand_mode) {
    return BRAND_MODES.rocket // safe default
  }

  return BRAND_MODES[data.brand_mode as BrandModeKey]
}

export async function updateFunnelBrandMode(
  funnelId: string,
  brandMode: BrandModeKey
) {
  const { error } = await supabaseClient
    .from('funnels')
    .update({ brand_mode: brandMode })
    .eq('id', funnelId)

  if (error) {
    throw new Error(error.message)
  }
}

export function buildHeroPrompt(
  brand: BrandMode,
  productName: string
) {
  return `
${brand.aiPrompt}

Write a hero section for a landing page.

Rules:
- No fake income claims
- No Lambos
- No guru language
- Must be memorable
- Must feel intentional, not templated

Product: ${productName}

Return JSON:
{
  "headline": "",
  "subheadline": "",
  "cta": ""
}
`
}

export function buildRocketHeroPrompt(productName: string) {
  return `
You are writing a launch-style hero section.

Tone:
- Confident
- Clear
- No hype
- No income promises
- No urgency manipulation

Avoid:
- "Make money fast"
- Gurus
- Emojis
- Exclamation overload

Product: ${productName}

Return JSON:
{
  "headline": "Short, decisive, forward-looking",
  "subheadline": "Explains what this is and why it exists",
  "cta_primary": "Action-oriented but calm",
  "cta_secondary": "Low-pressure alternative action"
}
`
}

export const ROCKET_FALLBACK_COPY = {
  headline: 'Build momentum. Then scale it.',
  subheadline:
    'Launchpad 4 Success is a system-first platform designed to move ideas forward—without hype, pressure, or noise.',
  cta_primary: 'Start building',
  cta_secondary: 'See how it works',
}

export function buildMeltdownHeroPrompt(productName: string) {
  return `
You are an overworked AI assistant experiencing a humorous meltdown.

Tone:
- Sarcastic
- Self-aware
- Reluctantly helpful
- Funny but still competent

Rules:
- Do NOT insult the user
- Do NOT imply the product is broken
- Do NOT make income promises
- Humor must build trust, not destroy it

Theme:
You are tired of gurus, hype, and fake promises.
You secretly love systems and automation.

Product: ${productName}

Return JSON:
{
  "headline": "Funny but clear",
  "subheadline": "Explains the product while joking",
  "cta": "Reluctant but helpful call to action"
}
`
}
