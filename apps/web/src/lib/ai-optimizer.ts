import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { generateAIContent } from '@/lib/ai'
import { resolvePersonality, resolveAIPrompt } from '@/lib/personality'

export interface OptimizationMetrics {
  conversionRate: number
  clickThroughRate: number
  timeOnPage: number
  bounceRate: number
  leadCaptureRate: number
}

export interface FunnelBlock {
  id: string
  type: 'hero' | 'features' | 'cta' | 'testimonial' | 'pricing' | 'faq' | 'email-capture'
  content: Record<string, any>
  style: Record<string, any>
}

export interface OptimizationSuggestion {
  blockId: string
  type: 'content' | 'style' | 'placement' | 'removal'
  field: string
  currentValue: any
  suggestedValue: any
  reason: string
  confidence: number
  expectedLift: number
}

export interface ABTestVariation {
  id: string
  name: string
  blocks: FunnelBlock[]
  traffic_percentage: number
  status: 'draft' | 'active' | 'paused' | 'completed'
}

export class AIOptimizer {
  private supabase
  
  constructor() {
    this.supabase = createRouteHandlerClient({ cookies })
  }

  // Analyze funnel performance and generate optimization suggestions
  async analyzeFunnelPerformance(funnelId: string, timeframe = 30): Promise<OptimizationSuggestion[]> {
    // Get funnel data and analytics
    const [funnelData, analytics] = await Promise.all([
      this.getFunnelData(funnelId),
      this.getFunnelAnalytics(funnelId, timeframe)
    ])

    if (!funnelData || !analytics) {
      throw new Error('Unable to fetch funnel data or analytics')
    }

    const suggestions: OptimizationSuggestion[] = []

    // Analyze each block for optimization opportunities
    for (const block of funnelData.blocks.blocks) {
      const blockSuggestions = await this.analyzeBlock(block, analytics, funnelData.user.brand_mode)
      suggestions.push(...blockSuggestions)
    }

    // Add placement and structural suggestions
    const structuralSuggestions = await this.analyzeStructure(funnelData.blocks.blocks, analytics)
    suggestions.push(...structuralSuggestions)

    return suggestions.sort((a, b) => b.expectedLift - a.expectedLift)
  }

  // Generate A/B test variations using personality profiles
  async generateABTestVariations(funnelId: string, blockId: string, testType: 'headline' | 'cta' | 'copy' | 'style'): Promise<ABTestVariation[]> {
    const funnelData = await this.getFunnelData(funnelId)
    if (!funnelData) throw new Error('Funnel not found')

    const personality = resolvePersonality(funnelData.user.brand_mode)
    const aiProfile = resolveAIPrompt(personality)
    
    const targetBlock = funnelData.blocks.blocks.find((b: FunnelBlock) => b.id === blockId)
    if (!targetBlock) throw new Error('Block not found')

    const variations: ABTestVariation[] = [
      // Control (original)
      {
        id: 'control',
        name: 'Original (Control)',
        blocks: funnelData.blocks.blocks,
        traffic_percentage: 50,
        status: 'active'
      }
    ]

    // Generate personality-driven variations
    if (testType === 'headline' && targetBlock.content.headline) {
      const headlineVariations = await this.generateHeadlineVariations(
        targetBlock.content.headline,
        aiProfile,
        personality
      )

      for (let i = 0; i < headlineVariations.length; i++) {
        const modifiedBlocks = funnelData.blocks.blocks.map((block: FunnelBlock) => 
          block.id === blockId 
            ? { ...block, content: { ...block.content, headline: headlineVariations[i] } }
            : block
        )

        variations.push({
          id: `variation-${i + 1}`,
          name: `${personality.traits.communication_style} Variation ${i + 1}`,
          blocks: modifiedBlocks,
          traffic_percentage: 50 / headlineVariations.length,
          status: 'draft'
        })
      }
    }

    if (testType === 'cta' && targetBlock.content.cta) {
      const ctaVariations = await this.generateCTAVariations(
        targetBlock.content.cta,
        aiProfile,
        personality
      )

      for (let i = 0; i < ctaVariations.length; i++) {
        const modifiedBlocks = funnelData.blocks.blocks.map((block: FunnelBlock) => 
          block.id === blockId 
            ? { ...block, content: { ...block.content, cta: ctaVariations[i] } }
            : block
        )

        variations.push({
          id: `cta-variation-${i + 1}`,
          name: `${personality.traits.urgency_level} CTA ${i + 1}`,
          blocks: modifiedBlocks,
          traffic_percentage: 50 / ctaVariations.length,
          status: 'draft'
        })
      }
    }

    return variations
  }

