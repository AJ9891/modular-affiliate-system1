import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  try {
    // For now we simply accept and drop, but this endpoint can be wired to Supabase later.
    await req.json().catch(() => null)
    return NextResponse.json({ ok: true })
  } catch (error) {
    return NextResponse.json({ ok: false, error: 'telemetry_error' }, { status: 500 })
  }
}
