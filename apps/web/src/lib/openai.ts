import OpenAI from 'openai'
import { BrandBrainManager } from './brand-brain/manager'

if (!process.env.OPENAI_API_KEY) {
  console.warn('Warning: OPENAI_API_KEY not set. AI features will be disabled.')
}

export const openai = process.env.OPENAI_API_KEY
  ? new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    })
  : null

export const AI_MODELS = {
  GPT4: 'gpt-4-turbo-preview',
  GPT35: 'gpt-3.5-turbo',
} as const

export interface GenerateContentParams {
  type: 'headline' | 'subheadline' | 'cta' | 'bullet-points' | 'full-page' | 'email'
  niche?: string
  productName?: string
  audience?: string
  tone?: 'professional' | 'casual' | 'urgent' | 'friendly'
  context?: string
  brandBrain?: any // Optional BrandBrain profile to enforce brand guidelines
}

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system'
  content: string
}

export interface GenerateAIResponseParams {
  systemPrompt: string
  messages: ChatMessage[]
  userMessage: string
}

export async function generateAIResponse(params: GenerateAIResponseParams): Promise<string> {
  if (!openai) {
    throw new Error('OpenAI API not configured. Please set OPENAI_API_KEY environment variable.')
  }

  try {
    const completion = await openai.chat.completions.create({
      model: AI_MODELS.GPT35,
      messages: [
        {
          role: 'system',
          content: params.systemPrompt
        },
        ...params.messages.map(msg => ({
          role: msg.role as 'user' | 'assistant' | 'system',
          content: msg.content
        })),
        {
          role: 'user',
          content: params.userMessage
        }
      ],
      temperature: 0.7,
      max_tokens: 500
    })

    return completion.choices[0]?.message?.content || 'I apologize, but I encountered an error generating a response. Please try again.'
  } catch (error: any) {
    console.error('OpenAI API Error:', error)
    throw new Error(`Failed to generate AI response: ${error.message}`)
  }
}

export async function generateContent(params: GenerateContentParams): Promise<string> {
  if (!openai) {
    throw new Error('OpenAI API not configured. Please set OPENAI_API_KEY environment variable.')
  }

  // Initialize BrandBrain manager with profile if provided
  const brandManager = new BrandBrainManager(params.brandBrain);
  const brandBrain = brandManager.getBrandBrain();

  // Build system prompt with BrandBrain guidelines
  let systemPrompt = 'You are an expert copywriter specializing in high-converting affiliate marketing funnels. Write compelling, persuasive copy that drives action.';
  
  if (params.brandBrain) {
    // If BrandBrain is provided, use its rules
    systemPrompt = brandManager.generateAISystemPrompt();
  } else {
    // Add basic brand guidelines from default profile
    systemPrompt += `\n\nBRAND GUIDELINES:\n`;
    systemPrompt += `- Voice: ${brandBrain.personalityProfile.voice.tone}\n`;
    systemPrompt += `- Formality: ${brandBrain.personalityProfile.voice.formalityLevel}/5\n`;
    systemPrompt += `- Avoid: ${brandBrain.soundPolicy.wordChoice.avoid.join(', ')}\n`;
    systemPrompt += `- Never make these claims: ${brandBrain.forbiddenClaims.legal.financialGuarantees.join(', ')}\n`;
  }

  const prompt = buildPrompt(params)

  try {
    // Randomize temperature for more variety (0.7-1.0)
    const temperature = 0.7 + Math.random() * 0.3
    
    const completion = await openai.chat.completions.create({
      model: AI_MODELS.GPT35,
      messages: [
        {
          role: 'system',
          content: systemPrompt,
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: temperature,
      max_tokens: 1000,
      presence_penalty: 0.3,
      frequency_penalty: 0.3,
    })

    const generatedContent = completion.choices[0]?.message?.content || '';
    
    // Validate generated content against BrandBrain rules
    const validation = brandManager.validateContent(generatedContent, params.brandBrain?.id || 'default');
    
    // If there are critical errors, log them (in production, you might want to regenerate)
    if (validation.violations.some(v => v.severity === 'error')) {
      console.warn('Generated content has brand violations:', validation.violations);
    }

    return generatedContent;
  } catch (error) {
    console.error('OpenAI API error:', error)
    throw new Error('Failed to generate content')
  }
}

function buildPrompt(params: GenerateContentParams): string {
  const { type, niche, productName, audience, tone, context } = params

  const baseContext = `
    ${niche ? `Niche: ${niche}` : ''}
    ${productName ? `Product/Offer: ${productName}` : ''}
    ${audience ? `Target Audience: ${audience}` : ''}
    ${tone ? `Tone: ${tone}` : ''}
    ${context ? `Additional Context: ${context}` : ''}
  `.trim()

  switch (type) {
    case 'headline':
      return `${baseContext}\n\nWrite a compelling, attention-grabbing headline for an affiliate marketing landing page. Make it benefit-driven and under 10 words. Only return the headline, no explanations.`

    case 'subheadline':
      return `${baseContext}\n\nWrite a persuasive subheadline that expands on the main headline and builds desire. Keep it under 20 words. Only return the subheadline, no explanations.`

    case 'cta':
      return `${baseContext}\n\nWrite a powerful call-to-action button text that creates urgency and drives clicks. Keep it 2-5 words. Only return the CTA text, no explanations.`

    case 'bullet-points':
      return `${baseContext}\n\nWrite 5 compelling benefit-focused bullet points for an affiliate offer. Each bullet should highlight a key benefit or feature. Format as a simple list, one per line.`

    case 'full-page':
      return `${baseContext}\n\nWrite complete landing page copy including:
- Headline
- Subheadline
- 3 benefit sections with headlines and descriptions
- Call-to-action
Format as JSON with keys: headline, subheadline, benefits (array of {title, description}), cta`

    case 'email':
      return `${baseContext}\n\nWrite a persuasive email promoting this offer. Include subject line, preview text, body copy, and call-to-action. Format as JSON with keys: subject, preview, body, cta`

    default:
      return `${baseContext}\n\nWrite compelling copy for: ${type}`
  }
}

export async function generateFunnelContent(params: {
  niche: string
  productName: string
  audience: string
}): Promise<{
  headline: string
  subheadline: string
  benefits: string[]
  cta: string
}> {
  if (!openai) {
    throw new Error('OpenAI API not configured')
  }

  try {
    const completion = await openai.chat.completions.create({
      model: AI_MODELS.GPT35,
      messages: [
        {
          role: 'system',
          content: 'You are an expert at creating high-converting affiliate marketing funnels. Generate compelling copy that drives conversions.',
        },
        {
          role: 'user',
          content: `Create landing page copy for:
Niche: ${params.niche}
Product: ${params.productName}
Audience: ${params.audience}

Return JSON with: headline, subheadline, benefits (array of 3 benefit strings), cta`,
        },
      ],
      temperature: 0.8,
      response_format: { type: 'json_object' },
    })

    const content = JSON.parse(completion.choices[0]?.message?.content || '{}')
    return {
      headline: content.headline || '',
      subheadline: content.subheadline || '',
      benefits: content.benefits || [],
      cta: content.cta || '',
    }
  } catch (error) {
    console.error('Failed to generate funnel content:', error)
    throw new Error('Failed to generate funnel content')
  }
}
