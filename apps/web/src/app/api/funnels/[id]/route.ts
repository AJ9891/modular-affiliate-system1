import { NextResponse } from 'next/server'
import { withRouteHandler } from '@/features/shared/api/route-handler'
import { readJson } from '@/lib/http'
import {
  deleteFunnelForUserByIdOrSlug,
  getFunnelForUserByIdOrSlug,
  updateFunnelForUserByIdOrSlug,
} from '@/features/funnels/server/funnels.service'

async function getIdFromParams(params?: Promise<Record<string, string>> | Record<string, string>) {
  const resolved = params ? await params : {}
  const id = resolved.id
  if (!id) {
    const err = new Error('Missing funnel id')
    ;(err as Error & { status?: number }).status = 400
    throw err
  }
  return id
}

export const GET = withRouteHandler(async ({ supabase, user, params }) => {
  const id = await getIdFromParams(params)
  const funnel = await getFunnelForUserByIdOrSlug(supabase, user!.id, id)
  return NextResponse.json({ funnel }, { status: 200 })
})

export const PUT = withRouteHandler(async ({ request, supabase, user, params }) => {
  const id = await getIdFromParams(params)
  const body = await readJson<Record<string, unknown>>(request)
  const funnel = await updateFunnelForUserByIdOrSlug(supabase, user!.id, id, body)
  return NextResponse.json({ funnel }, { status: 200 })
})

export const DELETE = withRouteHandler(async ({ supabase, user, params }) => {
  const id = await getIdFromParams(params)
  await deleteFunnelForUserByIdOrSlug(supabase, user!.id, id)
  return NextResponse.json({ message: 'Funnel deleted successfully' }, { status: 200 })
})
