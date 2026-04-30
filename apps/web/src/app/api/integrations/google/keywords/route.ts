import { NextResponse } from 'next/server'
import { withRouteHandler } from '@/features/shared/api/route-handler'
import { readJson } from '@/lib/http'
import {
  listRecentKeywordProjects,
  lookupAndPersistGoogleKeywords,
} from '@/features/keywords/server/google-keywords.service'

export const GET = withRouteHandler(async ({ supabase, user }) => {
  const projects = await listRecentKeywordProjects(supabase, user!.id)
  return NextResponse.json({ success: true, projects }, { status: 200 })
})

export const POST = withRouteHandler(async ({ request, supabase, user }) => {
  const body = await readJson<Record<string, unknown>>(request)
  const query = typeof body.query === 'string' ? body.query : ''
  const locale = typeof body.locale === 'string' ? body.locale : 'en-US'
  const projectName = typeof body.projectName === 'string' ? body.projectName : undefined

  const result = await lookupAndPersistGoogleKeywords(supabase, {
    userId: user!.id,
    query,
    locale,
    projectName,
  })

  return NextResponse.json({ success: true, ...result }, { status: 200 })
})
