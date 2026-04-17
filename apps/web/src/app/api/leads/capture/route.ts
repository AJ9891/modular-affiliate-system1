import { NextRequest, NextResponse } from 'next/server'
import { withRateLimit, withValidation, withErrorHandling } from '@/lib/api-middleware'
import { leadCaptureSchema } from '@/lib/security'
import { emailService } from '@/lib/email/service'
import { createSubdomainRouteHandlerClient } from '@/lib/subdomain-auth'

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
      const { data: lead, error: leadError } = await supabase
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
        .single()

      if (leadError) {
        console.error('Lead save error:', leadError)
        throw new Error('Failed to save lead')
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
