import { NextResponse } from 'next/server'
import { withRouteHandler } from '@/features/shared/api/route-handler'
import { readJson } from '@/lib/http'
import {
  generateContentBundle,
  type GeneratedContentBundle,
  type GenerationTone,
} from '@/features/content/server/content-generation.service'

type CampaignSection = 'funnel' | 'article' | 'emails'
type CampaignGoal = 'sales' | 'leads' | 'traffic' | 'promotion'

const GOAL_AUDIENCES: Record<CampaignGoal, string> = {
  sales: 'People comparing options and ready to make a purchase',
  leads: 'Interested visitors willing to exchange their email for useful information',
  traffic: 'Searchers looking for practical answers and relevant resources',
  promotion: 'Potential customers who need to understand the product and its benefits',
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function isGeneratedContent(value: unknown): value is GeneratedContentBundle {
  if (!isRecord(value) || !isRecord(value.article) || !isRecord(value.funnel) || !Array.isArray(value.emails)) return false
  return (
    typeof value.title === 'string' &&
    typeof value.slug === 'string' &&
    typeof value.article.metaTitle === 'string' &&
    typeof value.article.metaDescription === 'string' &&
    typeof value.article.markdown === 'string' &&
    typeof value.funnel.headline === 'string' &&
    typeof value.funnel.subheadline === 'string' &&
    typeof value.funnel.cta === 'string' &&
    Array.isArray(value.funnel.blocks) &&
    value.emails.every((email) =>
      isRecord(email) &&
      typeof email.subject === 'string' &&
      typeof email.preview === 'string' &&
      typeof email.body === 'string' &&
      typeof email.cta === 'string'
    )
  )
}

async function syncLinkedFunnel(
  supabase: Parameters<Parameters<typeof withRouteHandler>[0]>[0]['supabase'],
  userId: string,
  funnelId: string | null,
  content: GeneratedContentBundle
) {
  if (!funnelId) return

  const { data: funnel, error: readError } = await supabase
    .from('funnels')
    .select('blocks')
    .eq('funnel_id', funnelId)
    .eq('user_id', userId)
    .maybeSingle()

  if (readError) throw readError
  if (!funnel) return

  const currentBlocks = isRecord(funnel.blocks) ? funnel.blocks : {}
  const { error: updateError } = await supabase
    .from('funnels')
    .update({
      name: content.title,
      blocks: {
        ...currentBlocks,
        article: content.article,
        emails: content.emails,
        blocks: content.funnel.blocks,
      },
      updated_at: new Date().toISOString(),
    })
    .eq('funnel_id', funnelId)
    .eq('user_id', userId)

  if (updateError) throw updateError
}

export const GET = withRouteHandler(async ({ supabase, user, params }) => {
  const { campaignId } = await Promise.resolve(params as { campaignId: string })
  const { data, error } = await supabase
    .from('campaigns')
    .select('*')
    .eq('campaign_id', campaignId)
    .eq('user_id', user!.id)
    .maybeSingle()

  if (error) throw error
  if (!data) return NextResponse.json({ success: false, error: 'Campaign not found.' }, { status: 404 })

  return NextResponse.json({ success: true, campaign: data })
})

export const PATCH = withRouteHandler(async ({ request, supabase, user, params }) => {
  const { campaignId } = await Promise.resolve(params as { campaignId: string })
  const body = await readJson<Record<string, unknown>>(request)

  if (!isGeneratedContent(body.content)) {
    return NextResponse.json({ success: false, error: 'Campaign content is incomplete or invalid.' }, { status: 400 })
  }

  const { data: campaign, error: campaignError } = await supabase
    .from('campaigns')
    .select('funnel_id')
    .eq('campaign_id', campaignId)
    .eq('user_id', user!.id)
    .maybeSingle()

  if (campaignError) throw campaignError
  if (!campaign) return NextResponse.json({ success: false, error: 'Campaign not found.' }, { status: 404 })

  const updatedAt = new Date().toISOString()
  const { data, error } = await supabase
    .from('campaigns')
    .update({
      title: body.content.title,
      content: body.content,
      updated_at: updatedAt,
    })
    .eq('campaign_id', campaignId)
    .eq('user_id', user!.id)
    .select('campaign_id, status, updated_at')
    .single()

  if (error) throw error
  await syncLinkedFunnel(supabase, user!.id, campaign.funnel_id, body.content)

  return NextResponse.json({ success: true, campaign: data, content: body.content })
})

export const POST = withRouteHandler(async ({ request, supabase, user, params }) => {
  const { campaignId } = await Promise.resolve(params as { campaignId: string })
  const body = await readJson<Record<string, unknown>>(request)
  const section = body.section as CampaignSection

  if (!['funnel', 'article', 'emails'].includes(section)) {
    return NextResponse.json({ success: false, error: 'Choose funnel, article, or emails to regenerate.' }, { status: 400 })
  }

  const { data: campaign, error: campaignError } = await supabase
    .from('campaigns')
    .select('funnel_id, goal, tone, source_url, product_description, keyword, ingestion, content')
    .eq('campaign_id', campaignId)
    .eq('user_id', user!.id)
    .maybeSingle()

  if (campaignError) throw campaignError
  if (!campaign || !isGeneratedContent(campaign.content)) {
    return NextResponse.json({ success: false, error: 'Campaign not found.' }, { status: 404 })
  }

  const ingestion = isRecord(campaign.ingestion) ? campaign.ingestion : {}
  const sourceUrl = ingestion.status === 'success' && typeof campaign.source_url === 'string'
    ? campaign.source_url
    : undefined
  const goal = campaign.goal as CampaignGoal

  const { bundle } = await generateContentBundle(supabase, {
    userId: user!.id,
    sourceUrl,
    keyword: campaign.keyword,
    tone: campaign.tone as GenerationTone,
    audienceHint: GOAL_AUDIENCES[goal] || GOAL_AUDIENCES.sales,
    nicheHint: campaign.product_description || undefined,
    persist: false,
  })

  const nextContent: GeneratedContentBundle = {
    ...campaign.content,
    [section]: bundle[section],
  }
  const updatedAt = new Date().toISOString()

  const { error: updateError } = await supabase
    .from('campaigns')
    .update({ content: nextContent, updated_at: updatedAt })
    .eq('campaign_id', campaignId)
    .eq('user_id', user!.id)

  if (updateError) throw updateError
  await syncLinkedFunnel(supabase, user!.id, campaign.funnel_id, nextContent)

  return NextResponse.json({
    success: true,
    section,
    content: nextContent,
    savedAt: updatedAt,
  })
})
