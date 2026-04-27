import { NextRequest, NextResponse } from 'next/server'
import { checkSupabase } from '@/lib/check-supabase'
import { createServerRouteClient, createServiceRoleClient } from '@/lib/supabase-server'
import { requireUser } from '@/lib/authz'
import { readJson, error } from '@/lib/http'
import { validateGenerateFromUrl } from '@/lib/validators/funnels'
import { ingestOfferUrl, buildFallbackIngestedUrl } from '@/lib/funnels/urlIngestion'
import type { IngestedUrlData } from '@/lib/funnels/urlIngestion'
import { extractOfferSignals } from '@/lib/funnels/offerSignalExtractor'
import { generateFunnelFromOffer } from '@/lib/ai/tasks/generateFunnelFromOffer'

interface FunnelRecord {
  funnel_id: string
  name: string
  slug: string
  status: string
  created_at: string
  updated_at: string
}

interface GenerationRecord {
  id: string
}

function slugify(value: string): string {
  const slug = value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')

  return slug.length > 0 ? slug : `funnel-${Date.now()}`
}

function buildFunnelBlocks(params: {
  sourceUrl: string
  niche: string
  productName: string
  landing: {
    headline: string
    subheadline: string
    cta: string
    benefits: Array<{ title: string; description: string }>
  }
  emails: Array<{ subject: string; preview: string; body: string; cta: string }>
}) {
  const { sourceUrl, niche, productName, landing, emails } = params

  return {
    template: 'link_ingestion',
    niche,
    sourceUrl,
    generatedAt: new Date().toISOString(),
    emails,
    blocks: [
      {
        type: 'hero',
        content: {
          headline: landing.headline,
          subheadline: landing.subheadline,
          cta: landing.cta,
        },
      },
      {
        type: 'benefits',
        content: {
          title: `Why ${productName}`,
          items: landing.benefits,
        },
      },
      {
        type: 'cta',
        content: {
          headline: 'Ready to move forward?',
          button_text: landing.cta,
        },
      },
    ],
  }
}

async function ensureUserRow(userId: string, email?: string | null) {
  const admin = createServiceRoleClient()
  const { data: existing } = await admin.from('users').select('id').eq('id', userId).maybeSingle()

  if (!existing) {
    const now = new Date().toISOString()
    await admin.from('users').insert({
      id: userId,
      email: email || `${userId}@placeholder.local`,
      created_at: now,
      updated_at: now,
    })
  }
}

async function createGenerationRecord(params: {
  userId: string
  sourceUrl: string
}): Promise<string | null> {
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) return null

  try {
    const admin = createServiceRoleClient()
    const { data, error: insertError } = await admin
      .from('funnel_generations')
      .insert({
        user_id: params.userId,
        source_url: params.sourceUrl,
        status: 'running',
        started_at: new Date().toISOString(),
      })
      .select('id')
      .single()

    if (insertError) {
      console.warn('Unable to create funnel_generations record:', insertError.message)
      return null
    }

    return (data as GenerationRecord).id
  } catch (error) {
    console.warn('Failed to initialize generation record:', error)
    return null
  }
}

async function completeGenerationRecord(params: {
  generationId: string
  funnelId?: string | null
  assets: {
    landing: {
      headline: string
      subheadline: string
      cta: string
      benefits: Array<{ title: string; description: string }>
    }
    emails: Array<{ subject: string; preview: string; body: string; cta: string }>
    signals: {
      productName: string
      niche: string
      audience: string
      offerSummary: string
      keyBenefits: string[]
    }
  }
}) {
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) return

  try {
    const admin = createServiceRoleClient()
    const now = new Date().toISOString()

    const assetsToInsert = [
      {
        generation_id: params.generationId,
        asset_type: 'landing',
        content_json: params.assets.landing,
        content_text: [
          params.assets.landing.headline,
          params.assets.landing.subheadline,
          `CTA: ${params.assets.landing.cta}`,
        ].join('\n'),
      },
      {
        generation_id: params.generationId,
        asset_type: 'email_sequence',
        content_json: params.assets.emails,
        content_text: params.assets.emails
          .map((email, index) => `Email ${index + 1}: ${email.subject}\n${email.preview}\n${email.body}\nCTA: ${email.cta}`)
          .join('\n\n---\n\n'),
      },
      {
        generation_id: params.generationId,
        asset_type: 'offer_signals',
        content_json: params.assets.signals,
        content_text: params.assets.signals.offerSummary,
      },
    ]

    const { error: assetsError } = await admin.from('generated_assets').insert(assetsToInsert)
    if (assetsError) {
      console.warn('Unable to persist generated assets:', assetsError.message)
    }

    const updatePayload: Record<string, unknown> = {
      status: 'completed',
      completed_at: now,
      error_message: null,
    }

    if (params.funnelId) {
      updatePayload.funnel_id = params.funnelId
    }

    const { error: updateError } = await admin
      .from('funnel_generations')
      .update(updatePayload)
      .eq('id', params.generationId)

    if (updateError) {
      console.warn('Unable to finalize generation record:', updateError.message)
    }
  } catch (error) {
    console.warn('Failed to finalize generation record:', error)
  }
}

