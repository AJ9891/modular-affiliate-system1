import { log } from '@/lib/log'
import { SesEmailProvider } from '@/lib/email/providers/ses'
import { createServiceRoleClient } from '@/lib/supabase-server'
import type { SupabaseClient } from '@supabase/supabase-js'
import { getEmailRetryDelayMs, isTransientEmailFailure, MAX_EMAIL_ATTEMPTS } from '@/lib/email/reliability'
import { createUnsubscribeUrl } from '@/lib/email/unsubscribe'
import type {
  AddSubscriberParams,
  AutomationSequence,
  AutomationTriggerContext,
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
const subscriberStore = new Map<
  string,
  AddSubscriberParams & { userId?: string | null; status: 'active' | 'unsubscribed' | 'bounced' }
>()
const queuedJobs = new Map<string, {
  id: string
  idempotencyKey: string
  userId: string | null
  automationId: string | null
  recipient: EmailRecipient
  params: SendEmailParams
  scheduledFor: string
  status: 'queued' | 'sending' | 'sent' | 'failed' | 'cancelled'
  attempts: number
  maxAttempts: number
  lastError?: string
  metadata: Record<string, unknown>
}>()

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
  idempotencyKey: string
  userId: string | null
  automationId: string | null
  recipient: EmailRecipient
  params: SendEmailParams
  scheduledFor: string
  status?: 'queued'
  lastError?: string
  metadata?: Record<string, unknown>
}

type EmailTransport = Pick<EmailProvider, 'sendEmail'>

export class AutoresponderEmailProvider implements EmailProvider {
  constructor(
    private readonly transport: EmailTransport = new SesEmailProvider(),
    private readonly clientFactory: () => SupabaseClient | null = () => createServiceRoleClient()
  ) {}

  private getAdminClient() {
    return this.clientFactory()
  }

  private async insertQueueJob(payload: QueueJobPayload) {
    const admin = this.getAdminClient()
    if (admin) {
      const insertPayload = {
        user_id: payload.userId,
        automation_id: payload.automationId,
        idempotency_key: payload.idempotencyKey,
        message_type: payload.params.messageType || 'marketing',
        max_attempts: MAX_EMAIL_ATTEMPTS,
        recipient_email: payload.recipient.email,
        recipient_name: payload.recipient.name || null,
        from_email: payload.params.from.email || defaultFromEmail,
        from_name: payload.params.from.name || defaultFromName,
        subject: payload.params.subject,
        html: payload.params.html,
        text: payload.params.text || htmlToText(payload.params.html),
        scheduled_for: payload.scheduledFor,
        status: 'queued',
        attempts: 0,
        last_error: payload.lastError || null,
        metadata: payload.metadata || {},
        updated_at: new Date().toISOString(),
      }

      const { data, error } = await admin
        .from('email_autoresponder_jobs')
        .upsert(insertPayload, { onConflict: 'idempotency_key', ignoreDuplicates: true })
        .select('id')
        .maybeSingle()

      if (!error && data?.id) {
        return data.id as string
      }

      if (error) {
        throw new Error(error.message || 'Failed to queue autoresponder job')
      }

      const { data: existing, error: lookupError } = await admin
        .from('email_autoresponder_jobs')
        .select('id')
        .eq('idempotency_key', payload.idempotencyKey)
        .single()
      if (lookupError || !existing?.id) {
        throw new Error(lookupError?.message || 'Unable to resolve idempotent email job')
      }
      return existing.id as string
    }

    const existing = Array.from(queuedJobs.values()).find(
      (job) => job.idempotencyKey === payload.idempotencyKey
    )
    if (existing) return existing.id

    const id = generateId('queue')
    queuedJobs.set(id, {
      id,
      idempotencyKey: payload.idempotencyKey,
      userId: payload.userId,
      automationId: payload.automationId,
      recipient: payload.recipient,
      params: payload.params,
      scheduledFor: payload.scheduledFor,
      status: 'queued',
      attempts: 0,
      maxAttempts: MAX_EMAIL_ATTEMPTS,
      lastError: payload.lastError,
      metadata: payload.metadata || {},
    })
    return id
  }

