import { NextResponse } from 'next/server'
import { withRouteHandler } from '@/features/shared/api/route-handler'
import { readJson, ValidationError } from '@/lib/http'
import {
  listCmsIntegrationsForUser,
  saveCmsIntegrationForUser,
} from '@/features/publishing/server/publish-runner.service'

const ALLOWED_AUTH_TYPES = new Set(['none', 'bearer', 'basic', 'header'])
const PRIVATE_IPV4 = /^(127\.|10\.|192\.168\.|169\.254\.|0\.|172\.(1[6-9]|2\d|3[01])\.)/

function validateTargetUrl(raw: string): URL {
  let url: URL
  try {
    url = new URL(raw)
  } catch {
    throw new ValidationError('Enter a valid webhook URL')
  }

  if (url.protocol !== 'https:') {
    throw new ValidationError('Webhook URLs must use HTTPS')
  }

  const hostname = url.hostname.toLowerCase()
  if (
    hostname === 'localhost' ||
    hostname === '::1' ||
    hostname.endsWith('.local') ||
    PRIVATE_IPV4.test(hostname)
  ) {
    throw new ValidationError('Private or local webhook targets are not allowed')
  }

  return url
}

function safeIntegration(integration: Record<string, unknown>) {
  let destination = 'Secure webhook'
  try {
    destination = new URL(String(integration.target_url || '')).hostname
  } catch {
    // Keep the non-secret fallback label.
  }

  return {
    id: integration.id,
    provider: integration.provider,
    destination,
    authType: integration.auth_type,
    isActive: integration.is_active,
    lastTestStatus: integration.last_test_status,
    lastError: integration.last_error,
    createdAt: integration.created_at,
    updatedAt: integration.updated_at,
  }
}

export const GET = withRouteHandler(async ({ supabase, user }) => {
  const integrations = await listCmsIntegrationsForUser(supabase, user!.id)
  return NextResponse.json(
    { success: true, integrations: integrations.map((item) => safeIntegration(item)) },
    { status: 200 }
  )
})

export const POST = withRouteHandler(async ({ request, supabase, user }) => {
  const body = await readJson<Record<string, unknown>>(request)

  const provider = typeof body.provider === 'string' ? body.provider.trim() : ''
  const targetUrl = typeof body.targetUrl === 'string' ? body.targetUrl.trim() : ''
  const authType = typeof body.authType === 'string' ? body.authType : 'none'
  const authValue = typeof body.authValue === 'string' ? body.authValue.trim() : undefined
  const config = typeof body.config === 'object' && body.config ? (body.config as Record<string, unknown>) : {}
  const isActive = typeof body.isActive === 'boolean' ? body.isActive : true

  if (provider !== 'make_webhook' && provider !== 'generic_webhook') {
    throw new ValidationError('Unsupported webhook provider')
  }
  if (!ALLOWED_AUTH_TYPES.has(authType)) {
    throw new ValidationError('Unsupported authentication type')
  }
  if (authType !== 'none' && !authValue) {
    throw new ValidationError('Authentication value is required')
  }

  const url = validateTargetUrl(targetUrl)
  let testResponse: Response
  try {
    testResponse = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: 'launchpad.integration.test',
        source: 'launchpad4success',
        requestedAt: new Date().toISOString(),
      }),
      signal: AbortSignal.timeout(10_000),
      redirect: 'error',
    })
  } catch {
    throw new ValidationError('Launchpad could not reach this webhook')
  }

  if (!testResponse.ok) {
    throw new ValidationError(`Webhook test failed with status ${testResponse.status}`)
  }

  const integration = await saveCmsIntegrationForUser(supabase, user!.id, {
    provider,
    targetUrl: url.toString(),
    authType: authType as 'none' | 'bearer' | 'basic' | 'header',
    authValue,
    config,
    isActive,
  })

  const { error: statusError } = await supabase
    .from('cms_integrations')
    .update({
      last_test_status: 'success',
      last_error: null,
      updated_at: new Date().toISOString(),
    })
    .eq('id', integration.id)
    .eq('user_id', user!.id)

  if (statusError) {
    throw new Error(statusError.message)
  }

  return NextResponse.json(
    {
      success: true,
      integration: safeIntegration({
        ...integration,
        last_test_status: 'success',
        last_error: null,
      }),
    },
    { status: 201 }
  )
})
