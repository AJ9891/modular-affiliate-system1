import { NextResponse } from 'next/server'
import { withRouteHandler } from '@/features/shared/api/route-handler'
import { readJson } from '@/lib/http'
import { createFunnelForUser, listFunnelsForUser } from '@/features/funnels/server/funnels.service'

export const GET = withRouteHandler(async ({ supabase, user }) => {
  const funnels = await listFunnelsForUser(supabase, user!.id)
  return NextResponse.json({ funnels }, { status: 200 })
})

export const POST = withRouteHandler(async ({ request, supabase, user }) => {
  const body = await readJson<Record<string, unknown>>(request)
  const funnel = await createFunnelForUser(supabase, user!, body)
  return NextResponse.json(
    {
      funnel,
      funnelId: funnel.funnel_id,
      success: true,
    },
    { status: 201 }
  )
})
