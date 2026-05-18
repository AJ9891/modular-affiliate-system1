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
    const hasSendshark = Boolean(process.env.SENDSHARK_API_KEY)

    if (action === 'trigger') {
      if (!hasSendshark) {
        return NextResponse.json(
          {
            success: false,
            error: 'Automation trigger requires SENDSHARK_API_KEY.',
          },
          { status: 503 }
        )
      }

      // Trigger automation for a user
      const { automationId, recipient } = data
      const result = await sendshark.triggerAutomation(automationId, recipient)
      
      return NextResponse.json({ 
        success: true, 
        message: 'Automation triggered successfully',
        result 
      })
    }

    if (!hasSendshark) {
      // Keep UX unblocked in local/staging by creating a local placeholder.
      return NextResponse.json({
        success: true,
        automation: {
          id: `local_${Date.now()}`,
          ...data,
          provider: 'local-draft',
        },
        message: 'Automation draft created locally. Configure SENDSHARK_API_KEY to activate provider delivery.',
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
export async function PUT(_request: NextRequest) {
  try {
    const hasSendshark = Boolean(process.env.SENDSHARK_API_KEY)
    if (!hasSendshark) {
      return NextResponse.json({
        success: true,
        automations: [],
        provider: 'local-draft',
        message: 'Default automation setup is in local draft mode. Configure SENDSHARK_API_KEY to sync with provider.',
      })
    }

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
