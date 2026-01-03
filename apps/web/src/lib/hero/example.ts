/**
 * Hero Copy Generation - Complete Example
 * 
 * This demonstrates the full chain from personality → AI-generated hero copy.
 * 
 * The Chain:
 * 1. PersonalityProfile → defines brand identity
 * 2. HeroBehavior → how hero should feel
 * 3. HeroCopyContract → guardrails for AI
 * 4. AIPromptProfile → AI system + rules
 * 5. Complete Prompt → assembled instruction
 * 6. AI Generation → actual copy
 * 
 * Every step is explicit. No magic.
 */

import { PersonalityProfile } from '@/lib/personality/types'
import { resolveHeroBehavior } from '@/lib/personality/heroBehavior'
import { resolveHeroCopyContract } from '@/lib/hero/heroCopyResolver'
import { resolveAIPrompt, buildHeroPrompt } from '@/lib/ai-generator'

/**
 * Generate Hero Copy (Full Chain)
 * 
 * Takes a personality profile and returns AI-generated hero copy
 * that respects all behavioral and contractual constraints.
 * 
 * @param personality - The active personality profile
 * @param generateAI - Your AI generation function
 * @returns Generated hero copy
 */
export async function generateHeroCopy(
  personality: PersonalityProfile,
  generateAI: (prompt: string) => Promise<{ headline: string; subcopy: string }>
) {
  // Step 1: Resolve hero behavior from personality
  const heroBehavior = resolveHeroBehavior(personality)

  // Step 2: Convert behavior → copy contract (guardrails)
  const heroContract = resolveHeroCopyContract(heroBehavior)

  // Step 3: Resolve AI prompt profile from personality
  const aiProfile = resolveAIPrompt(personality)

  // Step 4: Build complete prompt
  const prompt = buildHeroPrompt(aiProfile, heroContract)

  // Step 5: Generate with AI
  const heroCopy = await generateAI(prompt)

  // Return with context for debugging
  return {
    copy: heroCopy,
    _debug: {
      behavior: heroBehavior,
      contract: heroContract,
      promptPreview: prompt.slice(0, 200) + '...'
    }
  }
}

/**
 * Example Usage in a React Component
 * 
 * ```tsx
 * import { usePersonality } from '@/contexts/PersonalityContext'
 * import { generateHeroCopy } from '@/lib/hero/example'
 * 
 * function HeroGenerator() {
 *   const personality = usePersonality()
 *   const [copy, setCopy] = useState(null)
 * 
 *   const handleGenerate = async () => {
 *     const result = await generateHeroCopy(
 *       personality,
 *       async (prompt) => {
 *         const response = await fetch('/api/ai/generate', {
 *           method: 'POST',
 *           body: JSON.stringify({ prompt })
 *         })
 *         return response.json()
 *       }
 *     )
 *     setCopy(result.copy)
 *   }
 * 
 *   return (
 *     <div>
 *       <button onClick={handleGenerate}>Generate Hero Copy</button>
 *       {copy && (
 *         <div>
 *           <h1>{copy.headline}</h1>
 *           <p>{copy.subcopy}</p>
 *         </div>
 *       )}
 *     </div>
 *   )
 * }
 * ```
 */

/**
 * Simplified Direct Usage (for testing)
 * 
 * ```tsx
 * import { resolvePersonality } from '@/lib/personality'
 * 
 * // Get personality from brand mode
 * const personality = resolvePersonality('anti_guru')
 * 
 * // Generate hero copy
 * const result = await generateHeroCopy(personality, myAIFunction)
 * 
 * console.log(result.copy.headline)
 * console.log(result.copy.subcopy)
 * console.log(result._debug) // See how it was resolved
 * ```
 */
