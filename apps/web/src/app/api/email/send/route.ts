import { NextRequest, NextResponse } from 'next/server'
import { sendshark } from '@/lib/sendshark'

/**
 * Send Email API Endpoint
 * POST /api/email/send
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { to, subject, html, text, template, type = 'single' } = body
    const hasSendshark = Boolean(process.env.SENDSHARK_API_KEY)

    if (type === 'campaign') {
      const campaignName = body.name || `Campaign ${Date.now()}`
      const scheduledAt = body.scheduledAt ? new Date(body.scheduledAt) : undefined

      // Draft/scheduling should not hard-fail when provider credentials are missing.
      if (!hasSendshark) {
        return NextResponse.json({
          success: true,
          campaignId: `draft_${Date.now()}`,
          provider: 'local-draft',
          message: 'Campaign draft created. Configure SENDSHARK_API_KEY to enable provider delivery.',
          campaign: {
            name: campaignName,
            subject,
            recipients: Array.isArray(body.recipients) ? body.recipients.length : 0,
            scheduledAt: scheduledAt?.toISOString() ?? null,
          },
        })
      }

      // Send campaign
      const campaign = await sendshark.createCampaign({
        name: campaignName,
        fromEmail: body.fromEmail || 'noreply@affiliatelaunchpad.com',
        fromName: body.fromName || 'Affiliate Launchpad',
        subject,
        template: template || { name: 'Custom', subject, html, text },
        recipients: body.recipients || [],
        scheduledAt,
      })

      return NextResponse.json({ 
        success: true, 
        campaignId: campaign.id,
        message: 'Campaign created successfully' 
      })
    }

    if (!hasSendshark) {
      return NextResponse.json(
        {
          success: false,
          error: 'Email delivery is not configured. Set SENDSHARK_API_KEY to send individual emails.',
        },
        { status: 503 }
      )
    }

    // Send single email
    const result = await sendshark.sendEmail({
      to: typeof to === 'string' ? { email: to } : to,
      from: {
        email: body.fromEmail || 'noreply@affiliatelaunchpad.com',
        name: body.fromName || 'Affiliate Launchpad',
      },
      subject,
      html,
      text,
      trackOpens: body.trackOpens !== false,
      trackClicks: body.trackClicks !== false,
    })

    return NextResponse.json({ 
      success: true, 
      messageId: result.id,
      message: 'Email sent successfully' 
    })
  } catch (error) {
    console.error('Send email error:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to send email' 
      },
      { status: 500 }
    )
  }
}