  private async enqueueEmail(
    params: SendEmailParams,
    context: {
      automationId?: string | null
      scheduledFor?: string
      idempotencyKey?: string
      metadata?: Record<string, unknown>
    } = {}
  ): Promise<string> {
    const normalizedParams: SendEmailParams = {
      ...params,
      to: { ...params.to, email: params.to.email.trim().toLowerCase() },
      userId: params.userId || null,
      messageType: params.messageType || 'marketing',
    }

    return this.insertQueueJob({
      idempotencyKey: context.idempotencyKey || params.idempotencyKey || generateId('email'),
      userId: normalizedParams.userId || null,
      automationId: context.automationId || null,
      recipient: normalizedParams.to,
      params: normalizedParams,
      scheduledFor: context.scheduledFor || new Date().toISOString(),
      metadata: context.metadata,
    })
  }

  private async isSuppressed(userId: string | null, email: string): Promise<boolean> {
    const admin = this.getAdminClient()
    if (admin) {
      const { data: suppression, error: suppressionError } = await admin
        .from('email_suppressions')
        .select('id')
        .eq('tenant_scope', userId || 'global')
        .eq('email', email.trim().toLowerCase())
        .maybeSingle()
      if (suppressionError) throw new Error(suppressionError.message || 'Failed to check email suppression')
      if (suppression) return true

      let query = admin
        .from('email_subscribers')
        .select('id')
        .ilike('email', email)
        .in('status', ['unsubscribed', 'bounced'])

      query = userId ? query.eq('user_id', userId) : query.is('user_id', null)
      const { data, error } = await query.limit(1)
      if (error) throw new Error(error.message || 'Failed to check email suppression')
      return Boolean(data?.length)
    }

    return Array.from(subscriberStore.values()).some(
      (subscriber) =>
        subscriber.userId === userId &&
        subscriber.email.trim().toLowerCase() === email.trim().toLowerCase() &&
        (subscriber.status === 'unsubscribed' || subscriber.status === 'bounced')
    )
  }

  private async addUnsubscribeDetails(params: SendEmailParams): Promise<SendEmailParams> {
    if (params.messageType === 'transactional') return params

    const unsubscribeUrl = createUnsubscribeUrl({
      email: params.to.email,
      userId: params.userId || null,
    })
    return {
      ...params,
      unsubscribeUrl,
      html: `${params.html}<p><a href="${unsubscribeUrl}">Unsubscribe from marketing emails</a></p>`,
      text: `${params.text || htmlToText(params.html)}\n\nUnsubscribe: ${unsubscribeUrl}`,
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
    recipient: EmailRecipient,
    context: {
      idempotencyKeyPrefix?: string
      metadata?: Record<string, unknown>
    } = {}
  ): Promise<{ immediate: number; queued: number }> {
    let immediate = 0
    let queued = 0
    const now = Date.now()

    for (const [stepIndex, step] of sequence.emails.entries()) {
      const delayHours = Number(step.delay || 0)
      const runAt = new Date(now + Math.max(0, delayHours) * 60 * 60 * 1000).toISOString()
      const idempotencyKey = `${context.idempotencyKeyPrefix || `automation:${sequence.id}:${recipient.email.toLowerCase()}`}:${stepIndex}`
      const metadata = {
        ...context.metadata,
        trigger: sequence.trigger,
        automation_name: sequence.name,
        sequence_step: stepIndex,
        mode: delayHours <= 0 ? 'immediate' : 'delayed',
        ...(delayHours > 0 ? { delay_hours: delayHours } : {}),
      }

      const params: SendEmailParams = {
        to: recipient,
        userId: sequence.userId || null,
        from: { email: defaultFromEmail, name: defaultFromName },
        subject: step.template.subject,
        html: step.template.html,
        text: step.template.text,
        trackClicks: true,
        trackOpens: true,
        messageType: 'marketing',
        idempotencyKey,
      }

      if (delayHours <= 0) {
        await this.enqueueEmail(params, {
          automationId: sequence.id || null,
          idempotencyKey,
          metadata,
        })
        immediate += 1
      } else {
        await this.enqueueEmail(params, {
          automationId: sequence.id || null,
          scheduledFor: runAt,
          idempotencyKey,
          metadata,
        })
        queued += 1
      }
    }

    if (immediate > 0) await this.runDueJobs(immediate)
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

  async sendEmail(params: SendEmailParams): Promise<{ id: string; status?: string }> {
    const id = await this.enqueueEmail(params, {
      metadata: { source: 'direct-send' },
    })
    await this.runDueJobs(1, id)
    const admin = this.getAdminClient()
    if (admin) {
      const { data, error } = await admin
        .from('email_autoresponder_jobs')
        .select('status')
        .eq('id', id)
        .single()
      if (error) throw new Error(error.message || 'Failed to load email job status')
      if (data.status === 'failed') throw new Error('Email delivery failed permanently')
      return { id, status: data.status }
    }

    const status = queuedJobs.get(id)?.status
    if (status === 'failed') throw new Error('Email delivery failed permanently')
    return { id, status }
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
        sendshark_id: campaignId,
        provider_campaign_id: campaignId,
        user_id: campaign.userId || null,
        name: campaign.name,
        subject: campaign.subject,
        status,
        scheduled_at: campaign.scheduledAt?.toISOString() || null,
        stats,
        updated_at: new Date().toISOString(),
      })

      if (error) {
        throw new Error(error.message || 'Failed to create campaign')
      }
    }

