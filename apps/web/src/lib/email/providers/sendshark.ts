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
    return { id: String((result as { id?: string }).id || crypto.randomUUID()) }
  }

  async saveTemplate(template: EmailTemplate): Promise<EmailTemplate> {
    return sendshark.saveTemplate(template)
  }

  async getTemplates(): Promise<EmailTemplate[]> {
    return sendshark.getTemplates()
  }

  async createCampaign(campaign: EmailCampaign): Promise<{ id: string; status?: string }> {
    const result = await sendshark.createCampaign(campaign)
    return {
      id: String(result.id || crypto.randomUUID()),
      status: result.status,
    }
  }

  async getCampaignStats(campaignId: string): Promise<EmailStats> {
    return sendshark.getCampaignStats(campaignId)
  }

  async createAutomation(sequence: AutomationSequence): Promise<AutomationSequence> {
    return sendshark.createAutomation(sequence)
  }

  async triggerAutomation(automationId: string, recipient: EmailRecipient): Promise<Record<string, any>> {
    return sendshark.triggerAutomation(automationId, recipient)
  }

  async addSubscriber(params: AddSubscriberParams): Promise<Record<string, any>> {
    return sendshark.addSubscriber(params)
  }

  async sendAnalyticsReport(params: SendAnalyticsReportParams): Promise<{ id: string }> {
    const result = await sendshark.sendAnalyticsReport(params)
    return { id: String((result as { id?: string }).id || crypto.randomUUID()) }
  }

  async setupDefaultAutomations(): Promise<AutomationSequence[]> {
    return sendshark.setupDefaultAutomations()
  }
}
