import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { sendshark } from '@/lib/sendshark'

/**
 * Lead Capture API Endpoint
 * POST /api/leads/capture - Capture a new lead and trigger automations
 */
export async function POST(request: NextRequest) {
  try {
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

    // Add to Sendshark subscriber list
    try {
      await sendshark.addSubscriber({
        email,
        name,
        customFields: {
          ...customFields,
          funnelId,
          source,
          signupDate: new Date().toISOString()
        },
        tags: [source, `funnel-${funnelId}`]
      })
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
        for (const automation of automations) {
          await sendshark.triggerAutomation(automation.sendshark_id, {
            email,
            name,
            customFields
          })
        }
      }
    } catch (automationError) {
      console.error('Automation trigger error:', automationError)
      // Continue even if automation fails
    }

    return NextResponse.json({ 
      success: true, 
      lead,
      message: 'Lead captured successfully' 
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
