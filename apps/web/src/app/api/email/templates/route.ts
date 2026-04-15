import { NextRequest, NextResponse } from 'next/server'
import { emailService } from '@/lib/email/service'
import { PERSONALITY_EMAIL_TEMPLATES, type EmailPersonality } from '@/config/emailTemplates'

type TemplateRecord = {
  id?: string
  name: string
  subject: string
  html?: string
  text?: string
  preheader?: string
  personality?: EmailPersonality
  source?: 'local' | 'remote'
}

function normalizeRemoteTemplates(payload: unknown): TemplateRecord[] {
  if (Array.isArray(payload)) {
    return payload as TemplateRecord[]
  }

  if (payload && typeof payload === 'object') {
    const record = payload as Record<string, unknown>
    if (Array.isArray(record.data)) {
      return record.data as TemplateRecord[]
    }
    if (Array.isArray(record.templates)) {
      return record.templates as TemplateRecord[]
    }
  }

  return []
}

function dedupeTemplates(templates: TemplateRecord[]): TemplateRecord[] {
  const seen = new Set<string>()
  const deduped: TemplateRecord[] = []

  for (const template of templates) {
    const key = template.id || `${template.name}::${template.subject}`
    if (seen.has(key)) continue
    seen.add(key)
    deduped.push(template)
  }

  return deduped
}

function groupByPersonality(templates: TemplateRecord[]) {
  return {
    rocket: templates.filter((template) => template.personality === 'rocket'),
    glitch: templates.filter((template) => template.personality === 'glitch'),
    anchor: templates.filter((template) => template.personality === 'anchor'),
  }
}

/**
 * Email Templates API Endpoint
 * GET /api/email/templates - Get all templates
 * POST /api/email/templates - Create template
 */
export async function GET() {
  const localTemplates: TemplateRecord[] = PERSONALITY_EMAIL_TEMPLATES.map((template) => ({
    ...template,
    source: 'local',
  }))

  try {
    const remotePayload = await emailService.getTemplates()
    const remoteTemplates = normalizeRemoteTemplates(remotePayload).map((template) => ({
      ...template,
      source: 'remote' as const,
    }))

    const templates = dedupeTemplates([...localTemplates, ...remoteTemplates])

    return NextResponse.json({
      success: true,
      templates,
      templatesByPersonality: groupByPersonality(templates),
    })
  } catch (error) {
    console.error('Get templates error:', error)

    const templates = dedupeTemplates(localTemplates)

    return NextResponse.json(
      {
        success: true,
        templates,
        templatesByPersonality: groupByPersonality(templates),
        warning: error instanceof Error ? error.message : 'Failed to get remote templates',
      },
      { status: 200 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const template = await request.json()
    const result = await emailService.saveTemplate(template)
    
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
