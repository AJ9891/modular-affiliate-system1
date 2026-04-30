import type { SupabaseClient } from '@supabase/supabase-js'
import { createServiceRoleClient } from '@/lib/supabase-server'
import { ingestOfferUrl, buildFallbackIngestedUrl } from '@/lib/funnels/urlIngestion'
import { extractOfferSignals } from '@/lib/funnels/offerSignalExtractor'
import { generateFunnelFromOffer } from '@/lib/ai/tasks/generateFunnelFromOffer'
import { AI_MODELS, openai } from '@/lib/openai'

export type GenerationTone = 'professional' | 'casual' | 'urgent' | 'friendly'

export interface GenerateContentInput {
  userId: string
  sourceUrl?: string
  keyword?: string
  tone?: GenerationTone
  audienceHint?: string
  nicheHint?: string
  persist?: boolean
}

export interface GeneratedContentBundle {
  title: string
  slug: string
  article: {
    metaTitle: string
    metaDescription: string
    markdown: string
  }
  funnel: {
    headline: string
    subheadline: string
    cta: string
    blocks: Array<Record<string, unknown>>
  }
  emails: Array<{
    subject: string
    preview: string
    body: string
    cta: string
  }>
}

function slugify(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80)
}

function fallbackArticle(input: {
  title: string
  summary: string
  keyword?: string
  benefits: string[]
  audience: string
  cta: string
}): string {
  const keywordLine = input.keyword ? `Primary keyword: ${input.keyword}.` : ''
  const bulletLines = input.benefits.map((benefit) => `- ${benefit}`).join('\n')

  return `# ${input.title}\n\n${input.summary}\n\n${keywordLine}\n\n## Why this matters\n${bulletLines}\n\n## Who this is for\n${input.audience}\n\n## What to do next\n${input.cta}`
}

async function generateArticleMarkdown(params: {
  title: string
  summary: string
  keyword?: string
  audience: string
  benefits: string[]
  tone: GenerationTone
  cta: string
}) {
  const fallback = fallbackArticle(params)
  if (!openai) return fallback

  try {
    const completion = await openai.chat.completions.create({
      model: AI_MODELS.GPT35,
      messages: [
        {
          role: 'system',
          content:
            'You are an SEO content strategist. Produce clean markdown only. No code fences. No legal-risk promises.',
        },
        {
          role: 'user',
          content: `Write a ranking-focused article markdown.\nTitle: ${params.title}\nSummary: ${params.summary}\nKeyword: ${params.keyword || 'none'}\nAudience: ${params.audience}\nTone: ${params.tone}\nBenefits: ${params.benefits.join(' | ')}\nCTA: ${params.cta}\n\nRequirements:\n- 700-1200 words\n- Include H2 sections\n- Include practical bullet lists\n- Close with a CTA section`,
        },
      ],
      temperature: 0.7,
      max_tokens: 1800,
    })

    return completion.choices[0]?.message?.content?.trim() || fallback
  } catch (error) {
    console.error('generateArticleMarkdown failed:', error)
    return fallback
  }
}

async function persistFunnelFromBundle(
  supabase: SupabaseClient,
  userId: string,
  bundle: GeneratedContentBundle,
  sourceUrl: string | undefined,
  niche: string
): Promise<string | null> {
  const admin = process.env.SUPABASE_SERVICE_ROLE_KEY ? createServiceRoleClient() : supabase
  const now = new Date().toISOString()

  const baseSlug = bundle.slug || `funnel-${Date.now()}`
  let candidateSlug = baseSlug
  let counter = 1

  while (true) {
    const { data: existing, error: existsError } = await admin
      .from('funnels')
      .select('funnel_id')
      .eq('user_id', userId)
      .eq('slug', candidateSlug)
      .maybeSingle()

    if (existsError) break
    if (!existing) break
    candidateSlug = `${baseSlug}-${counter}`
    counter += 1
  }

  const blocks = {
    template: 'content_automation',
    niche,
    sourceUrl,
    generatedAt: now,
    article: bundle.article,
    emails: bundle.emails,
    blocks: bundle.funnel.blocks,
  }

  const insertPayload: Record<string, unknown> = {
    user_id: userId,
    name: bundle.title,
    slug: candidateSlug,
    blocks,
    active: true,
    status: 'draft',
    created_at: now,
    updated_at: now,
  }

  const { data, error } = await admin
    .from('funnels')
    .insert(insertPayload)
    .select('funnel_id')
    .single()

  if (error) {
    console.warn('persistFunnelFromBundle failed:', error)
    return null
  }

  return (data as { funnel_id: string }).funnel_id
}

