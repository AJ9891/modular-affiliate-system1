import { NextRequest, NextResponse } from 'next/server'
import { generateContent, GenerateContentParams } from '@/lib/openai'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const params: GenerateContentParams = {
      type: body.type,
      niche: body.niche,
      productName: body.productName,
      audience: body.audience,
      tone: body.tone,
      context: body.context,
    }

    const content = await generateContent(params)

    return NextResponse.json({ content }, { status: 200 })
  } catch (error: any) {
    console.error('AI generation error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to generate content' },
      { status: 500 }
    )
  }
}
