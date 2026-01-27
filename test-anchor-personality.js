/**
 * AI Copy Generation Test - Anchor Personality
 * Test the enhanced anchor/anti-guru voice to match the professional example
 */

import { generateAIContent } from '@/lib/ai'
import { buildCanonicalAIProfile } from '@/lib/personality'

// Test the enhanced anchor personality
export async function testAnchorPersonality() {
  const anchorProfile = buildCanonicalAIProfile('anchor')
  
  console.log('🎯 Testing Enhanced Anchor Personality')
  console.log('=====================================')
  
  // Test 1: Hero Section Copy
  const heroPrompt = `${anchorProfile.systemPrompt}

Generate a hero section for an affiliate marketing platform. Include:
- Compelling headline that positions against guru promises
- Subheadline that explains what we DON'T promise
- Brief description of what we actually offer (systems/automation)
- Call-to-action button text

Product: AI-powered affiliate funnel builder
Target: People tired of guru marketing BS`

  try {
    console.log('📝 Generating Hero Section Copy...')
    const heroContent = await generateAIContent(heroPrompt, {
      temperature: anchorProfile.temperature,
      max_tokens: anchorProfile.maxTokens
    })
    
    console.log('\n✅ HERO SECTION RESULT:')
    console.log('========================')
    console.log(heroContent)
    console.log('========================\n')
    
  } catch (error) {
    console.error('❌ Hero generation failed:', error)
  }
  
  // Test 2: CTA Button Text
  const ctaPrompt = `${anchorProfile.systemPrompt}

Generate 5 different CTA button texts for a funnel builder signup page. 
Make them feel casual and slightly reluctant, like "Fine, Show Me the Launchpad".
Each should be under 25 characters.`

  try {
    console.log('🔘 Generating CTA Button Variations...')
    const ctaContent = await generateAIContent(ctaPrompt, {
      temperature: anchorProfile.temperature,
      max_tokens: 150
    })
    
    console.log('\n✅ CTA VARIATIONS:')
    console.log('===================')
    console.log(ctaContent)
    console.log('===================\n')
    
  } catch (error) {
    console.error('❌ CTA generation failed:', error)
  }
  
  // Test 3: Benefit Bullets
  const bulletPrompt = `${anchorProfile.systemPrompt}

Generate 6 benefit bullets for an affiliate funnel builder. Format like:
• No experience required (we checked)
• Yes, real funnels
• Yes, real emails
• Yes, real commissions

Focus on honest, realistic benefits that position against guru promises.`

  try {
    console.log('📋 Generating Benefit Bullets...')
    const bulletContent = await generateAIContent(bulletPrompt, {
      temperature: anchorProfile.temperature,
      max_tokens: 200
    })
    
    console.log('\n✅ BENEFIT BULLETS:')
    console.log('====================')
    console.log(bulletContent)
    console.log('====================\n')
    
  } catch (error) {
    console.error('❌ Bullet generation failed:', error)
  }
  
  console.log('🎯 Anchor Personality Test Complete!')
  console.log('Check if the generated copy matches the professional anti-guru voice')
}

// Export for testing
if (require.main === module) {
  testAnchorPersonality()
}