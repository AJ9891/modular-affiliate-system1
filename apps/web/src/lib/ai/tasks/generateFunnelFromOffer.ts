import { AI_MODELS, openai } from '@/lib/openai'
import type { OfferSignals } from '@/lib/funnels/offerSignalExtractor'

type Tone = 'professional' | 'casual' | 'urgent' | 'friendly'

interface BenefitSection {
  title: string
  description: string
}

export interface GeneratedLandingAsset {
  headline: string
  subheadline: string
  cta: string
  benefits: BenefitSection[]
}

export interface GeneratedEmailAsset {
  subject: string
  preview: string
  body: string
  cta: string
}

export interface GeneratedFunnelAssets {
  landing: GeneratedLandingAsset
  emails: GeneratedEmailAsset[]
}

interface GenerateFromOfferInput extends OfferSignals {
  tone?: Tone
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function toString(value: unknown, fallback = ''): string {
  if (typeof value !== 'string') return fallback
  const trimmed = value.trim()
  return trimmed.length > 0 ? trimmed : fallback
}

function normalizeBenefits(value: unknown, fallback: BenefitSection[]): BenefitSection[] {
  if (!Array.isArray(value)) return fallback

  const benefits: BenefitSection[] = []
  for (const entry of value) {
    if (typeof entry === 'string') {
      const text = entry.trim()
      if (text.length > 0) {
        benefits.push({ title: text.slice(0, 64), description: text })
      }
      continue
    }

    if (isRecord(entry)) {
      const title = toString(entry.title, 'Key Benefit')
      const description = toString(entry.description, title)
      benefits.push({ title, description })
    }
  }

  return benefits.length > 0 ? benefits.slice(0, 4) : fallback
}

function normalizeEmails(value: unknown, fallback: GeneratedEmailAsset[]): GeneratedEmailAsset[] {
  if (!Array.isArray(value)) return fallback

  const emails: GeneratedEmailAsset[] = []
  for (const entry of value) {
    if (!isRecord(entry)) continue

    emails.push({
      subject: toString(entry.subject, 'Quick question about your goals'),
      preview: toString(entry.preview, 'A faster path to better outcomes.'),
      body: toString(entry.body, 'Review the offer details and apply what fits your workflow.'),
      cta: toString(entry.cta, 'See the details'),
    })
  }

  return emails.length > 0 ? emails.slice(0, 3) : fallback
}

function buildFallbackAssets(input: GenerateFromOfferInput): GeneratedFunnelAssets {
  const landingBenefits: BenefitSection[] = input.keyBenefits.slice(0, 3).map((benefit) => ({
    title: benefit.slice(0, 60),
    description: benefit,
  }))

  const benefits = landingBenefits.length > 0
    ? landingBenefits
    : [{ title: 'Clear value', description: input.offerSummary }]

  return {
    landing: {
      headline: `Use ${input.productName} to get results faster`,
      subheadline: input.offerSummary,
      cta: 'Get Started',
      benefits,
    },
    emails: [
      {
        subject: `${input.productName}: what you need to know first`,
        preview: 'Start with the shortest path to an early result.',
        body: `Here is the core idea behind ${input.productName}: ${input.offerSummary}\n\nBest fit: ${input.audience}.`,
        cta: 'See how it works',
      },
      {
        subject: `Three reasons ${input.productName} stands out`,
        preview: 'Quick breakdown of what matters before you commit.',
        body: input.keyBenefits.slice(0, 3).map((item, index) => `${index + 1}. ${item}`).join('\n'),
        cta: 'Review the offer',
      },
      {
        subject: `Final check: is ${input.productName} right for you?`,
        preview: 'A clear yes/no framework before you decide.',
        body: `If your goal is ${input.audience.toLowerCase()}, this offer can support that with practical next steps.`,
        cta: 'Get access now',
      },
    ],
  }
}

function buildPrompt(input: GenerateFromOfferInput): string {
  return `Generate a conversion-focused affiliate funnel payload.

Offer signals:
- Product: ${input.productName}
- Niche: ${input.niche}
- Audience: ${input.audience}
- Source summary: ${input.offerSummary}
- Key benefits: ${input.keyBenefits.join(' | ')}
- Desired tone: ${input.tone || 'professional'}

Return strict JSON with this shape:
{
  "landing": {
    "headline": "string",
    "subheadline": "string",
    "cta": "string",
    "benefits": [
      { "title": "string", "description": "string" }
    ]
  },
  "emails": [
    {
      "subject": "string",
      "preview": "string",
      "body": "string",
      "cta": "string"
    }
  ]
}

Rules:
- 3 benefits max.
- 3 emails exactly.
- Keep claims compliant (no guarantees).
- Keep CTA concise (2-6 words).`
}

export async function generateFunnelFromOffer(input: GenerateFromOfferInput): Promise<GeneratedFunnelAssets> {
  const fallbackAssets = buildFallbackAssets(input)

  if (!openai) {
    return fallbackAssets
  }

  try {
    const completion = await openai.chat.completions.create({
      model: AI_MODELS.GPT35,
      messages: [
        {
          role: 'system',
          content: 'You are an expert direct-response copy strategist for compliant affiliate funnels.',
        },
        {
          role: 'user',
          content: buildPrompt(input),
        },
      ],
      temperature: 0.7,
      max_tokens: 1200,
      response_format: { type: 'json_object' },
    })

    const raw = completion.choices[0]?.message?.content
    if (!raw) {
      return fallbackAssets
    }

    const parsed: unknown = JSON.parse(raw)
    if (!isRecord(parsed)) {
      return fallbackAssets
    }

    const landingRaw = isRecord(parsed.landing) ? parsed.landing : {}
    const emailsRaw = parsed.emails

    const landing: GeneratedLandingAsset = {
      headline: toString(landingRaw.headline, fallbackAssets.landing.headline),
      subheadline: toString(landingRaw.subheadline, fallbackAssets.landing.subheadline),
      cta: toString(landingRaw.cta, fallbackAssets.landing.cta),
      benefits: normalizeBenefits(landingRaw.benefits, fallbackAssets.landing.benefits),
    }

    const emails = normalizeEmails(emailsRaw, fallbackAssets.emails)

    return { landing, emails }
  } catch (error) {
    console.error('generateFunnelFromOffer failed:', error)
    return fallbackAssets
  }
}