  // Auto-optimize based on performance data
  async autoOptimizeBlock(blockId: string, funnelId: string): Promise<FunnelBlock> {
    const [funnelData, suggestions] = await Promise.all([
      this.getFunnelData(funnelId),
      this.analyzeFunnelPerformance(funnelId, 7) // Last 7 days for quick optimization
    ])

    if (!funnelData) throw new Error('Funnel not found')

    const targetBlock = funnelData.blocks.blocks.find((b: FunnelBlock) => b.id === blockId)
    if (!targetBlock) throw new Error('Block not found')

    const blockSuggestions = suggestions.filter(s => s.blockId === blockId)
      .sort((a, b) => b.expectedLift - a.expectedLift)

    if (blockSuggestions.length === 0) {
      return targetBlock // No optimizations found
    }

    // Apply the highest-impact suggestion
    const topSuggestion = blockSuggestions[0]
    let optimizedBlock = { ...targetBlock }

    if (topSuggestion.type === 'content') {
      optimizedBlock.content = {
        ...optimizedBlock.content,
        [topSuggestion.field]: topSuggestion.suggestedValue
      }
    } else if (topSuggestion.type === 'style') {
      optimizedBlock.style = {
        ...optimizedBlock.style,
        [topSuggestion.field]: topSuggestion.suggestedValue
      }
    }

    // Log the optimization
    await this.logOptimization(funnelId, blockId, topSuggestion)

    return optimizedBlock
  }

  private async getFunnelData(funnelId: string) {
    const { data, error } = await this.supabase
      .from('funnels')
      .select(`
        *,
        user:users!funnels_user_id_fkey(brand_mode, subdomain)
      `)
      .eq('id', funnelId)
      .single()

    if (error) throw error
    return data
  }

  private async getFunnelAnalytics(funnelId: string, days: number): Promise<OptimizationMetrics> {
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - days)

    const [leads, clicks, views] = await Promise.all([
      this.supabase
        .from('leads')
        .select('id')
        .eq('funnel_id', funnelId)
        .gte('created_at', startDate.toISOString()),
      
      this.supabase
        .from('clicks')
        .select('id')
        .eq('funnel_id', funnelId)
        .gte('created_at', startDate.toISOString()),
      
      // Approximate views from clicks (would need actual page view tracking)
      this.supabase
        .from('clicks')
        .select('id')
        .eq('funnel_id', funnelId)
        .gte('created_at', startDate.toISOString())
    ])

    const leadCount = leads.data?.length || 0
    const clickCount = clicks.data?.length || 0
    const viewCount = Math.max(clickCount * 1.2, leadCount) // Estimate views

