import { sendshark } from '@/lib/sendshark'
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

export class SendsharkEmailProvider implements EmailProvider {
  async sendEmail(params: SendEmailParams): Promise<{ id: string }> {
    const result = await sendshark.sendEmail(params)
    return { id: String((result as { id?: string })?.id || crypto.randomUUID()) }
  }

  async saveTemplate(template: EmailTemplate): Promise<EmailTemplate> {
    const result = await sendshark.saveTemplate(template)
    return result as EmailTemplate
  }

  async getTemplates(): Promise<EmailTemplate[]> {
    return (await sendshark.getTemplates()) as EmailTemplate[]
  }

  async createCampaign(campaign: EmailCampaign): Promise<{ id: string; status?: string }> {
    const result = await sendshark.createCampaign(campaign)
    return {
      id: String((result as { id?: string })?.id || crypto.randomUUID()),
      status: (result as { status?: string })?.status,
    }
  }

  async getCampaignStats(campaignId: string): Promise<EmailStats> {
    return (await sendshark.getCampaignStats(campaignId)) as EmailStats
  }

  async createAutomation(sequence: AutomationSequence): Promise<AutomationSequence> {
    return (await sendshark.createAutomation(sequence)) as AutomationSequence
  }

  async triggerAutomation(automationId: string, recipient: EmailRecipient): Promise<Record<string, any>> {
    return (await sendshark.triggerAutomation(automationId, recipient)) as Record<string, any>
  }

  async addSubscriber(params: AddSubscriberParams): Promise<Record<string, any>> {
    return (await sendshark.addSubscriber(params)) as Record<string, any>
  }

  async sendAnalyticsReport(params: SendAnalyticsReportParams): Promise<{ id: string }> {
    const result = await sendshark.sendAnalyticsReport(params)
    return { id: String((result as { id?: string })?.id || crypto.randomUUID()) }
  }

  async setupDefaultAutomations(): Promise<AutomationSequence[]> {
    return (await sendshark.setupDefaultAutomations()) as AutomationSequence[]
  }
}
