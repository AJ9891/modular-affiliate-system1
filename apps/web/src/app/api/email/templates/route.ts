import { NextRequest, NextResponse } from 'next/server'
import { sendshark } from '@/lib/sendshark'

/**
 * Email Templates API Endpoint
 * GET /api/email/templates - Get all templates
 * POST /api/email/templates - Create template
 */
export async function GET() {
  try {
    const templates = await sendshark.getTemplates()
    return NextResponse.json({ success: true, templates })
  } catch (error) {
    console.error('Get templates error:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to get templates' 
      },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const template = await request.json()
    const result = await sendshark.saveTemplate(template)
    
    return NextResponse.json({ 
      success: true, 
      template: result,
      message: 'Template saved successfully' 
    })
  } catch (error) {
    console.error('Save template error:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to save template' 
      },
      { status: 500 }
    )
  }
}
