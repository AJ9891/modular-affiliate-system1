import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { niche, offer_type, target_audience } = body

    // Mock funnel generation - replace with actual AI service
    const generatedFunnel = {
      name: `${niche} ${offer_type} Funnel`,
      niche_id: niche.toLowerCase().replace(/\s+/g, '-'),
      blocks: [
        {
          type: 'hero',
          content: {
            headline: `Transform Your ${niche} Journey`,
            subheadline: `Join thousands who have achieved their ${niche} goals`,
            cta: 'Get Started Free',
          },
          style: {
            bg: 'gradient-blue',
            layout: 'centered',
          },
        },
        {
          type: 'benefits',
          content: {
            title: 'Why Choose Us',
            items: [
              'Proven results in ' + niche,
              'Expert guidance and support',
              'Money-back guarantee',
            ],
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
            button_text: 'Claim Your Offer',
          },
          style: {
            bg: 'primary',
            layout: 'centered',
          },
        },
      ],
    }

    return NextResponse.json({ funnel: generatedFunnel }, { status: 200 })
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
