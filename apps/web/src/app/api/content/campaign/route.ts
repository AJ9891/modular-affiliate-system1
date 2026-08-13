import { NextResponse } from 'next/server'
import { withRouteHandler } from '@/features/shared/api/route-handler'
import { readJson } from '@/lib/http'
import { generateContentBundle, type GenerationTone } from '@/features/content/server/content-generation.service'
import { ingestOfferUrl, type IngestedUrlData } from '@/lib/funnels/urlIngestion'

type CampaignGoal = 'sales' | 'leads' | 'traffic' | 'promotion'
type IngestionStatus = 'success' | 'login_required' | 'blocked' | 'timeout' | 'unreadable' | 'not_provided'

const GOAL_AUDIENCES: Record<CampaignGoal, string> = {
  sales: 'People comparing options and ready to make a purchase',
  leads: 'Interested visitors willing to exchange their email for useful information',
  traffic: 'Searchers looking for practical answers and relevant resources',
  promotion: 'Potential customers who need to understand the product and its benefits',
}

function normalizeOptionalUrl(value: unknown): string | undefined {
  if (typeof value !== 'string' || !value.trim()) return undefined
  const trimmed = value.trim()
  return /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`
}

function classifyIngestionError(error: unknown): { status: Exclude<IngestionStatus, 'success' | 'not_provided'>; message: string } {
  const message = error instanceof Error ? error.message : 'The page could not be read.'
  const lower = message.toLowerCase()

  if (lower.includes('login') || lower.includes('sign in')) {
    return { status: 'login_required', message: 'This page requires a login. Add a product description so Launchpad has reliable source material.' }
  }
  if (lower.includes('private') || lower.includes('local') || lower.includes('not allowed') || lower.includes('403') || lower.includes('401')) {
    return { status: 'blocked', message: 'This page blocks automated reading. Add a product description to continue.' }
  }
  if (lower.includes('timed out') || lower.includes('timeout')) {
    return { status: 'timeout', message: 'This page took too long to respond. Try again or add a product description.' }
  }
  return { status: 'unreadable', message: 'Launchpad could not find enough readable product information on this page. Add a product description to continue.' }
}

export const GET = withRouteHandler(async ({ supabase, user }) => {
  const { data, error } = await supabase
    .from('campaigns')
    .select('campaign_id, funnel_id, status, title, goal, tone, source_url, keyword, ingestion, created_at, updated_at')
    .eq('user_id', user!.id)
    .order('updated_at', { ascending: false })
    .limit(50)

  if (error) throw error

  return NextResponse.json({ success: true, campaigns: data || [] })
})

export const POST = withRouteHandler(async ({ request, supabase, user }) => {
  const body = await readJson<Record<string, unknown>>(request)
  const sourceUrl = normalizeOptionalUrl(body.sourceUrl)
  const productDescription = typeof body.productDescription === 'string' ? body.productDescription.trim() : ''
  const keyword = typeof body.keyword === 'string' ? body.keyword.trim() : ''
  const goal = (typeof body.goal === 'string' ? body.goal : 'sales') as CampaignGoal
  const tone = (typeof body.tone === 'string' ? body.tone : 'professional') as GenerationTone

  if (!sourceUrl && !productDescription) {
    return NextResponse.json({ success: false, error: 'Add a public product link or a product description.' }, { status: 400 })
  }
  if (!keyword) {
    return NextResponse.json({ success: false, error: 'Choose a keyword before building the campaign.' }, { status: 400 })
  }

  let ingestedUrl: IngestedUrlData | undefined
  let ingestion: { status: IngestionStatus; sourceUrl?: string; message: string } = {
    status: 'not_provided',
    message: 'Campaign built from your product description.',
  }
  const warnings: string[] = []

  if (sourceUrl) {
    try {
      ingestedUrl = await ingestOfferUrl(sourceUrl)
      ingestion = {
        status: 'success',
        sourceUrl: ingestedUrl.normalizedUrl,
        message: 'Product page read successfully.',
      }
    } catch (error) {
      const result = classifyIngestionError(error)
      ingestion = { ...result, sourceUrl }

      if (!productDescription) {
        return NextResponse.json(
          {
            success: false,
            error: result.message,
            ingestion,
            requiresDescription: true,
          },
          { status: 422 }
        )
      }

      warnings.push(`${result.message} Campaign built from your written product description instead.`)
    }
  }

  const audienceHint = GOAL_AUDIENCES[goal] || GOAL_AUDIENCES.sales
  const { bundle, funnelId, warnings: generationWarnings } = await generateContentBundle(supabase, {
    userId: user!.id,
    sourceUrl: ingestedUrl ? sourceUrl : undefined,
    ingestedUrl,
    keyword,
    tone,
    audienceHint,
    nicheHint: productDescription || undefined,
    persist: true,
  })

  const combinedWarnings = [...warnings, ...generationWarnings]
  const { data: campaign, error: campaignError } = await supabase
    .from('campaigns')
    .insert({
      user_id: user!.id,
      funnel_id: funnelId,
      status: 'draft',
      title: bundle.title,
      goal,
      tone,
      source_url: sourceUrl || null,
      product_description: productDescription || null,
      keyword,
      ingestion,
      content: bundle,
      warnings: combinedWarnings,
    })
    .select('campaign_id, status, created_at, updated_at')
    .single()

  if (campaignError) throw campaignError

  return NextResponse.json({
    success: true,
    ingestion,
    content: bundle,
    saved: {
      campaignId: campaign.campaign_id,
      campaignStatus: campaign.status,
      funnelId,
      savedAt: campaign.updated_at,
    },
    warnings: combinedWarnings,
    phases: ['source_checked', 'funnel_created', 'article_written', 'emails_prepared', 'draft_saved'],
  })
})
