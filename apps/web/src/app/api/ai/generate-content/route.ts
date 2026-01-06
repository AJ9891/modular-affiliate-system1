import { NextRequest, NextResponse } from 'next/server'
import { generateContent, GenerateContentParams } from '@/lib/openai'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Get active BrandBrain profile for the user
    const supabase = createRouteHandlerClient({ cookies })
    const { data: { user } } = await supabase.auth.getUser()
    
    let brandBrain = null;
    if (user) {
      try {
        const { data: profile, error } = await supabase
          .from('brand_profiles')
          .select('*')
          .eq('user_id', user.id)
          .eq('is_active', true)
          .single()
        
        if (!error) {
          brandBrain = profile;
        } else {
          console.log('BrandBrain profile not found or table does not exist:', error.message);
        }
      } catch (err) {
        console.log('BrandBrain table not available, using default settings');
      }
    }
    
    const params: GenerateContentParams = {
      type: body.type,
      niche: body.niche,
      productName: body.productName,
      audience: body.audience,
      tone: body.tone,
      context: body.context,
      brandBrain: brandBrain, // Pass BrandBrain profile to AI generator
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
