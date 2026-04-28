import { NextResponse } from 'next/server'
import { withRouteHandler } from '@/features/shared/api/route-handler'
import { readJson } from '@/lib/http'
import {
  getTeamContext,
  inviteTeamMember,
  removeTeamMember,
} from '@/features/team/server/team-members.service'

// GET /api/team - List team membership context
export const GET = withRouteHandler(async ({ supabase, user }) => {
  const context = await getTeamContext(supabase, user!.id)
  return NextResponse.json(context)
})

// POST /api/team - Invite team member
export const POST = withRouteHandler(async ({ request, supabase, user }) => {
  const body = await readJson<{ member_email?: string; role?: string }>(request)
  const memberEmail = body.member_email?.trim()
  const role = body.role || 'viewer'

  if (!memberEmail) {
    return NextResponse.json({ error: 'Email is required' }, { status: 400 })
  }

  if (!['owner', 'admin', 'editor', 'viewer'].includes(role)) {
    return NextResponse.json({ error: 'Invalid role' }, { status: 400 })
  }

  const { member, inviteToken } = await inviteTeamMember(supabase, user!.id, {
    memberEmail,
    role: role as 'owner' | 'admin' | 'editor' | 'viewer',
  })

  try {
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
    const inviteLink = `${appUrl}/team/accept?token=${inviteToken}`

    const emailResponse = await fetch(`${appUrl}/api/email/send`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        to: memberEmail,
        subject: "You've been invited to join a team on Launchpad4Success",
        html: `<p>You've been invited as a <strong>${role}</strong>.</p><p><a href="${inviteLink}">Accept invitation</a></p>`,
      }),
    })

    if (!emailResponse.ok) {
      console.error('Failed to send invite email:', await emailResponse.text())
    }
  } catch (emailError) {
    console.error('Error sending invite email:', emailError)
  }

  return NextResponse.json({
    success: true,
    member,
    inviteLink: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/team/accept?token=${inviteToken}`,
  })
})

// DELETE /api/team?memberId=xxx - Remove team member
export const DELETE = withRouteHandler(async ({ request, supabase, user }) => {
  const { searchParams } = new URL(request.url)
  const memberId = searchParams.get('memberId')

  if (!memberId) {
    return NextResponse.json({ error: 'Member ID is required' }, { status: 400 })
  }

  await removeTeamMember(supabase, user!.id, memberId)
  return NextResponse.json({ success: true })
})
