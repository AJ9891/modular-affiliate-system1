import { NextResponse } from 'next/server'
import { withRouteHandler } from '@/features/shared/api/route-handler'
import { readJson } from '@/lib/http'
import {
  createScheduleForUser,
  listSchedulesForUser,
} from '@/features/publishing/server/publish-runner.service'

export const GET = withRouteHandler(async ({ supabase, user }) => {
  const schedules = await listSchedulesForUser(supabase, user!.id)
  return NextResponse.json({ success: true, schedules }, { status: 200 })
})

export const POST = withRouteHandler(async ({ request, supabase, user }) => {
  const body = await readJson<Record<string, unknown>>(request)

  const title = typeof body.title === 'string' ? body.title : ''
  const runAt = typeof body.runAt === 'string' ? body.runAt : ''
  const funnelId = typeof body.funnelId === 'string' ? body.funnelId : undefined
  const contentCandidate = body.content

  if (!contentCandidate || typeof contentCandidate !== 'object') {
    throw new Error('content is required')
  }

  const content = contentCandidate as { type?: unknown; payload?: unknown }

  const schedule = await createScheduleForUser(supabase, user!.id, {
    title,
    runAt,
    funnelId,
    content: {
      type:
        content.type === 'article_only' || content.type === 'funnel_only'
          ? content.type
          : 'article_and_funnel',
      payload: (content.payload as Record<string, unknown>) || {},
    },
  })

  return NextResponse.json({ success: true, schedule }, { status: 201 })
})