    campaignStore.set(campaignId, { campaign, stats })

    for (const [recipientIndex, recipient] of recipients.entries()) {
      const email = recipient.email.trim().toLowerCase()
      const idempotencyKey = `campaign:${campaignId}:${email}`
      await this.enqueueEmail(
        {
          to: { ...recipient, email },
          userId: campaign.userId || null,
          from: { email: campaign.fromEmail || defaultFromEmail, name: campaign.fromName || defaultFromName },
          subject: campaign.subject,
          html: campaign.template.html,
          text: campaign.template.text,
          trackClicks: true,
          trackOpens: true,
          messageType: 'marketing',
          idempotencyKey,
        },
        {
          idempotencyKey,
          scheduledFor: scheduled
            ? campaign.scheduledAt!.toISOString()
            : now.toISOString(),
          metadata: {
            source: 'campaign',
            campaign_id: campaignId,
            recipient_index: recipientIndex,
          },
        }
      )
    }

    if (!scheduled && recipients.length > 0) {
      await this.runDueJobs(Math.min(Math.max(recipients.length, defaultQueueLimit), 200))
      if (admin) {
        const finalStatus = await this.refreshCampaignStatus(admin, campaignId)
        return { id: campaignId, status: finalStatus }
      }

      const campaignJobs = Array.from(queuedJobs.values()).filter(
        (job) => job.metadata.campaign_id === campaignId
      )
      const finalStatus = campaignJobs.some((job) => job.status === 'queued' || job.status === 'sending')
        ? 'sending'
        : campaignJobs.some((job) => job.status === 'failed')
          ? 'paused'
          : 'sent'
      return { id: campaignId, status: finalStatus }
    }

