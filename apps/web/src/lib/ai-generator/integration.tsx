/**
 * Complete AI Integration Flow
 * 
 * Shows end-to-end integration of personality-governed AI generation
 */

'use client'

import { useState } from 'react'
import { usePersonality, resolvePersonality } from '@/lib/personality'
import { resolveAIPrompt } from '@/lib/ai-generator'

/**
 * Example: AI Content Generator Component
 * 
 * Uses personality to generate content that matches the brand
 */
export function AIContentGenerator() {
  const { personality } = usePersonality()
  const [prompt, setPrompt] = useState('')
  const [content, setContent] = useState('')
  const [loading, setLoading] = useState(false)

  const handleGenerate = async () => {
    setLoading(true)
    
    try {
      // Resolve AI prompt from personality
      const promptProfile = resolveAIPrompt(personality)
      
      // Call API with personality-governed prompts
      const response = await fetch('/api/ai/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          system: promptProfile.system,
          principles: promptProfile.principles,
          forbidden: promptProfile.forbidden,
          userPrompt: prompt
        })
      })
      
      const data = await response.json()
      setContent(data.content)
      
    } catch (error) {
      console.error('Generation failed:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-2">
          What do you want to create?
        </label>
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          className="w-full p-3 border rounded"
          rows={4}
          placeholder="e.g., Write a hero section for a fitness affiliate funnel"
        />
      </div>
      
      <button
        onClick={handleGenerate}
        disabled={loading || !prompt}
        className="btn-primary"
      >
        {loading ? 'Generating...' : 'Generate Content'}
      </button>
      
      {content && (
        <div className="p-4 bg-gray-50 rounded">
          <h3 className="font-medium mb-2">Generated Content</h3>
          <p className="whitespace-pre-wrap">{content}</p>
        </div>
      )}
      
      {/* Show active personality */}
      <div className="text-xs text-gray-500">
        Using {personality.name} personality
      </div>
    </div>
  )
}

/**
 * API Route: /api/ai/generate/route.ts
 * 
 * Backend handler for AI generation with personality enforcement
 */
export async function generateAIRoute(request: Request) {
  const { system, principles, forbidden, userPrompt } = await request.json()
  
  // Build complete system prompt
  const fullSystemPrompt = `
${system}

BEHAVIORAL PRINCIPLES:
${principles.map((p: string, i: number) => `${i + 1}. ${p}`).join('\n')}

FORBIDDEN (NEVER DO THIS):
${forbidden.map((f: string, i: number) => `${i + 1}. ${f}`).join('\n')}
  `.trim()
  
  // Call OpenAI (or your AI service)
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: 'gpt-4',
      messages: [
        { role: 'system', content: fullSystemPrompt },
        { role: 'user', content: userPrompt }
      ],
      temperature: 0.7,
      max_tokens: 500
    })
  })
  
  const data = await response.json()
  const content = data.choices[0].message.content
  
  // Optional: Validate content against forbidden patterns
  const violations = validateContent(content, forbidden)
  
  return Response.json({
    content,
    violations,
    isValid: violations.length === 0
  })
}

/**
 * Validate generated content
 */
function validateContent(content: string, forbidden: string[]): string[] {
  const violations: string[] = []
  const lowerContent = content.toLowerCase()
  
  for (const pattern of forbidden) {
    if (lowerContent.includes(pattern.toLowerCase())) {
      violations.push(pattern)
    }
  }
  
  return violations
}

/**
 * Example: Server-Side Generation
 * 
 * Generate content on the server using personality
 */
export async function generateOnServer(
  brandMode: string,
  prompt: string
) {
  'use server'
  
  // Resolve personality
  const personality = resolvePersonality(brandMode as any)
  const promptProfile = resolveAIPrompt(personality)
  
  // Generate
  const content = await callOpenAI(
    promptProfile.system,
    promptProfile.principles,
    promptProfile.forbidden,
    prompt
  )
  
  return content
}

/**
 * Helper: OpenAI call
 */
async function callOpenAI(
  system: string,
  principles: string[],
  forbidden: string[],
  userPrompt: string
): Promise<string> {
  const fullPrompt = `
${system}

Principles: ${principles.join(', ')}
Never: ${forbidden.join(', ')}

User request: ${userPrompt}
  `.trim()
  
  // Actual OpenAI call here
  return 'Generated content...'
}

/**
 * Complete Flow Summary:
 * 
 * 1. User interacts with UI
 * 2. Component reads personality from context
 * 3. Personality → AIPromptProfile via resolveAIPrompt()
 * 4. API receives system, principles, forbidden
 * 5. OpenAI generates with personality constraints
 * 6. Optional: validate against forbidden patterns
 * 7. Return content to user
 * 
 * Benefits:
 * - UI and AI speak with same voice
 * - No hardcoded brand logic in components
 * - Easy to test different personalities
 * - Type-safe throughout
 * - Enforceable brand rules
 */
