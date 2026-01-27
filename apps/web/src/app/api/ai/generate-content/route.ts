import { NextRequest, NextResponse } from 'next/server'
import { generateContent, GenerateContentParams } from '@/lib/openai'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { withRateLimit, withValidation, withErrorHandling, withAuth } from '@/lib/api-middleware'
import { aiGenerationSchema } from '@/lib/security'
import { 
  validateAITone, 
  validateAIBehavior, 
  wrapAIResponse,
  validateAnchorCopy,
  type AIAction 
} from '@/lib/ai-guidelines'

export const POST = withRateLimit(
  withAuth(
    withValidation(
      withErrorHandling(async (req: NextRequest, userId: string, validatedData: any) => {
        const { prompt, brand_mode, content_type } = validatedData
    
    // Validate behavior before proceeding
    const behaviorValidation = validateAIBehavior({
      hasUserConsent: hasConsent,
      action,
      includesOverride: true, // We'll include override in response
      usesFirstPerson: true   // We'll wrap response properly
    })
    
    if (!behaviorValidation.passed) {
      return NextResponse.json({
        error: "AI guidelines violation",
        issues: behaviorValidation.issues,
        requiresConsent: true
      }, { status: 400 })
    }
    
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

    // Validate AI tone
    const toneValidation = validateAITone(content)
    if (!toneValidation.passed) {
      console.warn('AI tone validation failed:', toneValidation.issues)
      return NextResponse.json({
        error: "Generated content violates AI guidelines",
        issues: toneValidation.issues
      }, { status: 400 })
    }

    // Validate anchor copy if content type suggests it's link text
    if (body.type === 'cta' || body.type === 'link') {
      if (!validateAnchorCopy(content)) {
        return NextResponse.json({
          error: "Generated content contains banned words for compliance",
          suggestion: "Please try again with different parameters"
        }, { status: 400 })
      }
    }

    // Wrap response with respectful AI guidelines
    const wrappedResponse = wrapAIResponse(content, action, {
      includeDisclaimer: true,
      allowOverride: true
    })

    return NextResponse.json({ 
      content: wrappedResponse.content,
      metadata: wrappedResponse.metadata,
      validation: {
        tone: toneValidation,
        compliance: body.type === 'cta' || body.type === 'link' ? { passed: true } : undefined
      }
    }, { status: 200 })
  } catch (error: any) {
    console.error('AI generation error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to generate content' },
      { status: 500 }
    )
  }
}
