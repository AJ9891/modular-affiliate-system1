import { NextRequest, NextResponse } from 'next/server'
import { sendshark } from '@/lib/sendshark'

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
      const result = await sendshark.triggerAutomation(automationId, recipient)
      
      return NextResponse.json({ 
        success: true, 
        message: 'Automation triggered successfully',
        result 
      })
    }

    // Create new automation
    const automation = await sendshark.createAutomation(data)
    
    return NextResponse.json({ 
      success: true, 
      automation,
      message: 'Automation created successfully' 
    })
  } catch (error) {
    console.error('Automation error:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Automation operation failed' 
      },
      { status: 500 }
    )
  }
}

/**
 * Setup default automations
 * POST /api/email/automation/setup
 */
export async function PUT(request: NextRequest) {
  try {
    const automations = await sendshark.setupDefaultAutomations()
    
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
