import { NextResponse } from 'next/server'
import { withRouteHandler } from '@/features/shared/api/route-handler'
import { readJson } from '@/lib/http'
import { getOptionalAuthenticatedUserId, resolveEmailErrorStatus } from '@/lib/email/route-utils'
import { handleEmailSend, type SendEmailPayload } from '@/features/email/server/send-email.service'

/**
 * Send Email API Endpoint
 * POST /api/email/send
 */
export const POST = withRouteHandler(
  async ({ request }) => {
    try {
      const userId = await getOptionalAuthenticatedUserId(request)
      const body = await readJson<SendEmailPayload>(request)
      const result = await handleEmailSend(body, userId)
      return NextResponse.json(result)
    } catch (err) {
      console.error('Send email error:', err)
      const message = err instanceof Error ? err.message : 'Failed to send email'
      const status = resolveEmailErrorStatus(message)
      return NextResponse.json(
        {
          success: false,
          error: message,
        },
        { status: (err as { status?: number })?.status ?? status }
      )
    }
  },
  { requireAuth: false }
)
