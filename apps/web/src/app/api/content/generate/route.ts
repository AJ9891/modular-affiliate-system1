import { NextResponse } from 'next/server'
import { withRouteHandler } from '@/features/shared/api/route-handler'
import { readJson } from '@/lib/http'
import { generateContentBundle } from '@/features/content/server/content-generation.service'

export const POST = withRouteHandler(async ({ request, supabase, user }) => {
  const body = await readJson<Record<string, unknown>>(request)

  const sourceUrl = typeof body.sourceUrl === 'string' ? body.sourceUrl : undefined
  const keyword = typeof body.keyword === 'string' ? body.keyword : undefined
  const tone = typeof body.tone === 'string' ? body.tone : undefined
  const audienceHint = typeof body.audienceHint === 'string' ? body.audienceHint : undefined
  const nicheHint = typeof body.nicheHint === 'string' ? body.nicheHint : undefined
  const persist = typeof body.persist === 'boolean' ? body.persist : true

  if (!sourceUrl && !keyword) {
    throw new Error('sourceUrl or keyword is required')
  }

  const { bundle, funnelId, warnings } = await generateContentBundle(supabase, {
    userId: user!.id,
    sourceUrl,
    keyword,
    tone: (tone as 'professional' | 'casual' | 'urgent' | 'friendly' | undefined) || 'professional',
    audienceHint,
    nicheHint,
    persist,
  })

  return NextResponse.json(
    {
      success: true,
      content: bundle,
      saved: { funnelId },
      warnings,
    },
    { status: 200 }
  )
})
