/**
 * AI Integration Examples
 * 
 * How to use personality-governed AI generation
 */

import { resolvePersonality } from '@/lib/personality'
import { resolveAIPrompt } from './promptResolver'
import type { AIPromptProfile, BrandMode } from './types'

/**
 * Example 1: Basic AI Generation
 * 
 * The simplest case - generate content respecting personality
 */
export async function generateContent(
  brandMode: BrandMode | string,
  userPrompt: string
) {
  // Resolve personality from brand_mode
  const personality = resolvePersonality(brandMode as any)
  
  // Get AI prompt configuration
  const promptProfile = resolveAIPrompt(personality)
  
  // Call your AI service (OpenAI, Anthropic, etc.)
  const completion = await generateAI({
    system: promptProfile.system,
    rules: promptProfile.principles,
    forbidden: promptProfile.forbidden,
    userPrompt,
  })
  
  return completion
}

/**
 * Example 2: Hero Section Generation
 * 
 * Generate hero copy with personality enforcement
 */
export async function generateHeroSection(
  brandMode: BrandMode | string,
  niche: string,
  productName: string
) {
  const personality = resolvePersonality(brandMode as any)
  const promptProfile = resolveAIPrompt(personality)
  
  const systemPrompt = buildSystemPrompt(promptProfile)
  const userPrompt = `
Generate a hero section for a ${niche} affiliate funnel.
Product: ${productName}

Include:
- Headline (10 words max)
- Subheadline (20 words max)
- One primary CTA

Remember: ${promptProfile.forbidden.map(f => `Never ${f}`).join('. ')}.
  `.trim()
  
  const response = await callOpenAI(systemPrompt, userPrompt)
  return response
}

/**
 * Example 3: Email Sequence Generation
 * 
 * Generate personality-consistent email series
 */
export async function generateEmailSequence(
  brandMode: BrandMode | string,
  context: {
    productName: string
    audience: string
    numEmails: number
  }
) {
  const personality = resolvePersonality(brandMode as any)
  const promptProfile = resolveAIPrompt(personality)
  
  const emails = []
  
  for (let i = 1; i <= context.numEmails; i++) {
    const userPrompt = `
Generate email ${i} of ${context.numEmails} for ${context.productName}.
Audience: ${context.audience}

Principles to follow:
${promptProfile.principles.map(p => `- ${p}`).join('\n')}

Never do this:
${promptProfile.forbidden.map(f => `- ${f}`).join('\n')}
    `.trim()
    
    const email = await generateAI({
      system: promptProfile.system,
      rules: promptProfile.principles,
      forbidden: promptProfile.forbidden,
      userPrompt,
    })
    
    emails.push(email)
  }
  
  return emails
}

/**
 * Example 4: Content Validation
 * 
 * Check if generated content violates personality rules
 */
export function validateGeneratedContent(
  content: string,
  promptProfile: AIPromptProfile
): { isValid: boolean; violations: string[] } {
  const violations: string[] = []
  const lowerContent = content.toLowerCase()
  
  // Check for forbidden patterns
  for (const forbidden of promptProfile.forbidden) {
    const pattern = forbidden.toLowerCase()
    if (lowerContent.includes(pattern)) {
      violations.push(`Contains forbidden pattern: "${forbidden}"`)
    }
  }
  
  return {
    isValid: violations.length === 0,
    violations
  }
}

/**
 * Example 5: Complete Flow with Validation
 */
export async function generateAndValidate(
  brandMode: BrandMode | string,
  userPrompt: string,
  maxRetries = 3
) {
  const personality = resolvePersonality(brandMode as any)
  const promptProfile = resolveAIPrompt(personality)
  
  let attempts = 0
  let content = ''
  let isValid = false
  
  while (attempts < maxRetries && !isValid) {
    attempts++
    
    // Generate content
    content = await generateAI({
      system: promptProfile.system,
      rules: promptProfile.principles,
      forbidden: promptProfile.forbidden,
      userPrompt,
    })
    
    // Validate
    const validation = validateGeneratedContent(content, promptProfile)
    isValid = validation.isValid
    
    if (!isValid) {
      console.warn(`Attempt ${attempts} failed validation:`, validation.violations)
      // Add violations to next prompt
      userPrompt += `\n\nIMPORTANT: Previous attempt violated these rules: ${validation.violations.join(', ')}`
    }
  }
  
  return {
    content,
    attempts,
    isValid
  }
}

/**
 * Helper: Build full system prompt
 */
function buildSystemPrompt(promptProfile: AIPromptProfile): string {
  return `
${promptProfile.system}

Behavioral Principles:
${promptProfile.principles.map((p, i) => `${i + 1}. ${p}`).join('\n')}

Forbidden (NEVER DO THIS):
${promptProfile.forbidden.map((f, i) => `${i + 1}. ${f}`).join('\n')}
  `.trim()
}

/**
 * Helper: Mock AI call
 * 
 * Replace this with your actual OpenAI/Anthropic call
 */
async function generateAI({
  system,
  rules,
  forbidden,
  userPrompt,
}: {
  system: string
  rules: string[]
  forbidden: string[]
  userPrompt: string
}): Promise<string> {
  // Mock implementation
  console.log('AI Call:', { system, rules, forbidden, userPrompt })
  
  // In real implementation:
  // const response = await openai.chat.completions.create({
  //   model: "gpt-4",
  //   messages: [
  //     { role: "system", content: buildSystemPrompt({ system, principles: rules, forbidden }) },
  //     { role: "user", content: userPrompt }
  //   ]
  // })
  // return response.choices[0].message.content
  
  return 'Generated content based on personality...'
}

/**
 * Helper: Mock OpenAI call
 */
async function callOpenAI(systemPrompt: string, userPrompt: string): Promise<string> {
  console.log('OpenAI Call:', { systemPrompt, userPrompt })
  return 'Generated content...'
}

/**
 * Usage in Your App:
 * 
 * ```tsx
 * // In your AI generation route/service
 * import { generateContent } from '@/lib/ai-generator/examples'
 * 
 * export async function POST(req: Request) {
 *   const { brandMode, prompt } = await req.json()
 *   const content = await generateContent(brandMode, prompt)
 *   return Response.json({ content })
 * }
 * ```
 * 
 * Key Benefits:
 * 1. Personality governs AI, not manual rules
 * 2. UI and AI speak with same voice
 * 3. Easy to switch personalities
 * 4. Type-safe, testable
 * 5. Validation built-in
 */
