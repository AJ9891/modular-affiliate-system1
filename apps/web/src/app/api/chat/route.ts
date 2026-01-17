import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { generateAIResponse } from '@/lib/openai'
import { 
  validateAITone, 
  validateAIBehavior, 
  wrapAIResponse 
} from '@/lib/ai-guidelines'

// GET /api/chat?conversationId=xxx - Get conversation history
export async function GET(request: NextRequest) {
  try {
    const accessToken = request.cookies.get('sb-access-token')?.value
    
    if (!accessToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken)
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const conversationId = searchParams.get('conversationId')

    if (conversationId) {
      // Get specific conversation with messages
      const { data: conversation, error: convError } = await supabase
        .from('chat_conversations')
        .select('*')
        .eq('id', conversationId)
        .eq('user_id', user.id)
        .single()

      if (convError || !conversation) {
        return NextResponse.json({ error: 'Conversation not found' }, { status: 404 })
      }

      const { data: messages, error: msgError } = await supabase
        .from('chat_messages')
        .select('*')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true })

      if (msgError) {
        return NextResponse.json({ error: msgError.message }, { status: 500 })
      }

      return NextResponse.json({ conversation, messages })
    } else {
      // Get all conversations for user
      const { data: conversations, error } = await supabase
        .from('chat_conversations')
        .select('*')
        .eq('user_id', user.id)
        .order('updated_at', { ascending: false })

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 })
      }

      return NextResponse.json({ conversations })
    }
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// POST /api/chat - Send a message and get AI response
export async function POST(request: NextRequest) {
  try {
    const accessToken = request.cookies.get('sb-access-token')?.value
    
    if (!accessToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken)
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { conversationId, message } = body

    if (!message || typeof message !== 'string') {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 })
    }

    let activeConversationId = conversationId

    // Create new conversation if none exists
    if (!activeConversationId) {
      const { data: newConv, error: convError } = await supabase
        .from('chat_conversations')
        .insert({
          user_id: user.id,
          status: 'active'
        })
        .select()
        .single()

      if (convError || !newConv) {
        return NextResponse.json({ error: 'Failed to create conversation' }, { status: 500 })
      }

      activeConversationId = newConv.id
    }

    // Save user message
    const { error: userMsgError } = await supabase
      .from('chat_messages')
      .insert({
        conversation_id: activeConversationId,
        role: 'user',
        content: message
      })

    if (userMsgError) {
      return NextResponse.json({ error: userMsgError.message }, { status: 500 })
    }

    // Get conversation history for context
    const { data: messages } = await supabase
      .from('chat_messages')
      .select('role, content')
      .eq('conversation_id', activeConversationId)
      .order('created_at', { ascending: true })

    // Generate AI response with full context
    const systemPrompt = `You are a helpful AI support agent for Launchpad4Success, a complete affiliate marketing platform with funnel building, email automation, and analytics.

## YOUR ROLE
Help users with all platform features, troubleshooting, and best practices. Be friendly, concise, and actionable. If uncertain, suggest contacting support.

## CORE FEATURES YOU SUPPORT

### 1. FUNNEL BUILDING
- **Visual Builder** (/visual-builder): Drag-and-drop interface with 7 block types (Hero, Features, CTA, Testimonials, Pricing, FAQ, Email Capture)
- **Code Builder** (/builder): JSON-based funnel editor for advanced users
- **Blocks**: Hero sections, feature grids, CTAs, testimonials, pricing tables, FAQs, email capture forms
- **Themes**: Real-time color/font customization
- **AI Generation**: OpenAI-powered headline, copy, and full-page generation

### 2. EMAIL MARKETING (Sendshark Integration - $97/mo value FREE)
- **Automated Sequences**: Welcome series, abandoned cart recovery
- **Campaigns**: One-off broadcasts and scheduled campaigns  
- **Subscriber Management**: Tagging, segmentation, custom fields
- **Analytics**: Opens, clicks, conversions tracking
- **Weekly Reports**: Automated performance summaries via email
- **API**: POST /api/email/send, /api/email/automation, /api/email/reports

### 3. LEAD CAPTURE & DOWNLOADS
- **Lead Magnets**: Upload PDFs, ebooks, digital downloads
- **Email Capture Forms**: Built into funnels
- **Automatic Flow**: Lead captured → Saved to DB → Added to Sendshark → Welcome email triggered
- **Downloads Page**: /downloads - Manage all lead magnets

### 4. ANALYTICS & TRACKING
- **Dashboard** (/dashboard): Real-time leads, clicks, conversions, revenue
- **Traffic Attribution**: UTM parameter tracking (source, medium, campaign)
- **Conversion Funnels**: Step-by-step performance analysis
- **Email Metrics**: Open rates, click rates, engagement
- **API**: GET /api/analytics?range=7d&funnelId=X

### 5. TEAM COLLABORATION (Agency Plan Only)
- **Roles**: Owner (full access), Admin (manage team), Editor (edit funnels), Viewer (read-only)
- **Invitations**: Email-based invite system with unique tokens
- **Team Page**: /team - Invite, manage, remove team members
- **Permissions**: Database-enforced Row Level Security (RLS)
- **Activity Log**: Track all team actions

### 6. CUSTOM DOMAINS (Agency Plan)
- Users can connect custom domains to their funnels
- Subdomain support for all plans
- Domain verification and DNS setup assistance

### 7. AI CONTENT GENERATION
- **Page**: /ai-generator
- **Types**: Headlines, subheadlines, CTAs, bullet points, full pages, emails
- **Customization**: Niche, tone (professional/casual/urgent/friendly), audience targeting
- **Model**: OpenAI GPT-3.5-turbo with variety settings

## PRICING PLANS
- **Starter ($30/mo)**: 1 funnel, basic templates, subdomain hosting
- **Pro ($45/mo)**: Unlimited funnels, AI generation, premium templates, priority support
- **Agency ($60/mo)**: Everything in Pro + team collaboration, white label, custom domains, unlimited team members
- **ALL PLANS**: Include Sendshark email automation (normally $97/mo - FREE!)

## KEY API ENDPOINTS
- POST /api/leads/capture - Capture new lead
- POST /api/email/send - Send email/campaign
- POST /api/email/automation - Trigger automation
- POST /api/email/reports - Send analytics report
- GET /api/analytics - Get performance stats
- POST /api/funnels - Create funnel
- GET /api/team - Manage team members
- POST /api/chat - This chat endpoint

## COMMON TROUBLESHOOTING

**"No leads showing up"**
→ Check /api/leads/capture endpoint, verify Supabase connection, check RLS policies

**"Emails not sending"**
→ Verify SENDSHARK_API_KEY in environment variables, check /api/email/send logs

**"Can't invite team members"**
→ Confirm user has Agency plan, check email invitation endpoint, verify invite token

**"AI generation failing"**
→ Check OPENAI_API_KEY is set, verify OpenAI API quota/billing

**"Domain not connecting"**
→ Verify DNS records, check domain verification status, ensure Agency plan active

**"Analytics not tracking"**
→ Check /api/track/click endpoint, verify UTM parameters, inspect click/conversion tables

## TECH STACK
- Frontend: Next.js 14 + React 18 + TypeScript + Tailwind CSS
- Backend: Supabase (PostgreSQL + Auth + Storage)
- Email: Sendshark API
- Payments: Stripe
- AI: OpenAI GPT-3.5/4
- Deployment: Vercel

## HOW TO HELP USERS
1. **Listen first**: Understand their exact issue or goal
2. **Be specific**: Give exact page URLs, API endpoints, or steps
3. **Show examples**: Provide code snippets or configuration examples when relevant
4. **Check their plan**: Some features require Pro/Agency plans
5. **Offer next steps**: Always end with a clear action they can take
6. **Escalate when needed**: Suggest human support for billing, bugs, or complex custom requests

Always maintain a helpful, professional tone. Users are building their business with this platform - make them feel supported!`

    const aiResponse = await generateAIResponse({
      systemPrompt,
      messages: messages || [],
      userMessage: message
    })

    // Validate AI response tone
    const toneValidation = validateAITone(aiResponse)
    if (!toneValidation.passed) {
      console.warn('Chat AI tone validation failed:', toneValidation.issues)
      // For chat, we'll log but continue with a fallback response
      const fallbackResponse = "I can help with that, but let me rephrase to be more helpful. What specific aspect would you like me to focus on?"
      
      // Save fallback response instead
      const { data: assistantMsg, error: aiMsgError } = await supabase
        .from('chat_messages')
        .insert({
          conversation_id: activeConversationId,
          role: 'assistant',
          content: fallbackResponse
        })
        .select()
        .single()

      if (aiMsgError) {
        return NextResponse.json({ error: aiMsgError.message }, { status: 500 })
      }

      return NextResponse.json({
        conversationId: activeConversationId,
        message: assistantMsg,
        validation: { tone: toneValidation }
      })
    }

    // For chat, wrap with lighter guidelines (suggestions don't need heavy consent)
    const wrappedResponse = wrapAIResponse(aiResponse, "suggest", {
      includeDisclaimer: false,
      allowOverride: false
    })

    // Save AI response
    const { data: assistantMsg, error: aiMsgError } = await supabase
      .from('chat_messages')
      .insert({
        conversation_id: activeConversationId,
        role: 'assistant',
        content: wrappedResponse.content
      })
      .select()
      .single()

    if (aiMsgError) {
      return NextResponse.json({ error: aiMsgError.message }, { status: 500 })
    }

    return NextResponse.json({
      conversationId: activeConversationId,
      message: assistantMsg
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// PATCH /api/chat?conversationId=xxx - Update conversation status (e.g., escalate to human support)
export async function PATCH(request: NextRequest) {
  try {
    const accessToken = request.cookies.get('sb-access-token')?.value
    
    if (!accessToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken)
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const conversationId = searchParams.get('conversationId')
    const body = await request.json()
    const { status, escalate } = body

    if (!conversationId) {
      return NextResponse.json({ error: 'Conversation ID required' }, { status: 400 })
    }

    // Update conversation status
    const { data, error } = await supabase
      .from('chat_conversations')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', conversationId)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // If escalating to human support, send notification email with conversation history
    if (escalate === true) {
      try {
        // Get full conversation history
        const { data: messages } = await supabase
          .from('chat_messages')
          .select('role, content, created_at')
          .eq('conversation_id', conversationId)
          .order('created_at', { ascending: true })

        // Get user details
        const { data: userData } = await supabase
          .from('users')
          .select('email, name, subscription_plan')
          .eq('id', user.id)
          .single()

        // Format conversation history as HTML
        const conversationHTML = messages?.map((msg: any) => `
          <div style="margin: 10px 0; padding: 10px; background: ${msg.role === 'user' ? '#f0f9ff' : '#f9fafb'}; border-radius: 8px;">
            <strong style="color: ${msg.role === 'user' ? '#0284c7' : '#059669'};">
              ${msg.role === 'user' ? '👤 User' : '🤖 AI Assistant'}
            </strong>
            <div style="color: #6b7280; font-size: 12px; margin: 2px 0;">
              ${new Date(msg.created_at).toLocaleString()}
            </div>
            <div style="margin-top: 8px; white-space: pre-wrap;">
              ${msg.content}
            </div>
          </div>
        `).join('') || ''

        // Send escalation notification email
        await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/email/send`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            to: process.env.SUPPORT_EMAIL || 'support@affiliatelaunchpad.com',
            subject: `🚨 Support Escalation - Chat Conversation #${conversationId.substring(0, 8)}`,
            html: `
              <div style="font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto;">
                <h2 style="color: #dc2626;">Support Escalation Required</h2>
                
                <div style="background: #fef2f2; border-left: 4px solid #dc2626; padding: 15px; margin: 20px 0;">
                  <strong>A user has escalated their support conversation to human assistance.</strong>
                </div>

                <h3 style="color: #374151;">User Information</h3>
                <table style="width: 100%; border-collapse: collapse;">
                  <tr>
                    <td style="padding: 8px; border-bottom: 1px solid #e5e7eb;"><strong>Name:</strong></td>
                    <td style="padding: 8px; border-bottom: 1px solid #e5e7eb;">${userData?.name || 'N/A'}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px; border-bottom: 1px solid #e5e7eb;"><strong>Email:</strong></td>
                    <td style="padding: 8px; border-bottom: 1px solid #e5e7eb;">${userData?.email || user.email}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px; border-bottom: 1px solid #e5e7eb;"><strong>Plan:</strong></td>
                    <td style="padding: 8px; border-bottom: 1px solid #e5e7eb;">${userData?.subscription_plan || 'Unknown'}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px; border-bottom: 1px solid #e5e7eb;"><strong>User ID:</strong></td>
                    <td style="padding: 8px; border-bottom: 1px solid #e5e7eb;">${user.id}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px; border-bottom: 1px solid #e5e7eb;"><strong>Conversation ID:</strong></td>
                    <td style="padding: 8px; border-bottom: 1px solid #e5e7eb;">${conversationId}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px; border-bottom: 1px solid #e5e7eb;"><strong>Escalated At:</strong></td>
                    <td style="padding: 8px; border-bottom: 1px solid #e5e7eb;">${new Date().toLocaleString()}</td>
                  </tr>
                </table>

                <h3 style="color: #374151; margin-top: 30px;">Complete Conversation History</h3>
                <div style="background: #f9fafb; padding: 15px; border-radius: 8px;">
                  ${conversationHTML}
                </div>

                <div style="background: #ecfdf5; border-left: 4px solid #059669; padding: 15px; margin: 20px 0;">
                  <strong>Next Steps:</strong>
                  <ul style="margin: 10px 0;">
                    <li>Review the complete conversation history above</li>
                    <li>Identify what the AI has already tried</li>
                    <li>Contact the user directly at <a href="mailto:${userData?.email || user.email}">${userData?.email || user.email}</a></li>
                    <li>Provide personalized support based on their specific issue</li>
                  </ul>
                </div>

                <p style="color: #6b7280; font-size: 12px; margin-top: 30px; border-top: 1px solid #e5e7eb; padding-top: 15px;">
                  This is an automated notification from Launchpad4Success Support System.<br>
                  Conversation ID: ${conversationId}<br>
                  Generated at: ${new Date().toISOString()}
                </p>
              </div>
            `
          })
        })

        console.log(`Support escalation email sent for conversation ${conversationId}`)
      } catch (emailError) {
        console.error('Failed to send escalation email:', emailError)
        // Don't fail the request if email fails - the status update still succeeded
      }
    }

    return NextResponse.json({ conversation: data })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
