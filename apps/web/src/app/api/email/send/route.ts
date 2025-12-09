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

    if (type === 'campaign') {
      // Send campaign
      const campaign = await sendshark.createCampaign({
        name: body.name || `Campaign ${Date.now()}`,
        fromEmail: body.fromEmail || 'noreply@affiliatelaunchpad.com',
        fromName: body.fromName || 'Affiliate Launchpad',
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
