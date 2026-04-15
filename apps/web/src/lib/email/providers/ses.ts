import { SESv2Client, SendEmailCommand } from '@aws-sdk/client-sesv2'
import type {
  AddSubscriberParams,
  AutomationSequence,
  EmailCampaign,
  EmailProvider,
  EmailRecipient,
  EmailStats,
  EmailTemplate,
  SendAnalyticsReportParams,
  SendEmailParams,
} from '@/lib/email/types'

const defaultFromEmail = process.env.EMAIL_DEFAULT_FROM || 'user@launchpad4success.pro'
const defaultFromName = process.env.EMAIL_DEFAULT_FROM_NAME || 'Launchpad4Success'
const sesConfigurationSetName = process.env.SES_CONFIGURATION_SET

const templateStore = new Map<string, EmailTemplate>()
const automationStore = new Map<string, AutomationSequence>()
const subscriberStore = new Map<string, AddSubscriberParams>()

function generateId(prefix: string): string {
  return `${prefix}_${crypto.randomUUID()}`
}

function htmlToText(html: string): string {
  return html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim()
}

function buildReportHtml(params: SendAnalyticsReportParams): string {
  const { stats, dateRange } = params

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #0f766e 0%, #0f172a 100%); color: white; padding: 30px; border-radius: 8px 8px 0 0; }
        .stats { background: #f7fafc; padding: 20px; border-radius: 0 0 8px 8px; }
        .stat-row { display: flex; justify-content: space-between; padding: 15px 0; border-bottom: 1px solid #e2e8f0; }
        .stat-label { font-weight: 600; }
        .stat-value { color: #0f766e; font-size: 1.2em; font-weight: bold; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Weekly Funnel Performance</h1>
          <p>${dateRange.start.toLocaleDateString()} - ${dateRange.end.toLocaleDateString()}</p>
        </div>
        <div class="stats">
          <div class="stat-row">
            <span class="stat-label">Total Views</span>
            <span class="stat-value">${(stats.views ?? 0).toLocaleString()}</span>
          </div>
          <div class="stat-row">
            <span class="stat-label">Clicks</span>
            <span class="stat-value">${(stats.clicks ?? 0).toLocaleString()}</span>
          </div>
          <div class="stat-row">
            <span class="stat-label">Conversions</span>
            <span class="stat-value">${(stats.conversions ?? 0).toLocaleString()}</span>
          </div>
          <div class="stat-row">
            <span class="stat-label">Revenue</span>
            <span class="stat-value">$${(stats.revenue ?? 0).toLocaleString()}</span>
          </div>
          <div class="stat-row">
            <span class="stat-label">Click Rate</span>
            <span class="stat-value">${(stats.clickRate * 100).toFixed(2)}%</span>
          </div>
          <div class="stat-row">
            <span class="stat-label">Conversion Rate</span>
            <span class="stat-value">${(stats.conversionRate * 100).toFixed(2)}%</span>
          </div>
        </div>
      </div>
    </body>
    </html>
  `
}

export class SesEmailProvider implements EmailProvider {
  private client: SESv2Client

  constructor() {
    const region = process.env.AWS_REGION || process.env.AWS_DEFAULT_REGION || 'us-east-1'
    const hasStaticCredentials =
      !!process.env.AWS_ACCESS_KEY_ID && !!process.env.AWS_SECRET_ACCESS_KEY

    this.client = new SESv2Client({
      region,
      ...(hasStaticCredentials
        ? {
            credentials: {
              accessKeyId: process.env.AWS_ACCESS_KEY_ID as string,
              secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY as string,
            },
          }
        : {}),
    })
  }

  async sendEmail(params: SendEmailParams): Promise<{ id: string }> {
    const command = new SendEmailCommand({
      FromEmailAddress: params.from.email || defaultFromEmail,
      Destination: {
        ToAddresses: [params.to.email],
      },
      Content: {
        Simple: {
          Subject: {
            Data: params.subject,
            Charset: 'UTF-8',
          },
          Body: {
            Html: {
              Data: params.html,
              Charset: 'UTF-8',
            },
            Text: {
              Data: params.text || htmlToText(params.html),
              Charset: 'UTF-8',
            },
          },
        },
      },
      ConfigurationSetName: sesConfigurationSetName,
    })

    const result = await this.client.send(command)
    return { id: result.MessageId || generateId('ses_message') }
  }

  async saveTemplate(template: EmailTemplate): Promise<EmailTemplate> {
    const id = template.id || generateId('tmpl')
    const stored: EmailTemplate = { ...template, id }
    templateStore.set(id, stored)
    return stored
  }

  async getTemplates(): Promise<EmailTemplate[]> {
    return Array.from(templateStore.values())
  }

  async createCampaign(campaign: EmailCampaign): Promise<{ id: string; status?: string }> {
    const campaignId = campaign.id || generateId('cmp')
    const recipients = campaign.recipients || []
    const now = new Date()

    if (campaign.scheduledAt && campaign.scheduledAt > now) {
      return { id: campaignId, status: 'scheduled' }
    }

    for (const recipient of recipients) {
      await this.sendEmail({
        to: recipient,
        from: { email: campaign.fromEmail || defaultFromEmail, name: campaign.fromName || defaultFromName },
        subject: campaign.subject,
        html: campaign.template.html,
        text: campaign.template.text,
        trackClicks: true,
        trackOpens: true,
      })
    }

    return { id: campaignId, status: 'sent' }
  }

  async getCampaignStats(_campaignId: string): Promise<EmailStats> {
    return {
      sent: 0,
      delivered: 0,
      opened: 0,
      clicked: 0,
      bounced: 0,
      unsubscribed: 0,
      openRate: 0,
      clickRate: 0,
      conversionRate: 0,
    }
  }

  async createAutomation(sequence: AutomationSequence): Promise<AutomationSequence> {
    const id = sequence.id || generateId('auto')
    const stored = { ...sequence, id }
    automationStore.set(id, stored)
    return stored
  }

  async triggerAutomation(automationId: string, recipient: EmailRecipient): Promise<Record<string, any>> {
    const sequence = automationStore.get(automationId)

    if (!sequence) {
      throw new Error(`Automation not found: ${automationId}`)
    }

    const immediateEmails = sequence.emails.filter((emailStep) => emailStep.delay === 0)
    for (const emailStep of immediateEmails) {
      await this.sendEmail({
        to: recipient,
        from: { email: defaultFromEmail, name: defaultFromName },
        subject: emailStep.template.subject,
        html: emailStep.template.html,
        text: emailStep.template.text,
        trackClicks: true,
        trackOpens: true,
      })
    }

    return {
      automationId,
      triggered: true,
      immediateMessagesSent: immediateEmails.length,
      delayedMessagesQueued: sequence.emails.length - immediateEmails.length,
    }
  }

  async addSubscriber(params: AddSubscriberParams): Promise<Record<string, any>> {
    subscriberStore.set(params.email, params)
    return {
      id: generateId('sub'),
      email: params.email,
      listName: params.listName,
      tags: params.tags || [],
    }
  }

  async sendAnalyticsReport(params: SendAnalyticsReportParams): Promise<{ id: string }> {
    return this.sendEmail({
      to: { email: params.recipientEmail },
      from: { email: defaultFromEmail, name: defaultFromName },
      subject: 'Your Weekly Funnel Performance Report',
      html: buildReportHtml(params),
      trackOpens: true,
      trackClicks: true,
    })
  }

  async setupDefaultAutomations(): Promise<AutomationSequence[]> {
    const sequences: AutomationSequence[] = [
      {
        name: 'Welcome Sequence',
        trigger: 'signup',
        active: true,
        emails: [
          {
            delay: 0,
            template: {
              name: 'Welcome Email',
              subject: 'Welcome! Here is your launch plan',
              html: '<p>Welcome to Launchpad4Success. Your workspace is ready.</p>',
            },
          },
          {
            delay: 24,
            template: {
              name: 'Value Follow-up',
              subject: 'How to get your first wins this week',
              html: '<p>Here are your next steps to ship and improve your funnel.</p>',
            },
          },
        ],
      },
      {
        name: 'Abandoned Cart Recovery',
        trigger: 'abandoned_cart',
        active: true,
        emails: [
          {
            delay: 1,
            template: {
              name: 'Cart Reminder',
              subject: 'You left something behind',
              html: '<p>Your offer setup is almost complete. Come back and finish checkout.</p>',
            },
          },
        ],
      },
    ]

    const created: AutomationSequence[] = []
    for (const sequence of sequences) {
      created.push(await this.createAutomation(sequence))
    }
    return created
  }
}
