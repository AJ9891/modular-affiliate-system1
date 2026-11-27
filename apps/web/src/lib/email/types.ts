export interface EmailTemplate {
  id?: string
  name: string
  subject: string
  html: string
  text?: string
  preheader?: string
}

export interface EmailRecipient {
  email: string
  name?: string
  customFields?: Record<string, any>
}

export interface EmailCampaign {
  id?: string
  userId?: string | null
  name: string
  fromEmail: string
  fromName: string
  subject: string
  template: EmailTemplate
  recipients?: EmailRecipient[]
  scheduledAt?: Date
  status?: 'draft' | 'scheduled' | 'sending' | 'sent' | 'paused'
}

export interface AutomationSequence {
  id?: string
  userId?: string | null
  name: string
  trigger: 'signup' | 'purchase' | 'abandoned_cart' | 'funnel_entry' | 'custom'
  emails: Array<{
    delay: number
    template: EmailTemplate
  }>
  active: boolean
}

export interface AutomationTriggerContext {
  expectedUserId?: string
  expectedTrigger?: AutomationSequence['trigger']
  idempotencyKeyPrefix?: string
  metadata?: Record<string, unknown>
}

export interface EmailStats {
  sent: number
  delivered: number
  opened: number
  clicked: number
  bounced: number
  unsubscribed: number
  openRate: number
  clickRate: number
  conversionRate?: number
}

export interface AddSubscriberParams {
  userId?: string | null
  email: string
  name?: string
  listId?: string
  listName?: string
  customFields?: Record<string, any>
  tags?: string[]
  triggerAutomations?: boolean
}

export interface SendEmailParams {
  to: EmailRecipient
  userId?: string | null
  from: { email: string; name: string }
  subject: string
  html: string
  text?: string
  trackOpens?: boolean
  trackClicks?: boolean
  messageType?: 'marketing' | 'transactional'
  idempotencyKey?: string
  unsubscribeUrl?: string
}

export interface SendAnalyticsReportParams {
  recipientEmail: string
  funnelId: string
  stats: {
    views: number
    clicks: number
    conversions: number
    revenue: number
    clickRate: number
    conversionRate: number
  }
  dateRange: {
    start: Date
    end: Date
  }
}

export interface EmailProvider {
  sendEmail(params: SendEmailParams): Promise<{ id: string; status?: string }>
  saveTemplate(template: EmailTemplate): Promise<EmailTemplate>
  getTemplates(): Promise<EmailTemplate[]>
  createCampaign(campaign: EmailCampaign): Promise<{ id: string; status?: string }>
  getCampaignStats(campaignId: string): Promise<EmailStats>
  createAutomation(sequence: AutomationSequence): Promise<AutomationSequence>
  triggerAutomation(
    automationId: string,
    recipient: EmailRecipient,
    context?: AutomationTriggerContext
  ): Promise<Record<string, any>>
  addSubscriber(params: AddSubscriberParams): Promise<Record<string, any>>
  sendAnalyticsReport(params: SendAnalyticsReportParams): Promise<{ id: string }>
  setupDefaultAutomations(userId?: string | null): Promise<AutomationSequence[]>
}