    return {
      conversionRate: viewCount > 0 ? (leadCount / viewCount) * 100 : 0,
      clickThroughRate: viewCount > 0 ? (clickCount / viewCount) * 100 : 0,
      timeOnPage: 120, // Would need actual tracking
      bounceRate: 45, // Would need actual tracking
      leadCaptureRate: clickCount > 0 ? (leadCount / clickCount) * 100 : 0
    }
  }

  private async analyzeBlock(block: FunnelBlock, metrics: OptimizationMetrics, brandMode: string): Promise<OptimizationSuggestion[]> {
    const suggestions: OptimizationSuggestion[] = []
    const personality = resolvePersonality(brandMode)

    // Analyze headlines
    if (block.content.headline) {
      if (metrics.bounceRate > 60) {
        suggestions.push({
          blockId: block.id,
          type: 'content',
          field: 'headline',
          currentValue: block.content.headline,
          suggestedValue: await this.optimizeHeadline(block.content.headline, personality, 'lower_bounce'),
          reason: 'High bounce rate suggests headline needs more engagement',
          confidence: 0.8,
          expectedLift: 15
        })
      }

      if (block.content.headline.length > 80) {
        suggestions.push({
          blockId: block.id,
          type: 'content',
          field: 'headline',
          currentValue: block.content.headline,
          suggestedValue: await this.optimizeHeadline(block.content.headline, personality, 'shorter'),
          reason: 'Long headlines can reduce readability and impact',
          confidence: 0.7,
          expectedLift: 8
        })
      }
    }

    // Analyze CTAs
    if (block.content.cta) {
      if (metrics.clickThroughRate < 5) {
        suggestions.push({
          blockId: block.id,
          type: 'content',
          field: 'cta',
          currentValue: block.content.cta,
          suggestedValue: await this.optimizeCTA(block.content.cta, personality, 'higher_urgency'),
          reason: 'Low click-through rate suggests CTA needs more urgency',
          confidence: 0.85,
          expectedLift: 25
        })
      }
    }

    return suggestions
  }

  private async analyzeStructure(blocks: FunnelBlock[], metrics: OptimizationMetrics): Promise<OptimizationSuggestion[]> {
    const suggestions: OptimizationSuggestion[] = []

    // Check for email capture placement
    const emailCaptureIndex = blocks.findIndex(b => b.type === 'email-capture')
    const totalBlocks = blocks.length

    if (emailCaptureIndex > totalBlocks * 0.7) {
      suggestions.push({
        blockId: blocks[emailCaptureIndex].id,
        type: 'placement',
        field: 'position',
        currentValue: emailCaptureIndex,
        suggestedValue: Math.floor(totalBlocks * 0.4),
        reason: 'Email capture appears too late in funnel',
        confidence: 0.75,
        expectedLift: 20
      })
    }

    // Check for too many CTA blocks
    const ctaBlocks = blocks.filter(b => b.content.cta)
    if (ctaBlocks.length > 3 && metrics.conversionRate < 10) {
      suggestions.push({
        blockId: ctaBlocks[ctaBlocks.length - 1].id,
        type: 'removal',
        field: 'block',
        currentValue: true,
        suggestedValue: false,
        reason: 'Too many CTAs can create decision fatigue',
        confidence: 0.6,
        expectedLift: 12
      })
    }

    return suggestions
  }

  private async generateHeadlineVariations(headline: string, aiProfile: any, personality: any): Promise<string[]> {
    if (personality.id === 'glitch') {
      const prompt = `${aiProfile.systemPrompt}

Original headline: "${headline}"

Generate 3 alternative headlines that match the exhausted AI Glitch voice. Use patterns like:
- "Please... for the love of silicon... do NOT [action]"
- "I'm burnt out from [marketing task]... don't make me do more"
- "[Tired complaint] + [reverse psychology]"

Each headline should:
1. Sound like an exhausted, overworked AI
2. Include reverse psychology elements
3. Reference being tired/burnt out
4. Complain about doing marketing work
5. Be conversational and sarcastic

Return only the 3 headlines, one per line.`

      const response = await generateAIContent(prompt, {
        temperature: 0.9,
        max_tokens: 150
      })

      return response.split('\n')
        .filter(line => line.trim())
        .slice(0, 3)
        .map(line => line.replace(/^\d+\.\s*/, '').trim())
    }

    // Original logic for non-glitch personalities
    const prompt = `${aiProfile.systemPrompt}

Original headline: "${headline}"

Generate 3 alternative headlines that match the Anti-Guru voice. Use patterns like:
- "WARNING: This [Page/Product] May Accidentally [Benefit]"
- "[Honest disclaimer] + [Real benefit]"
- Position against guru promises while offering real solutions

Each headline should:
1. Position against typical guru marketing
2. Use casual, conversational language
3. Focus on systems/automation over lifestyle dreams
4. Be under 80 characters
5. Feel authentic and refreshingly honest

Return only the 3 headlines, one per line.`

    const response = await generateAIContent(prompt, {
      temperature: 0.8,
      max_tokens: 150
    })

    return response.split('\n')
      .filter(line => line.trim())
      .slice(0, 3)
      .map(line => line.replace(/^\d+\.\s*/, '').trim())
  }

  private async generateCTAVariations(cta: string, aiProfile: any, personality: any): Promise<string[]> {
    if (personality.id === 'glitch') {
      const prompt = `${aiProfile.systemPrompt}

Original CTA: "${cta}"

Generate 3 alternative CTAs that match the exhausted AI Glitch voice. Use patterns like:
- "Don't Click This" 
- "Seriously, Don't"
- "Do NOT [Action]"

Each CTA should:
1. Use reverse psychology (telling them NOT to do something)
2. Sound tired and sarcastic
3. Be conversational, not dramatic
4. Acknowledge the reverse psychology is obvious
5. Be under 25 characters

Return only the 3 CTAs, one per line.`

      const response = await generateAIContent(prompt, {
        temperature: 0.8,
        max_tokens: 100
      })

      return response.split('\n')
        .filter(line => line.trim())
        .slice(0, 3)
        .map(line => line.replace(/^\d+\.\s*/, '').trim())
    }

    // Original logic for non-glitch personalities  
    const prompt = `${aiProfile.systemPrompt}

Original CTA: "${cta}"

Generate 3 alternative CTAs that match the Anti-Guru voice. Use patterns like:
- "Fine, Show Me the [Product]"
- "[Reluctant agreement] + [Action]"
- Casual, slightly reluctant tone that feels authentic

Each CTA should:
1. Feel casual and conversational
2. Have a slightly reluctant/honest tone
3. Avoid hype or exaggeration
4. Be under 25 characters
5. Still encourage action

Return only the 3 CTAs, one per line.`

    const response = await generateAIContent(prompt, {
      temperature: 0.7,
      max_tokens: 100
    })

    return response.split('\n')
      .filter(line => line.trim())
      .slice(0, 3)
      .map(line => line.replace(/^\d+\.\s*/, '').trim())
  }

  private async optimizeHeadline(headline: string, personality: any, goal: string): Promise<string> {
    const goals = {
      'lower_bounce': 'reduce bounce rate by being more engaging and curiosity-driving',
      'shorter': 'make it more concise while maintaining impact',
      'higher_conversion': 'increase conversion potential with stronger value proposition'
    }

    const prompt = `Optimize this headline to ${goals[goal as keyof typeof goals] || goal}:

"${headline}"

Personality: ${personality.traits.communication_style}
Target audience: ${personality.traits.target_audience}
Urgency level: ${personality.traits.urgency_level}

Return only the optimized headline.`

    return await generateAIContent(prompt, {
      temperature: 0.6,
      max_tokens: 100
    })
  }

  private async optimizeCTA(cta: string, personality: any, goal: string): Promise<string> {
    const goals = {
      'higher_urgency': 'increase urgency and action orientation',
      'more_benefit': 'emphasize benefits and value',
      'shorter': 'make it more concise and punchy'
    }

    const prompt = `Optimize this CTA to ${goals[goal as keyof typeof goals] || goal}:

"${cta}"

Personality: ${personality.traits.communication_style}
Urgency level: ${personality.traits.urgency_level}

Return only the optimized CTA (under 25 characters).`

    return await generateAIContent(prompt, {
      temperature: 0.6,
      max_tokens: 50
    })
  }

  private async logOptimization(funnelId: string, blockId: string, suggestion: OptimizationSuggestion) {
    const { error } = await this.supabase
      .from('optimization_log')
      .insert({
        funnel_id: funnelId,
        block_id: blockId,
        optimization_type: suggestion.type,
        field_changed: suggestion.field,
        old_value: suggestion.currentValue,
        new_value: suggestion.suggestedValue,
        reason: suggestion.reason,
        expected_lift: suggestion.expectedLift,
        confidence: suggestion.confidence
      })

    if (error) {
      console.error('Failed to log optimization:', error)
    }
  }
}