async function failGenerationRecord(generationId: string, failureReason: string) {
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) return

  try {
    const admin = createServiceRoleClient()
    await admin
      .from('funnel_generations')
      .update({
        status: 'failed',
        completed_at: new Date().toISOString(),
        error_message: failureReason.slice(0, 4000),
      })
      .eq('id', generationId)
  } catch (error) {
    console.warn('Unable to mark generation as failed:', error)
  }
}

async function resolveUniqueSlug(userId: string, baseSlug: string): Promise<string> {
  const admin = createServiceRoleClient()
  let candidate = baseSlug
  let counter = 1

  while (true) {
    const { data } = await admin
      .from('funnels')
      .select('funnel_id')
      .eq('user_id', userId)
      .eq('slug', candidate)
      .maybeSingle()

    if (!data) {
      return candidate
    }

    candidate = `${baseSlug}-${counter}`
    counter += 1
  }
}

function isRecoverableIngestionError(message: string): boolean {
  const normalized = message.toLowerCase()

  if (normalized.includes('private or local urls are not allowed')) return false
  if (normalized.includes('url is required')) return false
  if (normalized.includes('url must be valid')) return false
  if (normalized.includes('only http:// and https:// urls are supported')) return false

  return true
}

export async function POST(request: NextRequest) {
  const check = checkSupabase()
  if (check) return check

  let generationId: string | null = null

  try {
    const supabase = await createServerRouteClient()
    const user = await requireUser(supabase)

    const body = await readJson<Record<string, unknown>>(request)
    const payload = validateGenerateFromUrl(body)

    if (process.env.SUPABASE_SERVICE_ROLE_KEY) {
      await ensureUserRow(user.id, user.email)
    }

    const warnings: string[] = []
    let ingestion: IngestedUrlData

    try {
      ingestion = await ingestOfferUrl(payload.url)
    } catch (ingestionError) {
      const message = ingestionError instanceof Error ? ingestionError.message : 'Unable to ingest URL'
      if (!isRecoverableIngestionError(message)) {
        throw ingestionError
      }

      warnings.push('Direct page fetch failed, so assets were generated from URL patterns and your hints.')
      ingestion = buildFallbackIngestedUrl(payload.url)
    }

    generationId = await createGenerationRecord({
      userId: user.id,
      sourceUrl: ingestion.normalizedUrl,
    })

    const signals = extractOfferSignals(ingestion, {
      nicheHint: payload.nicheHint,
      audienceHint: payload.audienceHint,
    })

    const assets = await generateFunnelFromOffer({
      ...signals,
      tone: payload.tone,
    })

    let shouldPersist = payload.persist !== false
    if (shouldPersist && !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      shouldPersist = false
    }
    let funnel: FunnelRecord | null = null

    if (shouldPersist) {
      const funnelName = `${signals.productName} Funnel`
      const uniqueSlug = await resolveUniqueSlug(user.id, slugify(signals.productName))
      const blocks = buildFunnelBlocks({
        sourceUrl: signals.sourceUrl,
        niche: signals.niche,
        productName: signals.productName,
        landing: assets.landing,
        emails: assets.emails,
      })

      const now = new Date().toISOString()
      const admin = createServiceRoleClient()
      const insertPayload = {
        user_id: user.id,
        name: funnelName,
        slug: uniqueSlug,
        blocks,
        active: true,
        status: 'draft',
        niche_id: null,
        team_id: null,
        brand_mode: null,
        created_at: now,
        updated_at: now,
      }

      const { data, error: insertError } = await admin
        .from('funnels')
        .insert(insertPayload)
        .select('funnel_id,name,slug,status,created_at,updated_at')
        .single()

      if (insertError) {
        throw new Error(`Failed to persist funnel: ${insertError.message}`)
      }

      funnel = data as FunnelRecord
    }

    if (generationId) {
      await completeGenerationRecord({
        generationId,
        funnelId: funnel?.funnel_id,
        assets: {
          landing: assets.landing,
          emails: assets.emails,
          signals: {
            productName: signals.productName,
            niche: signals.niche,
            audience: signals.audience,
            offerSummary: signals.offerSummary,
            keyBenefits: signals.keyBenefits,
          },
        },
      })
    }

    return NextResponse.json(
      {
        generation: {
          id: generationId,
          warnings,
          stages: ['fetch', 'analyze', 'landing', 'emails', shouldPersist ? 'save' : 'complete'],
          source: {
            url: signals.sourceUrl,
            host: signals.sourceHost,
            title: signals.sourceTitle,
            description: signals.sourceDescription,
            headings: signals.sourceHeadings,
          },
          signals: {
            productName: signals.productName,
            niche: signals.niche,
            audience: signals.audience,
            offerSummary: signals.offerSummary,
            keyBenefits: signals.keyBenefits,
          },
          assets,
        },
        funnel,
      },
      { status: 200 }
    )
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Generation failed'
    if (generationId) {
      await failGenerationRecord(generationId, message)
    }
    return error(err)
  }
}
