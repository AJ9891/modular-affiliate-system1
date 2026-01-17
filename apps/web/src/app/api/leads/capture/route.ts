import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { sendshark } from '@/lib/sendshark'

/**
 * Lead Capture API Endpoint
 * POST /api/leads/capture - Capture a new lead and trigger automations
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    
    const body = await request.json()
    const { 
      email, 
      name, 
      funnelId, 
      source, 
      customFields,
      automationTrigger = 'signup'
    } = body

    if (!email) {
      return NextResponse.json(
        { success: false, error: 'Email is required' },
        { status: 400 }
      )
    }

    // Get funnel details to use funnel name as list name
    let funnelName = 'Launchpad List'
    if (funnelId) {
      const { data: funnel } = await supabase
        .from('funnels')
        .select('name')
        .eq('funnel_id', funnelId)
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
        name,
        funnel_id: funnelId,
        source,
        custom_fields: customFields,
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
        name,
        listName: funnelName, // Use funnel name as the list name!
        customFields: {
          ...customFields,
          funnelId,
          funnelName,
          source,
          signupDate: new Date().toISOString()
        },
        tags: [source || 'funnel', `funnel-${funnelId}`, funnelName]
      })
      
      console.log(`✅ Subscriber added to "${funnelName}" list`)
    } catch (emailError) {
      console.error('Sendshark add subscriber error:', emailError)
      // Continue even if email service fails
    }

    // Trigger welcome automation
    try {
      // Get active automations for this trigger
      const { data: automations } = await supabase
        .from('automations')
        .select('*')
        .eq('trigger', automationTrigger)
        .eq('active', true)

      if (automations && automations.length > 0) {
        console.log(`Triggering ${automations.length} automation(s)`)
        for (const automation of automations) {
          await sendshark.triggerAutomation(automation.sendshark_id, {
            email,
            name,
            customFields: {
              ...customFields,
              funnelName
            }
          })
        }
        console.log('✅ Automations triggered')
      } else {
        console.log('No active automations found for trigger:', automationTrigger)
      }
    } catch (automationError) {
      console.error('Automation trigger error:', automationError)
      // Continue even if automation fails
    }

    return NextResponse.json({ 
      success: true, 
      lead,
      funnelName,
      message: `Lead captured and added to "${funnelName}" list` 
    })
  } catch (error) {
    console.error('Lead capture error:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to capture lead' 
      },
      { status: 500 }
    )
  }
}

/**
 * Get all leads
 * GET /api/leads/capture
 */
export async function GET(request: NextRequest) {
  try {
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