    return { id: campaignId, status: scheduled ? 'scheduled' : status }
  }

  private async refreshCampaignStatus(admin: SupabaseClient, campaignId: string): Promise<string> {
    const { data: jobs, error: jobsError } = await admin
      .from('email_autoresponder_jobs')
      .select('status')
      .contains('metadata', { campaign_id: campaignId })

    if (jobsError) throw new Error(jobsError.message || 'Failed to refresh campaign status')

    const statuses = (jobs || []).map((job) => job.status as string)
    const sentCount = statuses.filter((jobStatus) => jobStatus === 'sent').length
    const nextStatus = statuses.some((jobStatus) => jobStatus === 'queued' || jobStatus === 'sending')
      ? 'sending'
      : statuses.some((jobStatus) => jobStatus === 'failed')
        ? 'paused'
        : 'sent'

    const { data: campaignRow, error: campaignReadError } = await admin
      .from('email_campaigns')
      .select('stats')
      .eq('provider_campaign_id', campaignId)
      .single()
    if (campaignReadError) throw new Error(campaignReadError.message || 'Failed to load campaign stats')

    const currentStats = (campaignRow?.stats || {}) as Partial<EmailStats>
    const { error } = await admin
      .from('email_campaigns')
      .update({
        status: nextStatus,
        sent_at: nextStatus === 'sent' ? new Date().toISOString() : null,
        stats: { ...currentStats, sent: sentCount, delivered: sentCount },
        updated_at: new Date().toISOString(),
      })
      .eq('provider_campaign_id', campaignId)

    if (error) throw new Error(error.message || 'Failed to update campaign status')
    return nextStatus
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

  async triggerAutomation(
    automationId: string,
    recipient: EmailRecipient,
    context: AutomationTriggerContext = {}
  ): Promise<Record<string, any>> {
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

    if (context.expectedUserId && sequence.userId !== context.expectedUserId) {
      throw new Error('Automation does not belong to the requested tenant')
    }
    if (context.expectedTrigger && sequence.trigger !== context.expectedTrigger) {
      throw new Error('Automation trigger does not match the requested event')
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

    const { immediate, queued } = await this.triggerSequence(sequence, recipient, {
      idempotencyKeyPrefix: context.idempotencyKeyPrefix,
      metadata: context.metadata,
    })
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
    const email = params.email.trim().toLowerCase()
    let status: 'active' | 'unsubscribed' | 'bounced' = 'active'

    const admin = this.getAdminClient()
    if (admin) {
      let existingQuery = admin
        .from('email_subscribers')
        .select('status')
        .ilike('email', email)
        .eq('list_name', listName)
      existingQuery = userId ? existingQuery.eq('user_id', userId) : existingQuery.is('user_id', null)
      const { data: existing, error: existingError } = await existingQuery.maybeSingle()
      if (existingError) throw new Error(existingError.message || 'Failed to load subscriber status')
      if (existing?.status === 'unsubscribed' || existing?.status === 'bounced') {
        status = existing.status
      }

      const { data, error } = await admin.from('email_subscribers').upsert(
        {
          user_id: userId,
          email,
          name: params.name || null,
          list_name: listName,
          tags,
          custom_fields: params.customFields || {},
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'user_id,email,list_name' }
      ).select('status').single()

      if (error) {
        throw new Error(error.message || 'Failed to save subscriber')
      }
      if (data?.status === 'unsubscribed' || data?.status === 'bounced') {
        status = data.status
      }
    }

    subscriberStore.set(`${userId || 'global'}:${email}:${listName}`, {
      ...params,
      email,
      userId,
      status,
    })

    const sequences = params.triggerAutomations === false
      ? []
      : await this.getActiveSignupSequences(userId)
    let queuedAutomationJobs = 0
    let immediateSends = 0

    for (const sequence of sequences) {
      const result = await this.triggerSequence(sequence, {
        email,
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

  async runDueJobs(limit = defaultQueueLimit, jobId?: string) {
    const resolvedLimit = Number.isFinite(limit) && limit > 0 ? Math.floor(limit) : defaultQueueLimit
    let sent = 0
    let failed = 0
    let processed = 0

    const admin = this.getAdminClient()
    if (admin) {
      const { data, error } = await admin.rpc('claim_due_email_autoresponder_jobs', {
        p_limit: resolvedLimit,
        p_job_id: jobId || null,
      })
      if (error) {
        throw new Error(error.message || 'Failed to claim queued autoresponder jobs')
      }

      const campaignIds = new Set<string>()
      for (const job of data || []) {
        processed += 1
        const userId = job.user_id || null
        const messageType = job.message_type === 'transactional' ? 'transactional' : 'marketing'
        const campaignId = (job.metadata as Record<string, unknown> | null)?.campaign_id
        if (typeof campaignId === 'string') campaignIds.add(campaignId)

        if (messageType === 'marketing' && await this.isSuppressed(userId, job.recipient_email)) {
          const { error: suppressionError } = await admin
            .from('email_autoresponder_jobs')
            .update({
              status: 'cancelled',
              last_error: 'Recipient unsubscribed or bounced before delivery',
              updated_at: new Date().toISOString(),
            })
            .eq('id', job.id)
          if (suppressionError) throw new Error(suppressionError.message || 'Failed to cancel suppressed email')
          continue
        }

        const params: SendEmailParams = {
          to: { email: job.recipient_email, name: job.recipient_name || undefined },
          userId,
          from: {
            email: job.from_email || defaultFromEmail,
            name: job.from_name || defaultFromName,
          },
          subject: job.subject,
          html: job.html,
          text: job.text || undefined,
          trackClicks: true,
          trackOpens: true,
          messageType,
        }

        let deliveryError: unknown
        try {
          await this.transport.sendEmail(await this.addUnsubscribeDetails(params))
        } catch (error) {
          deliveryError = error
        }

        if (deliveryError) {
          const attempts = Number(job.attempts || 0)
          const maxAttempts = Number(job.max_attempts || MAX_EMAIL_ATTEMPTS)
          const retry = isTransientEmailFailure(deliveryError) && attempts < maxAttempts
          const message = deliveryError instanceof Error ? deliveryError.message : 'Email delivery failed'
          const { error: updateError } = await admin
            .from('email_autoresponder_jobs')
            .update({
              status: retry ? 'queued' : 'failed',
              scheduled_for: retry
                ? new Date(Date.now() + getEmailRetryDelayMs(attempts)).toISOString()
                : job.scheduled_for,
              last_error: message.slice(0, 1000),
              updated_at: new Date().toISOString(),
            })
            .eq('id', job.id)
          if (updateError) throw new Error(updateError.message || 'Failed to record email delivery failure')
          failed += 1
        } else {
          const { error: updateError } = await admin
            .from('email_autoresponder_jobs')
            .update({
              status: 'sent',
              sent_at: new Date().toISOString(),
              last_error: null,
              updated_at: new Date().toISOString(),
            })
            .eq('id', job.id)
          if (updateError) throw new Error(updateError.message || 'Failed to finalize email delivery')
          sent += 1
        }

      }

      for (const campaignId of campaignIds) {
        await this.refreshCampaignStatus(admin, campaignId)
      }
      return { processed, sent, failed }
    }

    const dueJobs = Array.from(queuedJobs.values())
      .filter(
        (job) =>
          job.status === 'queued' &&
          Date.parse(job.scheduledFor) <= Date.now() &&
          (!jobId || job.id === jobId)
      )
      .slice(0, resolvedLimit)

    for (const job of dueJobs) {
      job.status = 'sending'
      job.attempts += 1
    }

    for (const job of dueJobs) {
      processed += 1
      if (
        (job.params.messageType || 'marketing') === 'marketing' &&
        await this.isSuppressed(job.userId, job.recipient.email)
      ) {
        job.status = 'cancelled'
        job.lastError = 'Recipient unsubscribed or bounced before delivery'
        continue
      }

      try {
        await this.transport.sendEmail(await this.addUnsubscribeDetails(job.params))
        job.status = 'sent'
        job.lastError = undefined
        sent += 1
      } catch (sendError) {
        job.lastError = sendError instanceof Error ? sendError.message : 'Failed to send autoresponder job'
        job.status =
          isTransientEmailFailure(sendError) && job.attempts < job.maxAttempts
            ? 'queued'
            : 'failed'
        if (job.status === 'queued') {
          job.scheduledFor = new Date(Date.now() + getEmailRetryDelayMs(job.attempts)).toISOString()
        }
        failed += 1
      }
      queuedJobs.set(job.id, job)
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
