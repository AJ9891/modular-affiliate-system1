/**
 * Sendshark Email Service Integration
 * Handles email campaigns, automation, and reporting
 */

const SENDSHARK_API_KEY = process.env.SENDSHARK_API_KEY
const SENDSHARK_API_URL = process.env.SENDSHARK_API_URL || 'https://api.sendshark.com/v1'

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
  name: string
  trigger: 'signup' | 'purchase' | 'abandoned_cart' | 'funnel_entry' | 'custom'
  emails: Array<{
    delay: number // hours
    template: EmailTemplate
  }>
  active: boolean
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

class SendsharkService {
  private apiKey: string
  private baseUrl: string

  constructor() {
    this.apiKey = SENDSHARK_API_KEY || ''
    this.baseUrl = SENDSHARK_API_URL
  }

  private async request(endpoint: string, options: RequestInit = {}) {
    const url = `${this.baseUrl}${endpoint}`
    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${this.apiKey}`,
      ...options.headers,
    }

    const response = await fetch(url, {
      ...options,
      headers,
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: response.statusText }))
      throw new Error(`Sendshark API Error: ${error.message || response.statusText}`)
    }

    return response.json()
  }

  /**
   * Send a single email
   */
  async sendEmail(params: {
    to: EmailRecipient
    from: { email: string; name: string }
    subject: string
    html: string
    text?: string
    trackOpens?: boolean
    trackClicks?: boolean
  }) {
    return this.request('/emails/send', {
      method: 'POST',
      body: JSON.stringify(params),
    })
  }

  /**
   * Create or update an email template
   */
  async saveTemplate(template: EmailTemplate) {
    const endpoint = template.id ? `/templates/${template.id}` : '/templates'
    const method = template.id ? 'PUT' : 'POST'
    
    return this.request(endpoint, {
      method,
      body: JSON.stringify(template),
    })
  }

  /**
   * Get all templates
   */
  async getTemplates(): Promise<EmailTemplate[]> {
    return this.request('/templates')
  }

  /**
   * Create an email campaign
   */
  async createCampaign(campaign: EmailCampaign) {
    return this.request('/campaigns', {
      method: 'POST',
      body: JSON.stringify(campaign),
    })
  }

  /**
   * Get campaign statistics
   */
  async getCampaignStats(campaignId: string): Promise<EmailStats> {
    return this.request(`/campaigns/${campaignId}/stats`)
  }

  /**
   * Create an automation sequence
   */
  async createAutomation(sequence: AutomationSequence) {
    return this.request('/automations', {
      method: 'POST',
      body: JSON.stringify(sequence),
    })
  }

  /**
   * Trigger an automation for a specific user
   */
  async triggerAutomation(automationId: string, recipient: EmailRecipient) {
    return this.request(`/automations/${automationId}/trigger`, {
      method: 'POST',
      body: JSON.stringify({ recipient }),
    })
  }

  /**
   * Add subscriber to list
   */
  async addSubscriber(params: {
    email: string
    name?: string
    listId?: string
    listName?: string // NEW: Can specify list by name instead of ID
    customFields?: Record<string, any>
    tags?: string[]
  }) {
    let finalListId = params.listId
    
    // If listName is provided, find or create the list
    if (params.listName && !params.listId) {
      try {
        // Try to find existing list by name
        const lists = await this.request('/lists', { method: 'GET' })
        const existingList = lists?.data?.find((list: any) => list.name === params.listName)
        
        if (existingList) {
          finalListId = existingList.id
          console.log(`Found existing list "${params.listName}" with ID: ${finalListId}`)
        } else {
          // Create new list with this name
          const newList = await this.request('/lists', {
            method: 'POST',
            body: JSON.stringify({ name: params.listName }),
          })
          finalListId = newList?.data?.id
          console.log(`Created new list "${params.listName}" with ID: ${finalListId}`)
        }
      } catch (error) {
        console.error('Error finding/creating list:', error)
        // Continue without list if it fails
      }
    }
    
    return this.request('/subscribers', {
      method: 'POST',
      body: JSON.stringify({
        ...params,
        listId: finalListId
      }),
    })
  }

  /**
   * Send weekly analytics report
   */
  async sendAnalyticsReport(params: {
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
  }) {
    const { recipientEmail, funnelId, stats, dateRange } = params

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; border-radius: 8px 8px 0 0; }
          .stats { background: #f7fafc; padding: 20px; border-radius: 0 0 8px 8px; }
          .stat-row { display: flex; justify-content: space-between; padding: 15px 0; border-bottom: 1px solid #e2e8f0; }
          .stat-label { font-weight: 600; }
          .stat-value { color: #667eea; font-size: 1.2em; font-weight: bold; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>📊 Weekly Funnel Report</h1>
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

    return this.sendEmail({
      to: { email: recipientEmail },
      from: { email: 'reports@affiliatelaunchpad.com', name: 'Affiliate Launchpad' },
      subject: `📊 Your Weekly Funnel Performance Report`,
      html,
      trackOpens: true,
      trackClicks: true,
    })
  }

  /**
   * Create default automation sequences for affiliate funnels
   */
  async setupDefaultAutomations() {
    // Welcome sequence for new subscribers
    const welcomeSequence: AutomationSequence = {
      name: 'Welcome Sequence',
      trigger: 'signup',
      active: true,
      emails: [
        {
          delay: 0,
          template: {
            name: 'Welcome Email',
            subject: 'Welcome! Here\'s your exclusive offer',
            html: '<p>Welcome to our community! Get started with this special offer...</p>',
          }
        },
        {
          delay: 24,
          template: {
            name: 'Value Email',
            subject: 'Here\'s how to get the most out of your purchase',
            html: '<p>Here are some tips to maximize your results...</p>',
          }
        },
        {
          delay: 72,
          template: {
            name: 'Follow-up',
            subject: 'Quick question about your experience',
            html: '<p>How are things going? Let me know if you have any questions...</p>',
          }
        }
      ]
    }

    // Abandoned cart sequence
    const abandonedCartSequence: AutomationSequence = {
      name: 'Abandoned Cart Recovery',
      trigger: 'abandoned_cart',
      active: true,
      emails: [
        {
          delay: 1,
          template: {
            name: 'Cart Reminder',
            subject: 'You left something behind...',
            html: '<p>Complete your purchase and get 10% off!</p>',
          }
        },
        {
          delay: 24,
          template: {
            name: 'Last Chance',
            subject: 'Last chance for your discount',
            html: '<p>This special offer expires soon...</p>',
          }
        }
      ]
    }

    const sequences = [welcomeSequence, abandonedCartSequence]
    const results = []

    for (const sequence of sequences) {
      const result = await this.createAutomation(sequence)
      results.push(result)
    }

    return results
  }
}

export const sendshark = new SendsharkService()

// Helper function to check if Sendshark is configured
export function isSendsharkConfigured(): boolean {
  return !!SENDSHARK_API_KEY
}