export async function generateContentBundle(
  supabase: SupabaseClient,
  input: GenerateContentInput
): Promise<{ bundle: GeneratedContentBundle; funnelId: string | null; warnings: string[] }> {
  const warnings: string[] = []
  const tone = input.tone || 'professional'

  const sourceUrl = input.sourceUrl?.trim()
  const keyword = input.keyword?.trim()

  let signals: {
    productName: string
    niche: string
    audience: string
    offerSummary: string
    keyBenefits: string[]
  }

  if (sourceUrl) {
    try {
      const ingested = await ingestOfferUrl(sourceUrl)
      signals = extractOfferSignals(ingested, {
        audienceHint: input.audienceHint,
        nicheHint: input.nicheHint,
      })
    } catch (error) {
      warnings.push('Direct URL ingestion failed. Used metadata fallback extraction.')
      const fallback = buildFallbackIngestedUrl(sourceUrl)
      signals = extractOfferSignals(fallback, {
        audienceHint: input.audienceHint,
        nicheHint: input.nicheHint,
      })
    }
  } else {
    const seed = keyword || 'Content Strategy'
    signals = {
      productName: seed,
      niche: input.nicheHint || 'Marketing',
      audience: input.audienceHint || 'Growth-focused teams',
      offerSummary: `${seed} helps teams publish content consistently and improve search visibility.`,
      keyBenefits: [
        'Faster production cycle for SEO content',
        'Clear conversion-focused structure',
        'Consistent messaging across article and funnel assets',
      ],
    }
  }

  const generatedFunnel = await generateFunnelFromOffer({
    ...signals,
    sourceUrl: sourceUrl || 'https://local.content-automation',
    sourceHost: (() => {
      if (!sourceUrl) return 'keyword-input'
      try {
        return new URL(sourceUrl).hostname
      } catch {
        return 'keyword-input'
      }
    })(),
    sourceTitle: signals.productName,
    sourceDescription: signals.offerSummary,
    sourceHeadings: signals.keyBenefits,
    tone,
  })

  const title = keyword ? `${keyword} Guide` : `${signals.productName} Growth Guide`
  const slug = slugify(title) || `content-${Date.now()}`

  const markdown = await generateArticleMarkdown({
    title,
    summary: signals.offerSummary,
    keyword,
    audience: signals.audience,
    benefits: signals.keyBenefits,
    tone,
    cta: generatedFunnel.landing.cta,
  })

  const bundle: GeneratedContentBundle = {
    title,
    slug,
    article: {
      metaTitle: title.slice(0, 60),
      metaDescription: signals.offerSummary.slice(0, 155),
      markdown,
    },
    funnel: {
      headline: generatedFunnel.landing.headline,
      subheadline: generatedFunnel.landing.subheadline,
      cta: generatedFunnel.landing.cta,
      blocks: [
        {
          type: 'hero',
          content: {
            headline: generatedFunnel.landing.headline,
            subheadline: generatedFunnel.landing.subheadline,
            cta: generatedFunnel.landing.cta,
          },
        },
        {
          type: 'benefits',
          content: {
            title: `Why ${signals.productName}`,
            items: generatedFunnel.landing.benefits,
          },
        },
        {
          type: 'article_preview',
          content: {
            title,
            metaDescription: signals.offerSummary,
          },
        },
      ],
    },
    emails: generatedFunnel.emails,
  }

  let funnelId: string | null = null
  if (input.persist !== false) {
    funnelId = await persistFunnelFromBundle(supabase, input.userId, bundle, sourceUrl, signals.niche)
  }

  return { bundle, funnelId, warnings }
}
