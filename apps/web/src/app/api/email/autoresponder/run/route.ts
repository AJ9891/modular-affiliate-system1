import { NextRequest, NextResponse } from 'next/server'
import { runEmailAutoresponderQueue } from '@/lib/email/service'

function getConfiguredSecrets(): string[] {
  return [process.env.AUTORESPONDER_CRON_SECRET, process.env.CRON_SECRET]
    .map((value) => (value || '').trim())
    .filter((value) => value.length > 0)
}

function isAuthorized(request: NextRequest, secrets: string[]): boolean {
  if (secrets.length === 0) return false

  const bearer = request.headers.get('authorization')
  const bearerToken = bearer?.startsWith('Bearer ') ? bearer.slice(7) : null
  const headerToken = request.headers.get('x-autoresponder-secret')

  return secrets.includes(bearerToken || '') || secrets.includes(headerToken || '')
}

function resolveLimit(request: NextRequest, body?: { limit?: unknown }): number {
  const requestedLimit = Number(body?.limit ?? request.nextUrl.searchParams.get('limit') ?? 50)
  return Number.isFinite(requestedLimit) && requestedLimit > 0 ? Math.floor(requestedLimit) : 50
}

async function runQueue(request: NextRequest, body?: { limit?: unknown }) {
  const secrets = getConfiguredSecrets()
  if (secrets.length === 0) {
    return NextResponse.json(
      { success: false, error: 'AUTORESPONDER_CRON_SECRET or CRON_SECRET must be configured' },
      { status: 503 }
    )
  }

  if (!isAuthorized(request, secrets)) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
  }

  const limit = resolveLimit(request, body)
  const result = await runEmailAutoresponderQueue(limit)
  return NextResponse.json({ success: true, ...result })
}

export async function GET(request: NextRequest) {
  return runQueue(request)
}

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => ({}))
  return runQueue(request, body)
}
