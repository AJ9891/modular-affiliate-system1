import { emailService } from '@/lib/email/service'

export type SendEmailPayload = {
  to?: string | { email: string; name?: string }
  subject?: string
  html?: string
  text?: string
  template?: unknown
  type?: 'single' | 'campaign'
  name?: string
  fromEmail?: string
  fromName?: string
  recipients?: Array<{ email: string; name?: string }>
  scheduledAt?: string
  trackOpens?: boolean
  trackClicks?: boolean
}

export async function handleEmailSend(body: SendEmailPayload, userId: string | null) {
  const { to, subject, html, text, template, type = 'single' } = body
  const defaultFromEmail = process.env.EMAIL_DEFAULT_FROM || 'user@launchpad4success.pro'
  const defaultFromName = process.env.EMAIL_DEFAULT_FROM_NAME || 'Launchpad4Success'

  if (type === 'campaign') {
    if (!subject || typeof subject !== 'string') {
      const err = new Error('subject is required for campaigns')
      ;(err as Error & { status?: number }).status = 400
      throw err
    }

    if (!template && (!html || typeof html !== 'string')) {
      const err = new Error('template or html is required for campaigns')
      ;(err as Error & { status?: number }).status = 400
      throw err
    }

    const campaign = await emailService.createCampaign({
      userId,
      name: body.name || `Campaign ${Date.now()}`,
      fromEmail: body.fromEmail || defaultFromEmail,
      fromName: body.fromName || defaultFromName,
      subject,
      template: (template as any) || { name: 'Custom', subject, html, text },
      recipients: body.recipients || [],
      scheduledAt: body.scheduledAt ? new Date(body.scheduledAt) : undefined,
    })

    return {
      success: true,
      campaignId: campaign.id,
      message: 'Campaign created successfully',
    }
  }

  if (!to || !subject || !html) {
    const err = new Error('to, subject, and html are required')
    ;(err as Error & { status?: number }).status = 400
    throw err
  }

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

  return {
    success: true,
    messageId: result.id,
    message: 'Email sent successfully',
  }
}
