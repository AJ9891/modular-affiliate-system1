import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { createServiceRoleClient } from '@/lib/supabase-server'
import { emailService } from '@/lib/email/service'

type BetaTesterStatus = 'prospect' | 'invited' | 'active' | 'paused'

type BetaTesterRow = {
  id: string
  email: string
  full_name: string | null
  company: string | null
  status: BetaTesterStatus
  notes: string | null
  invited_at: string | null
  invite_token: string | null
  invite_sent_at: string | null
  invite_accepted_at: string | null
  accepted_user_id: string | null
  created_by: string | null
  created_at: string
  updated_at: string
}

function sanitizeText(value: unknown, maxLength: number): string {
  if (typeof value !== 'string') return ''
  return value.trim().slice(0, maxLength)
}

function isValidStatus(value: unknown): value is BetaTesterStatus {
  return value === 'prospect' || value === 'invited' || value === 'active' || value === 'paused'
}

function getAppBaseUrl(request: NextRequest): string {
  return process.env.NEXT_PUBLIC_APP_URL || process.env.NEXT_PUBLIC_BASE_URL || request.nextUrl.origin
}

function buildBetaInviteUrl(request: NextRequest, token: string): string {
  const appBaseUrl = getAppBaseUrl(request).replace(/\/$/, '')
  return `${appBaseUrl}/signup?betaInvite=${encodeURIComponent(token)}`
}

