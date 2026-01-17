/**
 * Test script to verify AI service integration in cascade.ts
 * 
 * This tests the hero copy generation with actual OpenAI integration
 */

import { generateHeroCopy } from '@/lib/personality/cascade'

async function testAIIntegration() {
  try {
    console.log('Testing AI service integration...')
    
    const heroContent = await generateHeroCopy('anti_guru', {
      productName: 'FunnelForge',
      niche: 'SaaS tools',
      keyBenefit: 'Build funnels without the BS',
      targetAudience: 'indie makers tired of bloated marketing tools'
    })
    
    console.log('✅ AI Integration Success!')
    console.log('Generated Hero Content:')
    console.log(heroContent)
    
  } catch (error) {
    console.error('❌ AI Integration Failed:')
    console.error(error)
  }
}

// For testing in browser console
if (typeof window !== 'undefined') {
  (window as any).testAIIntegration = testAIIntegration
}

export { testAIIntegration }