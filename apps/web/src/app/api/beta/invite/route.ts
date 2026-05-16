import { NextRequest, NextResponse } from 'next/server'
import { createServiceRoleClient } from '@/lib/supabase-server'

type BetaTesterInviteRow = {
  id: string
  email: string
  full_name: string | null
  status: 'prospect' | 'invited' | 'active' | 'paused'
  invite_token: string | null
  invite_accepted_at: string | null
}

function sanitizeToken(value: string | null): string {
  if (!value) return ''
  return value.trim().slice(0, 120)
}

export async function GET(request: NextRequest) {
  try {
    const token = sanitizeToken(request.nextUrl.searchParams.get('token'))
    if (!token) {
      return NextResponse.json({ error: 'Invite token is required' }, { status: 400 })
    }

    const adminClient = createServiceRoleClient()
    const { data, error } = await adminClient
      .from('beta_testers')
      .select('id,email,full_name,status,invite_token,invite_accepted_at')
      .eq('invite_token', token)
      .single<BetaTesterInviteRow>()

    if (error || !data) {
      return NextResponse.json({ error: 'Invalid invite token' }, { status: 404 })
    }

    if (data.status === 'paused') {
      return NextResponse.json({ error: 'This invite is currently paused' }, { status: 403 })
    }

    const alreadyAccepted = data.status === 'active' || Boolean(data.invite_accepted_at)
    return NextResponse.json({
      valid: true,
      email: data.email,
      full_name: data.full_name,
      status: data.status,
      alreadyAccepted,
    })
  } catch (error: unknown) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to resolve beta invite' },
      { status: 500 },
    )
  }
}
