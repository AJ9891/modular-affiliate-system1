import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClientCompat } from '@/lib/subdomain-auth'
import { generateAIResponse } from '@/lib/openai'
import { buildMarketingPrompt, resolveClientVoice, type FollowupStage } from '@/lib/marketing/client-voice'

const stages: FollowupStage[] = ['welcome', 'nurture', 'offer', 'reminder']

/**
 * Generate drafts only. Sending, enrollment and scheduling require a separate
 * consent-aware workflow and must never be triggered by this endpoint.
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createRouteHandlerClientCompat()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await request.json()
    const clientVoice = resolveClientVoice(body.clientVoice)
    const channel = body.channel
    if (channel !== 'email' && channel !== 'advertisement') {
      return NextResponse.json({ error: 'Invalid channel' }, { status: 400 })
    }
    const stage = body.stage ?? 'nurture'
    if (channel === 'email' && !stages.includes(stage)) {
      return NextResponse.json({ error: 'Invalid follow-up stage' }, { status: 400 })
    }
    if (typeof body.productName !== 'string' || typeof body.targetAudience !== 'string' ||
        typeof body.callToAction !== 'string' || !Array.isArray(body.verifiedBenefits) ||
        !body.verifiedBenefits.every((benefit: unknown) => typeof benefit === 'string')) {
      return NextResponse.json({ error: 'Invalid marketing details' }, { status: 400 })
    }

    const systemPrompt = buildMarketingPrompt({
      clientVoice, channel, stage,
      productName: body.productName,
      targetAudience: body.targetAudience,
      verifiedBenefits: body.verifiedBenefits,
      callToAction: body.callToAction,
    })
    const draft = await generateAIResponse({
      systemPrompt,
      messages: [],
      userMessage: 'Create one marketing draft. Return only valid JSON, without markdown fences.',
    })
    return NextResponse.json({ draft, clientVoice, channel, stage, status: 'draft', sent: false })
  } catch (error) {
    if (error instanceof Error && /voice|benefit|Product|audience|call to action/i.test(error.message)) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }
    return NextResponse.json({ error: 'Unable to generate marketing draft' }, { status: 500 })
  }
}
