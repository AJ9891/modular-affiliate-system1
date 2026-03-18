import { NextResponse } from 'next/server'
import { logError } from '@/lib/logging'

export async function POST(req: Request) {
  try {
    // For now we accept and drop; wire to Supabase/queue later.
    await req.json().catch(() => null)
    return NextResponse.json({ ok: true })
  } catch (error) {
    logError(error, { endpoint: 'telemetry' })
    return NextResponse.json({ ok: false, error: 'telemetry_error' }, { status: 500 })
  }
}
