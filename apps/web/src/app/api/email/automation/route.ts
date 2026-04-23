import { NextRequest, NextResponse } from 'next/server'
import { emailService } from '@/lib/email/service'

/**
 * Email Automation API Endpoint
 * POST /api/email/automation - Create automation
 * POST /api/email/automation/trigger - Trigger automation for user
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action, ...data } = body

    if (action === 'trigger') {
      // Trigger automation for a user
      const { automationId, recipient } = data
      if (!automationId || !recipient?.email) {
        return NextResponse.json(
          { success: false, error: 'automationId and recipient.email are required' },
          { status: 400 }
        )
      }
      const result = await emailService.triggerAutomation(automationId, recipient)
      
      return NextResponse.json({ 
        success: true, 
        message: 'Automation triggered successfully',
        result 
      })
    }

    if (!data?.name || !data?.trigger || !Array.isArray(data?.emails)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Automation payload must include name, trigger, and emails[]',
        },
        { status: 400 }
      )
    }

    // Create new automation
    const automation = await emailService.createAutomation(data)
    
    return NextResponse.json({ 
      success: true, 
      automation,
      message: 'Automation created successfully' 
    })
  } catch (err) {
    console.error('Automation error:', err)
    const message = err instanceof Error ? err.message : 'Automation operation failed'
    const status = message.includes('Sendshark API') ? 502 : 500
    return NextResponse.json(
      { 
        success: false, 
        error: message
      },
      { status }
    )
  }
}

/**
 * Setup default automations
 * POST /api/email/automation/setup
 */
export async function PUT(_request: NextRequest) {
  try {
    const automations = await emailService.setupDefaultAutomations()
    
    return NextResponse.json({ 
      success: true, 
      automations,
      message: 'Default automations setup successfully' 
    })
  } catch (error) {
    console.error('Setup automations error:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to setup automations' 
      },
      { status: 500 }
    )
  }
}
