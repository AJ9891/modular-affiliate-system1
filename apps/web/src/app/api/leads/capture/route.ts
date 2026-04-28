import { NextRequest, NextResponse } from 'next/server'
import { withRateLimit, withValidation, withErrorHandling } from '@/lib/api-middleware'
import { leadCaptureSchema } from '@/lib/security'
import { emailService } from '@/lib/email/service'
import { createSubdomainRouteHandlerClient } from '@/lib/subdomain-auth'
import { withTrace } from '@/lib/observability/tracing'

function isRecoverableDbError(issue: unknown): boolean {
  if (!issue || typeof issue !== 'object') return false
  const candidate = issue as { code?: string; message?: string }
  const code = candidate.code || ''
  const message = (candidate.message || '').toLowerCase()
  return (
    code === '42P01' ||
    code === 'PGRST205' ||
    code === '42703' ||
    message.includes('could not find the table') ||
    message.includes('schema cache') ||
    message.includes('column')
  )
}

/**
 * Lead Capture API Endpoint
 * POST /api/leads/capture - Capture a new lead and trigger automations
 */
export const POST = withRateLimit(
  withErrorHandling(
    withValidation(async (req: NextRequest, validatedData: any) => {
      const supabase = await createSubdomainRouteHandlerClient(req)
      
      const { 
        email, 
        funnel_id,
        page_path,
        generation_id,
        variant_id,
        source,
        utm_source,
        utm_medium,
        utm_campaign,
        utm_content,
        utm_term
      } = validatedData

      const {
        data: { user: sessionUser },
      } = await supabase.auth.getUser()

      // Get funnel details to use funnel name as list name
      let funnelName = 'Launchpad List'
      let ownerUserId: string | null = sessionUser?.id || null
      if (funnel_id) {
        const { data: funnel } = await supabase
          .from('funnels')
          .select('name,user_id')
          .eq('funnel_id', funnel_id)
          .single()
        
        if (funnel?.name) {
          funnelName = funnel.name
        }

        if (funnel?.user_id) {
          ownerUserId = funnel.user_id
        }
      }

      // Save lead to database
      const { data: lead, error: leadError } = await withTrace(
        'leads.insert',
        () =>
          supabase
            .from('leads')
            .insert({
              email,
              user_id: ownerUserId,
              funnel_id,
              generation_id: generation_id || null,
              variant_id: variant_id || null,
              source,
              utm_source,
              utm_medium,
              utm_campaign,
              utm_content,
              utm_term,
              created_at: new Date().toISOString()
            })
            .select()
            .single(),
        { funnelId: funnel_id || null, ownerUserId }
      )

      if (leadError) {
        console.error('Lead save error:', leadError)
        throw new Error('Failed to save lead')
      }

      const sessionId = req.cookies.get('lp_session_id')?.value || null
      const refererPath = (() => {
        const fromBody = typeof page_path === 'string' ? page_path.trim() : ''
        if (fromBody) return fromBody
        const ref = req.headers.get('referer')
        if (!ref) return null
        try {
          return new URL(ref).pathname
        } catch {
          return null
        }
      })()

      const { error: analyticsError } = await supabase
        .from('analytics_events')
        .insert({
          user_id: ownerUserId,
          funnel_id,
          session_id: sessionId,
          event_type: 'lead_submit',
          path: refererPath,
          metadata: {
            lead_id: lead.id,
            source: source || null,
            utm_source: utm_source || null,
            utm_medium: utm_medium || null,
            utm_campaign: utm_campaign || null,
            generation_id: generation_id || null,
            variant_id: variant_id || null,
          },
          occurred_at: new Date().toISOString(),
        })

      if (analyticsError && !isRecoverableDbError(analyticsError)) {
        console.warn('Failed to log analytics lead event:', analyticsError)
      }

      // Add subscriber to configured email provider with funnel name as list
      try {
        console.log(`Adding subscriber to provider list: "${funnelName}"`)
        
        await emailService.addSubscriber({
          email,
          listName: funnelName,
          customFields: {
            user_id: ownerUserId,
            funnel_id,
            generation_id: generation_id || null,
            variant_id: variant_id || null,
            funnelName,
            source,
            utm_source,
            utm_medium,
            utm_campaign,
            signupDate: new Date().toISOString()
          },
          tags: [source || 'funnel', funnel_id ? `funnel-${funnel_id}` : 'funnel-unknown', funnelName]
        })
        
        console.log(`✅ Subscriber added to "${funnelName}" list`)
      } catch (emailError) {
        console.error('Email provider add subscriber error:', emailError)
        // Continue even if email service fails
      }

      return NextResponse.json({
        success: true,
        lead,
        message: 'Lead captured successfully'
      }, { status: 201 })
    }, leadCaptureSchema)
  ),
  'api'
)

/**
 * Get all leads
 * GET /api/leads/capture
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createSubdomainRouteHandlerClient(request)
    const url = new URL(request.url)
    const funnelId = url.searchParams.get('funnelId')
    const limit = parseInt(url.searchParams.get('limit') || '50')
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        {
          success: false,
          error: 'Authentication required',
        },
        { status: 401 }
      )
    }

    let query = supabase
      .from('leads')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(limit)

    if (funnelId) {
      query = query.eq('funnel_id', funnelId)
    }

    const { data: leads, error } = await query

    if (error) throw error

    return NextResponse.json({ success: true, leads })
  } catch (error) {
    console.error('Get leads error:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to get leads' 
      },
      { status: 500 }
    )
  }
}
