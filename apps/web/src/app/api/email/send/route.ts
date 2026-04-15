import { NextRequest, NextResponse } from 'next/server'
import { emailService } from '@/lib/email/service'

/**
 * Send Email API Endpoint
 * POST /api/email/send
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { to, subject, html, text, template, type = 'single' } = body
    const defaultFromEmail = process.env.EMAIL_DEFAULT_FROM || 'user@launchpad4success.pro'
    const defaultFromName = process.env.EMAIL_DEFAULT_FROM_NAME || 'Launchpad4Success'

    if (type === 'campaign') {
      // Send campaign
      const campaign = await emailService.createCampaign({
        name: body.name || `Campaign ${Date.now()}`,
        fromEmail: body.fromEmail || defaultFromEmail,
        fromName: body.fromName || defaultFromName,
        subject,
        template: template || { name: 'Custom', subject, html, text },
        recipients: body.recipients || [],
        scheduledAt: body.scheduledAt ? new Date(body.scheduledAt) : undefined,
      })

      return NextResponse.json({ 
        success: true, 
        campaignId: campaign.id,
        message: 'Campaign created successfully' 
      })
    }

    // Send single email
    const result = await emailService.sendEmail({
      to: typeof to === 'string' ? { email: to } : to,
      from: {
        email: body.fromEmail || defaultFromEmail,
        name: body.fromName || defaultFromName,
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
