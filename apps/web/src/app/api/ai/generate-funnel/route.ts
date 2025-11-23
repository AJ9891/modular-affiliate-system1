import { NextRequest, NextResponse } from 'next/server'
import { generateFunnelContent } from '@/lib/openai'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { niche, productName, audience } = body

    if (!niche || !productName || !audience) {
      return NextResponse.json(
        { error: 'Missing required fields: niche, productName, audience' },
        { status: 400 }
      )
    }

    const content = await generateFunnelContent({
      niche,
      productName,
      audience,
    })

    // Build funnel structure with AI-generated content
    const generatedFunnel = {
      name: `${productName} - ${niche} Funnel`,
      niche_id: niche.toLowerCase().replace(/\s+/g, '-'),
      blocks: [
        {
          type: 'hero',
          content: {
            headline: content.headline,
            subheadline: content.subheadline,
            cta: content.cta,
          },
          style: {
            bg: 'gradient-blue',
            layout: 'centered',
          },
        },
        {
          type: 'benefits',
          content: {
            title: 'Why Choose This Offer',
            items: content.benefits,
          },
          style: {
            bg: 'white',
            layout: 'grid-3',
          },
        },
        {
          type: 'cta',
          content: {
            headline: 'Ready to Get Started?',
            button_text: content.cta,
          },
          style: {
            bg: 'primary',
            layout: 'centered',
          },
        },
      ],
    }

    return NextResponse.json({ funnel: generatedFunnel, content }, { status: 200 })
  } catch (error: any) {
    console.error('AI funnel generation error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to generate funnel' },
      { status: 500 }
    )
  }
}
