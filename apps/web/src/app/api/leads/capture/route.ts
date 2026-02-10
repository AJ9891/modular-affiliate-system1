import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { withRateLimit, withValidation, withErrorHandling } from '@/lib/api-middleware'
import { leadCaptureSchema } from '@/lib/security'
import { sendshark } from '@/lib/sendshark'

/**
 * Lead Capture API Endpoint
 * POST /api/leads/capture - Capture a new lead and trigger automations
 */
export const POST = withRateLimit(
  withErrorHandling(
    withValidation(async (req: NextRequest, validatedData: any) => {
      const supabase = createRouteHandlerClient({ cookies })
      
      const { 
        email, 
        funnel_id,
        source,
        utm_source,
        utm_medium,
        utm_campaign,
        utm_content,
        utm_term
      } = validatedData

      // Get funnel details to use funnel name as list name
      let funnelName = 'Launchpad List'
      if (funnel_id) {
        const { data: funnel } = await supabase
          .from('funnels')
          .select('name')
          .eq('funnel_id', funnel_id)
          .single()
        
        if (funnel?.name) {
          funnelName = funnel.name
        }
      }

      // Save lead to database
      const { data: lead, error: leadError } = await supabase
        .from('leads')
        .insert({
          email,
          funnel_id,
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

      // Add to Sendshark with funnel name as list
      try {
        console.log(`Adding subscriber to Sendshark list: "${funnelName}"`)
        
        await sendshark.addSubscriber({
          email,
          listName: funnelName,
          customFields: {
            funnel_id,
            funnelName,
            source,
            utm_source,
            utm_medium,
            utm_campaign,
            signupDate: new Date().toISOString()
          },
          tags: [source || 'funnel', `funnel-${funnel_id}`, funnelName]
        })
        
        console.log(`✅ Subscriber added to "${funnelName}" list`)
      } catch (emailError) {
        console.error('Sendshark add subscriber error:', emailError)
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
    const supabase = createRouteHandlerClient({ cookies })
    const url = new URL(request.url)
    const funnelId = url.searchParams.get('funnelId')
    const limit = parseInt(url.searchParams.get('limit') || '50')

    let query = supabase
      .from('leads')
      .select('*')
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
