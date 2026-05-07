import { NextRequest, NextResponse } from 'next/server'
import { generateContent, GenerateContentParams } from '@/lib/openai'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { prepareAIRequest, lintAIResponse, type PipelineContractKey, type ComponentId, type RiskLevel } from '@modular-affiliate/ai'
import { 
  validateAITone, 
  validateAIBehavior, 
  wrapAIResponse,
  validateAnchorCopy,
  type AIAction 
} from '@/lib/ai-guidelines'

export async function POST(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()

    const contractByType: Record<string, PipelineContractKey> = {
      headline: 'hero',
      subheadline: 'hero',
      cta: 'cta',
      'bullet-points': 'template',
      'full-page': 'funnel',
      email: 'template',
    }

    const componentByType: Record<string, ComponentId> = {
      headline: 'HeroBlock',
      subheadline: 'HeroBlock',
      cta: 'CTAEditor',
      'bullet-points': 'TemplateCopy',
      'full-page': 'FunnelComposer',
      email: 'TemplateCopy',
    }

    const riskByType: Record<string, RiskLevel> = {
      headline: 'medium',
      subheadline: 'medium',
      cta: 'high',
      'bullet-points': 'medium',
      'full-page': 'high',
      email: 'medium',
    }

    const pipeline = prepareAIRequest({
      componentId: componentByType[body.type] ?? 'TemplateCopy',
      pageMode: 'builder',
      userLevel: 'active',
      voice: 'boost',
      riskLevel: riskByType[body.type] ?? 'medium',
      contractKey: contractByType[body.type] ?? 'template',
      componentInstructions: 'Generate copy only for the requested artifact. Keep claims grounded and specific.',
      content: JSON.stringify({
        type: body.type,
        niche: body.niche,
        productName: body.productName,
        audience: body.audience,
        tone: body.tone,
        context: body.context,
      }),
      metadata: { route: '/api/ai/generate-content', userId: user.id },
    })

    if (pipeline.blocked) {
      return NextResponse.json({ error: pipeline.reason || 'AI middleware blocked request' }, { status: 400 })
    }
    
    // Validate behavior before proceeding
    const action: AIAction = 'generate'
    const hasConsent = true // Assume consent for authenticated users
    
    const behaviorValidation = validateAIBehavior({
      hasUserConsent: hasConsent,
      action,
      includesOverride: true,
      usesFirstPerson: true
    })
    
    if (!behaviorValidation.passed) {
      return NextResponse.json({
        error: "AI guidelines violation",
        issues: behaviorValidation.issues,
        requiresConsent: true
      }, { status: 400 })
    }
    
    // Get active BrandBrain profile for the user
    let brandBrain = null
    try {
      const { data: profile, error } = await supabase
        .from('brand_profiles')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .single()
      
      // Silently handle table not found (PGRST205, PGRST106) or no rows (PGRST116)
      if (!error || error.code === 'PGRST116') {
        brandBrain = profile
      }
    } catch (err) {
      // Table doesn't exist, use default settings silently
    }
    
    const params: GenerateContentParams = {
      type: body.type,
      niche: body.niche,
      productName: body.productName,
      audience: body.audience,
      tone: body.tone,
      context: [body.context, `AI GOVERNANCE CONTEXT:\n${pipeline.prompt}`].filter(Boolean).join('\n\n'),
      brandBrain: brandBrain,
    }

    const content = await generateContent(params)

    const lintEnvelope = lintAIResponse(content)
    if (lintEnvelope.blocked) {
      return NextResponse.json({
        error: 'Generated content failed response linting',
        findings: lintEnvelope.result.findings,
      }, { status: 400 })
    }

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
      middleware: {
        voice: pipeline.voiceHeader.id,
        contract: pipeline.contract,
        context: pipeline.context,
      },
      validation: {
        tone: toneValidation,
        lint: lintEnvelope.result,
        compliance: body.type === 'cta' || body.type === 'link' ? { passed: true } : undefined
      }
    })
  } catch (error: any) {
    console.error('AI generation error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to generate content' },
      { status: 500 }
    )
  }
}
