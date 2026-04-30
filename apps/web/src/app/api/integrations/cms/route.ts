import { NextResponse } from 'next/server'
import { withRouteHandler } from '@/features/shared/api/route-handler'
import { readJson } from '@/lib/http'
import {
  listCmsIntegrationsForUser,
  saveCmsIntegrationForUser,
} from '@/features/publishing/server/publish-runner.service'

export const GET = withRouteHandler(async ({ supabase, user }) => {
  const integrations = await listCmsIntegrationsForUser(supabase, user!.id)
  return NextResponse.json({ success: true, integrations }, { status: 200 })
})

export const POST = withRouteHandler(async ({ request, supabase, user }) => {
  const body = await readJson<Record<string, unknown>>(request)

  const provider = typeof body.provider === 'string' ? body.provider : ''
  const targetUrl = typeof body.targetUrl === 'string' ? body.targetUrl : ''
  const authType = typeof body.authType === 'string' ? body.authType : 'none'
  const authValue = typeof body.authValue === 'string' ? body.authValue : undefined
  const config = typeof body.config === 'object' && body.config ? (body.config as Record<string, unknown>) : {}
  const isActive = typeof body.isActive === 'boolean' ? body.isActive : true

  const integration = await saveCmsIntegrationForUser(supabase, user!.id, {
    provider,
    targetUrl,
    authType: authType as 'none' | 'bearer' | 'basic' | 'header',
    authValue,
    config,
    isActive,
  })

  return NextResponse.json({ success: true, integration }, { status: 201 })
})