async function sendBetaInviteEmail(params: {
  toEmail: string
  fullName: string | null
  inviteUrl: string
}) {
  const displayName = params.fullName?.trim() || 'there'
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 620px; margin: 0 auto; line-height: 1.5; color: #0f172a;">
      <h2 style="margin-bottom: 8px;">You are invited to beta test Launchpad4Success</h2>
      <p>Hi ${displayName},</p>
      <p>We added you to our private beta tester list. Use the button below to create your account and start onboarding.</p>
      <p style="margin: 24px 0;">
        <a href="${params.inviteUrl}" style="background:#06b6d4;color:#001018;text-decoration:none;padding:12px 18px;border-radius:8px;font-weight:700;display:inline-block;">
          Accept Beta Invite
        </a>
      </p>
      <p>If the button does not work, copy and paste this link:</p>
      <p><a href="${params.inviteUrl}">${params.inviteUrl}</a></p>
      <p style="margin-top: 24px;">Thanks,<br/>Launchpad4Success Team</p>
    </div>
  `

  const text = `Hi ${displayName},

You are invited to beta test Launchpad4Success.

Create your account here:
${params.inviteUrl}

Thanks,
Launchpad4Success Team`

  await emailService.sendEmail({
    to: { email: params.toEmail, name: params.fullName || undefined },
    from: { email: 'noreply@affiliatelaunchpad.com', name: 'Launchpad4Success' },
    subject: 'Your Launchpad4Success beta invite',
    html,
    text,
    trackOpens: true,
    trackClicks: true,
  })
}

async function requireAdmin() {
  const supabase = createRouteHandlerClient({ cookies })
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) }
  }

  const { data: profile } = await supabase
    .from('users')
    .select('is_admin, role')
    .eq('id', user.id)
    .maybeSingle()

  const isAdmin = profile?.is_admin === true || profile?.role === 'admin' || profile?.role === 'owner'
  if (!isAdmin) {
    return { error: NextResponse.json({ error: 'Forbidden' }, { status: 403 }) }
  }

  return { user }
}

export async function GET(request: NextRequest) {
  const auth = await requireAdmin()
  if ('error' in auth) return auth.error

  try {
    const adminClient = createServiceRoleClient()
    const { data, error } = await adminClient
      .from('beta_testers')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({
      testers: ((data ?? []) as BetaTesterRow[]).map((tester) => ({
        ...tester,
        invite_url: tester.invite_token ? buildBetaInviteUrl(request, tester.invite_token) : null,
      })),
    })
  } catch (error: unknown) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to load beta testers' },
      { status: 500 },
    )
  }
}

export async function POST(request: NextRequest) {
  const auth = await requireAdmin()
  if ('error' in auth) return auth.error

  try {
    const body = (await request.json().catch(() => ({}))) as Record<string, unknown>
    const email = sanitizeText(body.email, 254).toLowerCase()
    const fullName = sanitizeText(body.full_name, 120)
    const company = sanitizeText(body.company, 120)
    const notes = sanitizeText(body.notes, 2000)
    const status: BetaTesterStatus = isValidStatus(body.status) ? body.status : 'prospect'
    const shouldSendInvite = status === 'invited'
    const inviteToken = shouldSendInvite ? crypto.randomUUID() : null
    const inviteSentAt = shouldSendInvite ? new Date().toISOString() : null

    if (!email || !email.includes('@')) {
      return NextResponse.json({ error: 'A valid email is required' }, { status: 400 })
    }

    const adminClient = createServiceRoleClient()
    const { data, error } = await adminClient
      .from('beta_testers')
      .insert({
        email,
        full_name: fullName || null,
        company: company || null,
        notes: notes || null,
        status,
        invited_at: status === 'invited' ? new Date().toISOString() : null,
        invite_token: inviteToken,
        invite_sent_at: inviteSentAt,
        created_by: auth.user.id,
      })
      .select('*')
      .single<BetaTesterRow>()

    if (error) {
      if (error.code === '23505') {
        return NextResponse.json({ error: 'That beta tester email already exists' }, { status: 409 })
      }
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    let inviteEmailError: string | null = null
    if (shouldSendInvite && inviteToken) {
      const inviteUrl = buildBetaInviteUrl(request, inviteToken)
      try {
        await sendBetaInviteEmail({
          toEmail: email,
          fullName: fullName || null,
          inviteUrl,
        })
      } catch (emailError) {
        inviteEmailError = emailError instanceof Error ? emailError.message : 'Failed to send invite email'
      }
    }

    return NextResponse.json(
      {
        tester: {
          ...data,
          invite_url: data.invite_token ? buildBetaInviteUrl(request, data.invite_token) : null,
        },
        inviteEmailError,
      },
      { status: 201 },
    )
  } catch (error: unknown) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create beta tester' },
      { status: 500 },
    )
  }
}

export async function PATCH(request: NextRequest) {
  const auth = await requireAdmin()
  if ('error' in auth) return auth.error

  try {
    const body = (await request.json().catch(() => ({}))) as Record<string, unknown>
    const id = sanitizeText(body.id, 64)
    if (!id) {
      return NextResponse.json({ error: 'Tester id is required' }, { status: 400 })
    }

    const adminClient = createServiceRoleClient()
    const { data: existingTester, error: fetchError } = await adminClient
      .from('beta_testers')
      .select('*')
      .eq('id', id)
      .single<BetaTesterRow>()

    if (fetchError || !existingTester) {
      return NextResponse.json({ error: fetchError?.message || 'Tester not found' }, { status: 404 })
    }

    const updates: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    }

    if (typeof body.full_name !== 'undefined') {
      updates.full_name = sanitizeText(body.full_name, 120) || null
    }
    if (typeof body.company !== 'undefined') {
      updates.company = sanitizeText(body.company, 120) || null
    }
    if (typeof body.notes !== 'undefined') {
      updates.notes = sanitizeText(body.notes, 2000) || null
    }
    const requestedStatus = isValidStatus(body.status) ? body.status : null
    if (requestedStatus) {
      updates.status = requestedStatus
      if (requestedStatus === 'invited') {
        updates.invited_at = existingTester.invited_at || new Date().toISOString()
      }
    }

    const shouldSendInvite =
      body.resend_invite === true ||
      (requestedStatus === 'invited' && existingTester.status !== 'invited')

    if (shouldSendInvite) {
      updates.status = 'invited'
      updates.invited_at = existingTester.invited_at || new Date().toISOString()
      updates.invite_token = existingTester.invite_token || crypto.randomUUID()
      updates.invite_sent_at = new Date().toISOString()
    }

    const { data, error } = await adminClient
      .from('beta_testers')
      .update(updates)
      .eq('id', id)
      .select('*')
      .single<BetaTesterRow>()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    let inviteEmailError: string | null = null
    if (shouldSendInvite && data.invite_token) {
      const inviteUrl = buildBetaInviteUrl(request, data.invite_token)
      try {
        await sendBetaInviteEmail({
          toEmail: data.email,
          fullName: data.full_name,
          inviteUrl,
        })
      } catch (emailError) {
        inviteEmailError = emailError instanceof Error ? emailError.message : 'Failed to send invite email'
      }
    }

    return NextResponse.json(
      {
        tester: {
          ...data,
          invite_url: data.invite_token ? buildBetaInviteUrl(request, data.invite_token) : null,
        },
        inviteEmailError,
      },
      { status: 200 },
    )
  } catch (error: unknown) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to update beta tester' },
      { status: 500 },
    )
  }
}

export async function DELETE(request: NextRequest) {
  const auth = await requireAdmin()
  if ('error' in auth) return auth.error

  try {
    const id = sanitizeText(new URL(request.url).searchParams.get('id'), 64)
    if (!id) {
      return NextResponse.json({ error: 'Tester id is required' }, { status: 400 })
    }

    const adminClient = createServiceRoleClient()
    const { error } = await adminClient.from('beta_testers').delete().eq('id', id)
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true }, { status: 200 })
  } catch (error: unknown) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to delete beta tester' },
      { status: 500 },
    )
  }
}
