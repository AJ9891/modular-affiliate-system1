import { NextResponse } from 'next/server'
import { withRouteHandler } from '@/features/shared/api/route-handler'
import { readJson } from '@/lib/http'

type PublishMode = 'now' | 'schedule'

export const POST = withRouteHandler(async ({ request, supabase, user, params }) => {
  const { campaignId } = await Promise.resolve(params as { campaignId: string })
  const body = await readJson<Record<string, unknown>>(request)
  const mode = body.mode as PublishMode

  if (mode !== 'now' && mode !== 'schedule') {
    return NextResponse.json({ success: false, error: 'Choose Publish Now or Schedule.' }, { status: 400 })
  }

  const { data: campaign, error: campaignError } = await supabase
    .from('campaigns')
    .select('campaign_id, funnel_id, status, title, content')
    .eq('campaign_id', campaignId)
    .eq('user_id', user!.id)
    .maybeSingle()

  if (campaignError) throw campaignError
  if (!campaign) {
    return NextResponse.json({ success: false, error: 'Campaign not found.' }, { status: 404 })
  }
  if (!campaign.funnel_id) {
    return NextResponse.json(
      { success: false, error: 'This campaign has no linked funnel. Rebuild the campaign before publishing.' },
      { status: 409 }
    )
  }

  const { data: funnel, error: funnelError } = await supabase
    .from('funnels')
    .select('funnel_id, slug, status')
    .eq('funnel_id', campaign.funnel_id)
    .eq('user_id', user!.id)
    .maybeSingle()

  if (funnelError) throw funnelError
  if (!funnel?.slug) {
    return NextResponse.json(
      { success: false, error: 'The linked funnel is missing or has no public address.' },
      { status: 409 }
    )
  }

  if (mode === 'schedule') {
    const { data: integration, error: integrationError } = await supabase
      .from('cms_integrations')
      .select('id, provider')
      .eq('user_id', user!.id)
      .eq('is_active', true)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle()

    if (integrationError) throw integrationError
    if (!integration) {
      return NextResponse.json(
        {
          success: false,
          error: 'Connect an active CMS or webhook before scheduling external publishing.',
          needsIntegration: true,
        },
        { status: 409 }
      )
    }

    const runAt = typeof body.runAt === 'string' ? new Date(body.runAt) : new Date(Number.NaN)
    if (Number.isNaN(runAt.getTime())) {
      return NextResponse.json({ success: false, error: 'Choose a valid publishing date and time.' }, { status: 400 })
    }
    if (runAt.getTime() < Date.now() + 5 * 60 * 1000) {
      return NextResponse.json({ success: false, error: 'Schedule publishing at least 5 minutes from now.' }, { status: 400 })
    }

    const now = new Date().toISOString()
    const { data: schedule, error: scheduleError } = await supabase
      .from('content_schedule')
      .insert({
        user_id: user!.id,
        title: campaign.title,
        run_at: runAt.toISOString(),
        status: 'queued',
        content_type: 'article_and_funnel',
        content_payload: {
          campaignId: campaign.campaign_id,
          content: campaign.content,
          destination: 'active_cms_integration',
          integrationId: integration.id,
        },
        funnel_id: funnel.funnel_id,
        created_at: now,
        updated_at: now,
      })
      .select('id, run_at, status')
      .single()

    if (scheduleError) throw scheduleError

    return NextResponse.json({
      success: true,
      mode,
      schedule,
      message: 'Campaign scheduled. It will publish through your active CMS/webhook connection.',
    })
  }

  const now = new Date().toISOString()
  const { data: publishedFunnel, error: publishError } = await supabase
    .from('funnels')
    .update({ status: 'published', active: true, updated_at: now })
    .eq('funnel_id', funnel.funnel_id)
    .eq('user_id', user!.id)
    .select('funnel_id, slug, status')
    .single()

  if (publishError) throw publishError

  const { error: statusError } = await supabase
    .from('campaigns')
    .update({ status: 'published', updated_at: now })
    .eq('campaign_id', campaign.campaign_id)
    .eq('user_id', user!.id)

  if (statusError) {
    await supabase
      .from('funnels')
      .update({ status: funnel.status || 'draft', active: funnel.status === 'published', updated_at: now })
      .eq('funnel_id', funnel.funnel_id)
      .eq('user_id', user!.id)
    throw statusError
  }

  return NextResponse.json({
    success: true,
    mode,
    funnel: publishedFunnel,
    publicPath: `/f/${publishedFunnel.slug}`,
    message: 'Campaign published. Your funnel is now public.',
  })
})
