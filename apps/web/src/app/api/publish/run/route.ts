import { NextRequest, NextResponse } from 'next/server'
import { runDuePublishSchedules } from '@/features/publishing/server/publish-runner.service'

function configuredSecrets(): string[] {
  return [process.env.PUBLISH_CRON_SECRET, process.env.CRON_SECRET]
    .map((value) => (value || '').trim())
    .filter((value) => value.length > 0)
}

function isAuthorized(request: NextRequest, secrets: string[]) {
  if (secrets.length === 0) return false

  const bearer = request.headers.get('authorization')
  const bearerToken = bearer?.startsWith('Bearer ') ? bearer.slice(7).trim() : ''
  const secretHeader = request.headers.get('x-publish-secret')?.trim() || ''
  const secretQuery = request.nextUrl.searchParams.get('secret')?.trim() || ''

  if ([bearerToken, secretHeader, secretQuery].some((token) => token && secrets.includes(token))) {
    return true
  }

  const vercelCronHeader = request.headers.get('x-vercel-cron')
  if (process.env.VERCEL === '1' && vercelCronHeader) {
    return true
  }

  return false
}

function resolveLimit(request: NextRequest, body?: { limit?: unknown }) {
  const raw = Number(body?.limit ?? request.nextUrl.searchParams.get('limit') ?? 25)
  if (!Number.isFinite(raw) || raw <= 0) return 25
  return Math.min(200, Math.floor(raw))
}

async function handleRun(request: NextRequest, body?: { limit?: unknown }) {
  const secrets = configuredSecrets()
  if (secrets.length === 0) {
    return NextResponse.json(
      { success: false, error: 'PUBLISH_CRON_SECRET or CRON_SECRET must be configured' },
      { status: 503 }
    )
  }

  if (!isAuthorized(request, secrets)) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
  }

  const limit = resolveLimit(request, body)
  const result = await runDuePublishSchedules(limit)
  return NextResponse.json(result, { status: result.success ? 200 : 500 })
}

export async function GET(request: NextRequest) {
  return handleRun(request)
}

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => ({}))
  return handleRun(request, body)
}
