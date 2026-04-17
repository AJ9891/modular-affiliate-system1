import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClientCompat } from '@/lib/subdomain-auth'
import {
  generateAIResponse,
  generateContent,
  type GenerateContentParams,
} from '@/lib/openai'

const GENERATE_CONTENT_TYPES: GenerateContentParams['type'][] = [
  'headline',
  'subheadline',
  'cta',
  'bullet-points',
  'full-page',
  'email',
]

const LEGACY_SYSTEM_PROMPT =
  'You are an expert copywriter specializing in high-converting affiliate funnels. Be clear, concrete, and persuasive.'

function isGenerateContentType(value: unknown): value is GenerateContentParams['type'] {
  return typeof value === 'string' && GENERATE_CONTENT_TYPES.includes(value as GenerateContentParams['type'])
}

function toStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return []
  return value.filter((item): item is string => typeof item === 'string' && item.trim().length > 0)
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createRouteHandlerClientCompat()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json().catch(() => ({})) as Record<string, unknown>

    const prompt = typeof body.prompt === 'string' ? body.prompt.trim() : ''
    const userPrompt = typeof body.userPrompt === 'string' ? body.userPrompt.trim() : ''
    const system = typeof body.system === 'string' ? body.system.trim() : ''
    const principles = toStringArray(body.principles)
    const forbidden = toStringArray(body.forbidden)

    if (prompt || userPrompt) {
      const systemParts = [system || LEGACY_SYSTEM_PROMPT]
      if (principles.length > 0) {
        systemParts.push(`Behavioral principles:\\n${principles.map((item) => `- ${item}`).join('\\n')}`)
      }
      if (forbidden.length > 0) {
        systemParts.push(`Forbidden terms or patterns:\\n${forbidden.map((item) => `- ${item}`).join('\\n')}`)
      }

      const content = await generateAIResponse({
        systemPrompt: systemParts.join('\\n\\n'),
        messages: [],
        userMessage: userPrompt || prompt,
      })

      return NextResponse.json({ content, result: content }, { status: 200 })
    }

    if (isGenerateContentType(body.type)) {
      const content = await generateContent({
        type: body.type,
        niche: typeof body.niche === 'string' ? body.niche : undefined,
        productName: typeof body.productName === 'string' ? body.productName : undefined,
        audience: typeof body.audience === 'string' ? body.audience : undefined,
        tone:
          body.tone === 'professional' || body.tone === 'casual' || body.tone === 'urgent' || body.tone === 'friendly'
            ? body.tone
            : undefined,
        context: typeof body.context === 'string' ? body.context : undefined,
      })

      return NextResponse.json({ content, result: content }, { status: 200 })
    }

    return NextResponse.json(
      {
        error:
          'Invalid payload. Provide either { prompt } / { userPrompt } or a typed generation payload with { type }.',
      },
      { status: 400 }
    )
  } catch (error) {
    console.error('AI generate compatibility route error:', error)
    return NextResponse.json({ error: 'Failed to generate content' }, { status: 500 })
  }
}
