import { log } from '@/lib/log'
import { SesEmailProvider } from '@/lib/email/providers/ses'
import { createServiceRoleClient } from '@/lib/supabase-server'
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
const defaultQueueLimit = 50

const templateStore = new Map<string, EmailTemplate>()
const automationStore = new Map<string, AutomationSequence & { userId?: string | null }>()
const campaignStore = new Map<string, { campaign: EmailCampaign; stats: EmailStats }>()
const subscriberStore = new Map<string, AddSubscriberParams & { userId?: string | null }>()
const queuedJobs = new Map<
  string,
  {
    id: string
    userId: string | null
    automationId: string | null
    recipient: EmailRecipient
    params: SendEmailParams
    scheduledFor: string
    status: 'queued' | 'failed'
    attempts: number
    lastError?: string
  }
>()

function generateId(prefix: string): string {
  return `${prefix}_${crypto.randomUUID()}`
}

function htmlToText(html: string): string {
  return html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim()
}

function isUuid(value: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value)
}

function isSchemaError(issue: unknown): boolean {
  if (!issue || typeof issue !== 'object') return false
  const candidate = issue as { code?: string; message?: string }
  const code = candidate.code || ''
  const message = (candidate.message || '').toLowerCase()
  return (
    code === '42P01' ||
    code === 'PGRST205' ||
    code === '42703' ||
    message.includes('relation') ||
    message.includes('schema cache') ||
    message.includes('column')
  )
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

type QueueJobPayload = {
  userId: string | null
  automationId: string | null
  recipient: EmailRecipient
  params: SendEmailParams
  scheduledFor: string
  status?: 'queued' | 'sending' | 'sent' | 'failed'
  attempts?: number
  lastError?: string
  sentAt?: string | null
  metadata?: Record<string, unknown>
}

export class AutoresponderEmailProvider implements EmailProvider {
  private transport: SesEmailProvider

  constructor() {
    this.transport = new SesEmailProvider()
  }

  private getAdminClient() {
    try {
      return createServiceRoleClient()
    } catch {
      return null
    }
  }

  private async insertQueueJob(payload: QueueJobPayload) {
    const admin = this.getAdminClient()
    if (admin) {
      const insertPayload = {
        user_id: payload.userId,
        automation_id: payload.automationId,
        recipient_email: payload.recipient.email,
        recipient_name: payload.recipient.name || null,
        from_email: payload.params.from.email || defaultFromEmail,
        from_name: payload.params.from.name || defaultFromName,
        subject: payload.params.subject,
        html: payload.params.html,
        text: payload.params.text || htmlToText(payload.params.html),
        scheduled_for: payload.scheduledFor,
        status: payload.status || 'queued',
        attempts: payload.attempts ?? 0,
        last_error: payload.lastError || null,
        metadata: payload.metadata || {},
        sent_at: payload.sentAt || null,
        updated_at: new Date().toISOString(),
      }

      const { data, error } = await admin
        .from('email_autoresponder_jobs')
        .insert(insertPayload)
        .select('id')
        .single()

      if (!error && data?.id) {
        return data.id as string
      }

      if (error && !isSchemaError(error)) {
        throw new Error(error.message || 'Failed to queue autoresponder job')
      }
    }

    const id = generateId('queue')
    queuedJobs.set(id, {
      id,
      userId: payload.userId,
      automationId: payload.automationId,
      recipient: payload.recipient,
      params: payload.params,
      scheduledFor: payload.scheduledFor,
      status: payload.status === 'failed' ? 'failed' : 'queued',
      attempts: payload.attempts ?? 0,
      lastError: payload.lastError,
    })
    return id
  }

  private async tryImmediateSend(
    params: SendEmailParams,
    context: {
      userId: string | null
      automationId: string | null
      queueOnFailure: boolean
      metadata?: Record<string, unknown>
    }
  ): Promise<{ id: string; queued: boolean }> {
    try {
      const sent = await this.transport.sendEmail(params)

      await this.insertQueueJob({
        userId: context.userId,
        automationId: context.automationId,
        recipient: params.to,
        params,
        scheduledFor: new Date().toISOString(),
        status: 'sent',
        attempts: 1,
        sentAt: new Date().toISOString(),
        metadata: context.metadata,
      })

      return { id: sent.id, queued: false }
    } catch (error) {
      if (!context.queueOnFailure) {
        throw error
      }

      const queuedId = await this.insertQueueJob({
        userId: context.userId,
        automationId: context.automationId,
        recipient: params.to,
        params,
        scheduledFor: new Date().toISOString(),
        status: 'queued',
        attempts: 0,
        lastError: error instanceof Error ? error.message : 'Immediate send failed',
        metadata: context.metadata,
      })
      return { id: queuedId, queued: true }
    }
  }

  private parseAutomationEmails(config: unknown): Array<{ delay: number; template: EmailTemplate }> {
    if (!config || typeof config !== 'object') return []
    const emails = (config as { emails?: unknown }).emails
    if (!Array.isArray(emails)) return []

    const parsed: Array<{ delay: number; template: EmailTemplate } | null> = emails.map((entry) => {
        if (!entry || typeof entry !== 'object') return null
        const candidate = entry as { delay?: unknown; template?: unknown }
        const template = candidate.template as EmailTemplate | undefined
        if (!template || typeof template.subject !== 'string' || typeof template.html !== 'string') {
          return null
        }

        const normalizedTemplate: EmailTemplate = {
          id: template.id,
          name: template.name || 'Automation Email',
          subject: template.subject,
          html: template.html,
          text: template.text,
          preheader: template.preheader,
        }

        return {
          delay: Number(candidate.delay || 0),
          template: normalizedTemplate,
        }
      })

    return parsed.filter((entry): entry is { delay: number; template: EmailTemplate } => entry !== null)
  }

  private async triggerSequence(
    sequence: AutomationSequence & { userId?: string | null },
    recipient: EmailRecipient
  ): Promise<{ immediate: number; queued: number }> {
    let immediate = 0
    let queued = 0
    const now = Date.now()

    for (const step of sequence.emails) {
      const delayHours = Number(step.delay || 0)
      const runAt = new Date(now + Math.max(0, delayHours) * 60 * 60 * 1000).toISOString()

      const params: SendEmailParams = {
        to: recipient,
        from: { email: defaultFromEmail, name: defaultFromName },
        subject: step.template.subject,
        html: step.template.html,
        text: step.template.text,
        trackClicks: true,
        trackOpens: true,
      }

      if (delayHours <= 0) {
        await this.tryImmediateSend(params, {
          userId: sequence.userId || null,
          automationId: sequence.id || null,
          queueOnFailure: true,
          metadata: { trigger: sequence.trigger, automation_name: sequence.name, mode: 'immediate' },
        })
        immediate += 1
      } else {
        await this.insertQueueJob({
          userId: sequence.userId || null,
          automationId: sequence.id || null,
          recipient,
          params,
          scheduledFor: runAt,
          status: 'queued',
          attempts: 0,
          metadata: {
            trigger: sequence.trigger,
            automation_name: sequence.name,
            mode: 'delayed',
            delay_hours: delayHours,
          },
        })
        queued += 1
      }
    }

    return { immediate, queued }
  }

  private async getActiveSignupSequences(userId: string | null): Promise<Array<AutomationSequence & { userId?: string | null }>> {
    const admin = this.getAdminClient()
    if (admin) {
      let query = admin
        .from('email_automations')
        .select('id, user_id, name, trigger, config, active')
        .eq('active', true)
        .eq('trigger', 'signup')

      if (userId) {
        query = query.or(`user_id.eq.${userId},user_id.is.null`)
      } else {
        query = query.is('user_id', null)
      }

      const { data, error } = await query

      if (!error && Array.isArray(data)) {
        return data.map((row) => ({
          id: row.id,
          name: row.name,
          trigger: row.trigger,
          active: row.active,
          emails: this.parseAutomationEmails(row.config),
          userId: row.user_id,
        }))
      }

      if (error && !isSchemaError(error)) {
        throw new Error(error.message || 'Failed to load active automations')
      }
    }

    return Array.from(automationStore.values()).filter(
      (sequence) =>
        sequence.active &&
        sequence.trigger === 'signup' &&
        (!sequence.userId || sequence.userId === userId)
    )
  }

  async sendEmail(params: SendEmailParams): Promise<{ id: string }> {
    const result = await this.tryImmediateSend(params, {
      userId: null,
      automationId: null,
      queueOnFailure: true,
      metadata: { source: 'direct-send' },
    })
    return { id: result.id }
  }

  async saveTemplate(template: EmailTemplate): Promise<EmailTemplate> {
    const admin = this.getAdminClient()
    if (admin) {
      const content = {
        subject: template.subject,
        html: template.html,
        text: template.text || null,
        preheader: template.preheader || null,
      }

      if (template.id && isUuid(template.id)) {
        const { data, error } = await admin
          .from('templates')
          .update({
            name: template.name,
            type: 'email',
            content,
            updated_at: new Date().toISOString(),
          })
          .eq('id', template.id)
          .select('id, name, content')
          .single()

        if (!error && data) {
          return {
            id: data.id,
            name: data.name,
            subject: (data.content as { subject?: string }).subject || template.subject,
            html: (data.content as { html?: string }).html || template.html,
            text: (data.content as { text?: string }).text || template.text,
            preheader: (data.content as { preheader?: string }).preheader || template.preheader,
          }
        }

        if (error && !isSchemaError(error)) {
          throw new Error(error.message || 'Failed to update template')
        }
      }

      const { data, error } = await admin
        .from('templates')
        .insert({
          name: template.name,
          type: 'email',
          content,
          preview_url: null,
          updated_at: new Date().toISOString(),
        })
        .select('id, name, content')
        .single()

      if (!error && data) {
        return {
          id: data.id,
          name: data.name,
          subject: (data.content as { subject?: string }).subject || template.subject,
          html: (data.content as { html?: string }).html || template.html,
          text: (data.content as { text?: string }).text || template.text,
          preheader: (data.content as { preheader?: string }).preheader || template.preheader,
        }
      }

      if (error && !isSchemaError(error)) {
        throw new Error(error.message || 'Failed to save template')
      }
    }

    const id = template.id || generateId('tmpl')
    const stored = { ...template, id }
    templateStore.set(id, stored)
    return stored
  }

  async getTemplates(): Promise<EmailTemplate[]> {
    const admin = this.getAdminClient()
    if (admin) {
      const { data, error } = await admin
        .from('templates')
        .select('id, name, content')
        .eq('type', 'email')
        .order('updated_at', { ascending: false })
        .limit(100)

      if (!error && Array.isArray(data)) {
        return data.map((row) => {
          const content = (row.content || {}) as {
            subject?: string
            html?: string
            text?: string
            preheader?: string
          }
          return {
            id: row.id,
            name: row.name,
            subject: content.subject || '',
            html: content.html || '',
            text: content.text,
            preheader: content.preheader,
          }
        })
      }

      if (error && !isSchemaError(error)) {
        throw new Error(error.message || 'Failed to load email templates')
      }
    }

    return Array.from(templateStore.values())
  }

  async createCampaign(campaign: EmailCampaign): Promise<{ id: string; status?: string }> {
    const campaignId = campaign.id || generateId('cmp')
    const recipients = campaign.recipients || []
    const now = new Date()
    const scheduled = !!(campaign.scheduledAt && campaign.scheduledAt > now)
    const status: EmailCampaign['status'] = scheduled
      ? 'scheduled'
      : recipients.length > 0
        ? 'sending'
        : 'draft'

    const stats: EmailStats = {
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

    const admin = this.getAdminClient()
    if (admin) {
      const { error } = await admin.from('email_campaigns').insert({
        provider_campaign_id: campaignId,
        user_id: campaign.userId || null,
        name: campaign.name,
        subject: campaign.subject,
        status,
        scheduled_at: campaign.scheduledAt?.toISOString() || null,
        stats,
        updated_at: new Date().toISOString(),
      })

      if (error && !isSchemaError(error)) {
        throw new Error(error.message || 'Failed to create campaign')
      }
    }

    campaignStore.set(campaignId, { campaign, stats })

    if (!scheduled && recipients.length > 0) {
      let delivered = 0
      for (const recipient of recipients) {
        await this.tryImmediateSend(
          {
            to: recipient,
            from: { email: campaign.fromEmail || defaultFromEmail, name: campaign.fromName || defaultFromName },
            subject: campaign.subject,
            html: campaign.template.html,
            text: campaign.template.text,
            trackClicks: true,
            trackOpens: true,
          },
          {
            userId: campaign.userId || null,
            automationId: null,
            queueOnFailure: true,
            metadata: { source: 'campaign', campaign_id: campaignId },
          }
        )
        delivered += 1
      }

      const finalStats: EmailStats = {
        ...stats,
        sent: delivered,
        delivered,
      }

      campaignStore.set(campaignId, { campaign, stats: finalStats })

      if (admin) {
        const { error } = await admin
          .from('email_campaigns')
          .update({
            status: 'sent',
            sent_at: new Date().toISOString(),
            stats: finalStats,
            updated_at: new Date().toISOString(),
          })
          .eq('provider_campaign_id', campaignId)

        if (error && !isSchemaError(error)) {
          throw new Error(error.message || 'Failed to finalize campaign status')
        }
      }

      return { id: campaignId, status: 'sent' }
    }

    return { id: campaignId, status }
  }

  async getCampaignStats(campaignId: string): Promise<EmailStats> {
    const admin = this.getAdminClient()
    if (admin) {
      const { data, error } = await admin
        .from('email_campaigns')
        .select('stats')
        .eq('provider_campaign_id', campaignId)
        .single()

      if (!error && data?.stats) {
        const stats = data.stats as Partial<EmailStats>
        return {
          sent: Number(stats.sent || 0),
          delivered: Number(stats.delivered || 0),
          opened: Number(stats.opened || 0),
          clicked: Number(stats.clicked || 0),
          bounced: Number(stats.bounced || 0),
          unsubscribed: Number(stats.unsubscribed || 0),
          openRate: Number(stats.openRate || 0),
          clickRate: Number(stats.clickRate || 0),
          conversionRate: Number(stats.conversionRate || 0),
        }
      }

      if (error && !isSchemaError(error)) {
        throw new Error(error.message || 'Failed to load campaign stats')
      }
    }

    const fallback = campaignStore.get(campaignId)?.stats
    if (fallback) return fallback

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
    const userId = sequence.userId || null
    const emails = sequence.emails || []
    const config = { emails }
    const id = sequence.id || generateId('auto')

    const admin = this.getAdminClient()
    if (admin) {
      const payload = {
        id: isUuid(id) ? id : undefined,
        user_id: userId,
        name: sequence.name,
        trigger: sequence.trigger,
        config,
        active: sequence.active,
        updated_at: new Date().toISOString(),
      }

      const { data, error } = await admin
        .from('email_automations')
        .insert(payload)
        .select('id')
        .single()

      if (!error && data?.id) {
        const stored = { ...sequence, id: data.id }
        automationStore.set(data.id, { ...stored, userId })
        return stored
      }

      if (error && !isSchemaError(error)) {
        throw new Error(error.message || 'Failed to create automation')
      }
    }

    const stored = { ...sequence, id }
    automationStore.set(id, { ...stored, userId })
    return stored
  }

  async triggerAutomation(automationId: string, recipient: EmailRecipient): Promise<Record<string, any>> {
    let sequence: (AutomationSequence & { userId?: string | null }) | null = null

    const admin = this.getAdminClient()
    if (admin) {
      const { data, error } = await admin
        .from('email_automations')
        .select('id, user_id, name, trigger, config, active')
        .eq('id', automationId)
        .single()

      if (!error && data) {
        sequence = {
          id: data.id,
          name: data.name,
          trigger: data.trigger,
          active: data.active,
          emails: this.parseAutomationEmails(data.config),
          userId: data.user_id,
        }
      } else if (error && !isSchemaError(error)) {
        throw new Error(error.message || 'Failed to load automation')
      }
    }

    if (!sequence) {
      sequence = automationStore.get(automationId) || null
    }

    if (!sequence) {
      throw new Error(`Automation not found: ${automationId}`)
    }

    if (!sequence.active) {
      return {
        automationId,
        triggered: false,
        immediateMessagesSent: 0,
        delayedMessagesQueued: 0,
        reason: 'Automation is inactive',
      }
    }

    const { immediate, queued } = await this.triggerSequence(sequence, recipient)
    return {
      automationId,
      triggered: true,
      immediateMessagesSent: immediate,
      delayedMessagesQueued: queued,
    }
  }

  async addSubscriber(params: AddSubscriberParams): Promise<Record<string, any>> {
    const userId =
      params.userId ||
      (params.customFields && typeof params.customFields.user_id === 'string'
        ? params.customFields.user_id
        : null)
    const listName = params.listName || params.listId || 'Launchpad List'
    const tags = Array.isArray(params.tags) ? params.tags : []

    const admin = this.getAdminClient()
    if (admin) {
      const { error } = await admin.from('email_subscribers').upsert(
        {
          user_id: userId,
          email: params.email,
          name: params.name || null,
          list_name: listName,
          tags,
          custom_fields: params.customFields || {},
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'user_id,email,list_name' }
      )

      if (error && !isSchemaError(error)) {
        throw new Error(error.message || 'Failed to save subscriber')
      }
    }

    subscriberStore.set(`${userId || 'global'}:${params.email}:${listName}`, { ...params, userId })

    const sequences = await this.getActiveSignupSequences(userId)
    let queuedAutomationJobs = 0
    let immediateSends = 0

    for (const sequence of sequences) {
      const result = await this.triggerSequence(sequence, {
        email: params.email,
        name: params.name,
        customFields: params.customFields,
      })
      immediateSends += result.immediate
      queuedAutomationJobs += result.queued
    }

    return {
      id: generateId('sub'),
      email: params.email,
      listName,
      tags,
      automationsTriggered: sequences.length,
      immediateMessagesSent: immediateSends,
      delayedMessagesQueued: queuedAutomationJobs,
    }
  }

  async sendAnalyticsReport(params: SendAnalyticsReportParams): Promise<{ id: string }> {
    const html = buildReportHtml(params)
    return this.sendEmail({
      to: { email: params.recipientEmail },
      from: { email: defaultFromEmail, name: defaultFromName },
      subject: 'Your Weekly Funnel Performance Report',
      html,
      text: htmlToText(html),
      trackClicks: true,
      trackOpens: true,
    })
  }

  async setupDefaultAutomations(userId?: string | null): Promise<AutomationSequence[]> {
    const sequences: AutomationSequence[] = [
      {
        userId: userId || null,
        name: 'Welcome Sequence',
        trigger: 'signup',
        active: true,
        emails: [
          {
            delay: 0,
            template: {
              name: 'Welcome Email',
              subject: 'Welcome! Your launch plan is ready',
              html: '<p>Welcome to Launchpad4Success. Your workspace is ready.</p>',
            },
          },
          {
            delay: 24,
            template: {
              name: 'Launch Follow-up',
              subject: 'How to get your first funnel live this week',
              html: '<p>Here is a simple 3-step launch checklist to ship quickly.</p>',
            },
          },
        ],
      },
      {
        userId: userId || null,
        name: 'Abandoned Cart Recovery',
        trigger: 'abandoned_cart',
        active: true,
        emails: [
          {
            delay: 1,
            template: {
              name: 'Cart Reminder',
              subject: 'Your setup is almost complete',
              html: '<p>You are one step away from finishing checkout. Resume when ready.</p>',
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

  async runDueJobs(limit = defaultQueueLimit) {
    const resolvedLimit = Number.isFinite(limit) && limit > 0 ? Math.floor(limit) : defaultQueueLimit
    let sent = 0
    let failed = 0
    let processed = 0

    const admin = this.getAdminClient()
    if (admin) {
      const { data, error } = await admin
        .from('email_autoresponder_jobs')
        .select(
          'id, user_id, automation_id, recipient_email, recipient_name, from_email, from_name, subject, html, text, scheduled_for, status, attempts, metadata'
        )
        .eq('status', 'queued')
        .lte('scheduled_for', new Date().toISOString())
        .order('scheduled_for', { ascending: true })
        .limit(resolvedLimit)

      if (!error && Array.isArray(data)) {
        for (const job of data) {
          processed += 1

          const params: SendEmailParams = {
            to: { email: job.recipient_email, name: job.recipient_name || undefined },
            from: {
              email: job.from_email || defaultFromEmail,
              name: job.from_name || defaultFromName,
            },
            subject: job.subject,
            html: job.html,
            text: job.text || undefined,
            trackClicks: true,
            trackOpens: true,
          }

          const attempts = Number(job.attempts || 0) + 1
          await admin
            .from('email_autoresponder_jobs')
            .update({ status: 'sending', attempts, updated_at: new Date().toISOString() })
            .eq('id', job.id)

          try {
            await this.tryImmediateSend(params, {
              userId: job.user_id || null,
              automationId: job.automation_id || null,
              queueOnFailure: false,
              metadata: {
                ...(job.metadata || {}),
                queue_job_id: job.id,
                source: 'queue-runner',
              },
            })

            await admin
              .from('email_autoresponder_jobs')
              .update({
                status: 'sent',
                sent_at: new Date().toISOString(),
                last_error: null,
                updated_at: new Date().toISOString(),
              })
              .eq('id', job.id)
            sent += 1
          } catch (sendError) {
            const lastError =
              sendError instanceof Error ? sendError.message : 'Failed to send autoresponder job'
            await admin
              .from('email_autoresponder_jobs')
              .update({
                status: 'failed',
                last_error: lastError,
                updated_at: new Date().toISOString(),
              })
              .eq('id', job.id)
            failed += 1
          }
        }

        return { processed, sent, failed }
      }

      if (error && !isSchemaError(error)) {
        throw new Error(error.message || 'Failed to load queued autoresponder jobs')
      }
    }

    const dueJobs = Array.from(queuedJobs.values())
      .filter((job) => job.status === 'queued' && Date.parse(job.scheduledFor) <= Date.now())
      .slice(0, resolvedLimit)

    for (const job of dueJobs) {
      processed += 1
      try {
        await this.tryImmediateSend(job.params, {
          userId: job.userId,
          automationId: job.automationId,
          queueOnFailure: false,
          metadata: { source: 'queue-runner-memory', queue_job_id: job.id },
        })
        queuedJobs.delete(job.id)
        sent += 1
      } catch (sendError) {
        job.status = 'failed'
        job.attempts += 1
        job.lastError = sendError instanceof Error ? sendError.message : 'Failed to send autoresponder job'
        queuedJobs.set(job.id, job)
        failed += 1
      }
    }

    return { processed, sent, failed }
  }
}

export async function runAutoresponderQueue(limit?: number) {
  const provider = new AutoresponderEmailProvider()
  const result = await provider.runDueJobs(limit ?? defaultQueueLimit)
  log.info('Autoresponder queue run completed', result)
  return result
}
