import { useState, useEffect } from 'react'
import { toast } from 'sonner'

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
  blocks: any[]
  traffic_percentage: number
  status: 'draft' | 'active' | 'paused' | 'completed'
}

export interface OptimizationHistory {
  id: string
  funnel_id: string
  block_id: string
  optimization_type: string
  field_changed: string
  old_value: any
  new_value: any
  reason: string
  expected_lift: number
  confidence: number
  created_at: string
}

export function useAIOptimizer() {
  const [loading, setLoading] = useState(false)
  const [suggestions, setSuggestions] = useState<OptimizationSuggestion[]>([])
  const [abTestVariations, setABTestVariations] = useState<ABTestVariation[]>([])
  const [optimizationHistory, setOptimizationHistory] = useState<OptimizationHistory[]>([])

  // Analyze funnel and get optimization suggestions
  const analyzeFunnel = async (funnelId: string, timeframe = 30) => {
    setLoading(true)
    try {
      const response = await fetch('/api/ai/optimize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ funnelId, timeframe })
      })

      if (!response.ok) {
        throw new Error('Failed to analyze funnel')
      }

      const data = await response.json()
      setSuggestions(data.suggestions)
      
      toast.success(`Found ${data.totalSuggestions} optimization opportunities`, {
        description: `${data.highImpactSuggestions} high-impact suggestions available`
      })

      return data
    } catch (error: any) {
      toast.error('Analysis failed', {
        description: error.message
      })
      throw error
    } finally {
      setLoading(false)
    }
  }

  // Auto-optimize a specific block
  const autoOptimizeBlock = async (funnelId: string, blockId: string) => {
    setLoading(true)
    try {
      const response = await fetch('/api/ai/optimize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          funnelId, 
          blockId,
          action: 'auto-optimize'
        })
      })

      if (!response.ok) {
        throw new Error('Failed to optimize block')
      }

      const data = await response.json()
      
      toast.success('Block optimized successfully', {
        description: 'Your funnel has been updated with AI-generated improvements'
      })

      // Remove applied suggestions
      setSuggestions(prev => prev.filter(s => s.blockId !== blockId))

      return data.optimizedBlock
    } catch (error: any) {
      toast.error('Optimization failed', {
        description: error.message
      })
      throw error
    } finally {
      setLoading(false)
    }
  }

  // Generate A/B test variations
  const generateABTest = async (funnelId: string, blockId: string, testType: 'headline' | 'cta' | 'copy' | 'style') => {
    setLoading(true)
    try {
      const response = await fetch('/api/ai/optimize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          funnelId, 
          blockId, 
          testType,
          action: 'generate-ab-test'
        })
      })

      if (!response.ok) {
        throw new Error('Failed to generate A/B test')
      }

      const data = await response.json()
      setABTestVariations(data.variations)
      
      toast.success('A/B test variations generated', {
        description: `${data.variations.length} variations created based on your brand personality`
      })

      return data
    } catch (error: any) {
      toast.error('A/B test generation failed', {
        description: error.message
      })
      throw error
    } finally {
      setLoading(false)
    }
  }

  // Get optimization history
  const getOptimizationHistory = async (funnelId: string) => {
    setLoading(true)
    try {
      const response = await fetch(`/api/ai/optimize?funnelId=${funnelId}`)

      if (!response.ok) {
        throw new Error('Failed to fetch optimization history')
      }

      const data = await response.json()
      setOptimizationHistory(data.history)

      return data.history
    } catch (error: any) {
      toast.error('Failed to load history', {
        description: error.message
      })
      throw error
    } finally {
      setLoading(false)
    }
  }

  // Apply a specific suggestion manually
  const applySuggestion = async (funnelId: string, suggestion: OptimizationSuggestion) => {
    return autoOptimizeBlock(funnelId, suggestion.blockId)
  }

  // Dismiss a suggestion
  const dismissSuggestion = (blockId: string, field: string) => {
    setSuggestions(prev => prev.filter(s => !(s.blockId === blockId && s.field === field)))
    toast.success('Suggestion dismissed')
  }

  // Get suggestions by impact level
  const getSuggestionsByImpact = (minLift = 10) => {
    return suggestions.filter(s => s.expectedLift >= minLift).sort((a, b) => b.expectedLift - a.expectedLift)
  }

  // Get suggestions by confidence
  const getSuggestionsByConfidence = (minConfidence = 0.7) => {
    return suggestions.filter(s => s.confidence >= minConfidence).sort((a, b) => b.confidence - a.confidence)
  }

  // Calculate total potential lift
  const getTotalPotentialLift = () => {
    return suggestions.reduce((total, s) => total + s.expectedLift, 0)
  }

  return {
    // State
    loading,
    suggestions,
    abTestVariations,
    optimizationHistory,

    // Actions
    analyzeFunnel,
    autoOptimizeBlock,
    generateABTest,
    getOptimizationHistory,
    applySuggestion,
    dismissSuggestion,

    // Helpers
    getSuggestionsByImpact,
    getSuggestionsByConfidence,
    getTotalPotentialLift,

    // Computed values
    highImpactSuggestions: getSuggestionsByImpact(20),
    mediumImpactSuggestions: suggestions.filter(s => s.expectedLift >= 10 && s.expectedLift < 20),
    lowImpactSuggestions: suggestions.filter(s => s.expectedLift < 10),
    totalPotentialLift: getTotalPotentialLift(),
    averageConfidence: suggestions.length > 0 
      ? suggestions.reduce((sum, s) => sum + s.confidence, 0) / suggestions.length 
      : 0
  }
}

export default useAIOptimizer