import { NextRequest, NextResponse } from 'next/server'
import { createServiceRoleClient } from '@/lib/supabase-server'
import { verifyUnsubscribeToken } from '@/lib/email/unsubscribe'

function confirmationPage(token: string): NextResponse {
  const escapedToken = token.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;')
  return new NextResponse(
    `<!doctype html><html><body><main><h1>Unsubscribe</h1><p>Confirm that you want to stop marketing emails.</p><form method="post"><input type="hidden" name="token" value="${escapedToken}"><button type="submit">Unsubscribe</button></form></main></body></html>`,
    { headers: { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store' } }
  )
}

export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get('token')
  if (!token || !verifyUnsubscribeToken(token)) {
    return new NextResponse('Invalid unsubscribe link', { status: 400 })
  }
  return confirmationPage(token)
}

export async function POST(request: NextRequest) {
  const urlToken = request.nextUrl.searchParams.get('token')
  const contentType = request.headers.get('content-type') || ''
  let submittedToken: string | null = urlToken

  if (!submittedToken && contentType.includes('application/json')) {
    const body = await request.json().catch(() => ({}))
    submittedToken = typeof body.token === 'string' ? body.token : null
  } else if (!submittedToken) {
    try {
      const formData = await request.formData()
      submittedToken = formData.get('token')?.toString() || null
    } catch {
      return new NextResponse('Invalid unsubscribe request', { status: 400 })
    }
  }

  const recipient = submittedToken ? verifyUnsubscribeToken(submittedToken) : null
  if (!recipient) {
    return new NextResponse('Invalid unsubscribe request', { status: 400 })
  }

  const admin = createServiceRoleClient()
  const { error: suppressionError } = await admin
    .from('email_suppressions')
    .upsert(
      {
        tenant_scope: recipient.userId || 'global',
        user_id: recipient.userId,
        email: recipient.email,
        reason: 'unsubscribed',
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'tenant_scope,email' }
    )
  if (suppressionError) {
    console.error('Unable to persist email suppression:', suppressionError)
    return new NextResponse('Unable to process unsubscribe request', { status: 500 })
  }

  let query = admin
    .from('email_subscribers')
    .update({ status: 'unsubscribed', updated_at: new Date().toISOString() })
    .ilike('email', recipient.email)

  query = recipient.userId
    ? query.eq('user_id', recipient.userId)
    : query.is('user_id', null)

  const { error } = await query
  if (error) {
    console.error('Unable to apply email unsubscribe:', error)
    return new NextResponse('Unable to process unsubscribe request', { status: 500 })
  }

  return new NextResponse('You have been unsubscribed from marketing emails.', {
    headers: { 'Cache-Control': 'no-store' },
  })
}
