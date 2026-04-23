import { NextRequest, NextResponse } from 'next/server'
import { runEmailAutoresponderQueue } from '@/lib/email/service'

function isAuthorized(request: NextRequest): boolean {
  const expected = process.env.AUTORESPONDER_CRON_SECRET
  if (!expected) return false

  const bearer = request.headers.get('authorization')
  const bearerToken = bearer?.startsWith('Bearer ') ? bearer.slice(7) : null
  const headerToken = request.headers.get('x-autoresponder-secret')

  return bearerToken === expected || headerToken === expected
}

export async function POST(request: NextRequest) {
  if (!process.env.AUTORESPONDER_CRON_SECRET) {
    return NextResponse.json(
      { success: false, error: 'AUTORESPONDER_CRON_SECRET is not configured' },
      { status: 503 }
    )
  }

  if (!isAuthorized(request)) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json().catch(() => ({}))
  const url = new URL(request.url)
  const requestedLimit = Number(body?.limit ?? url.searchParams.get('limit') ?? 50)
  const limit = Number.isFinite(requestedLimit) && requestedLimit > 0 ? Math.floor(requestedLimit) : 50

  const result = await runEmailAutoresponderQueue(limit)
  return NextResponse.json({ success: true, ...result })
}
