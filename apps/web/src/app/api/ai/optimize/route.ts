import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { AIOptimizer } from '@/lib/ai-optimizer'
import { withRateLimit, withAuth, withErrorHandling } from '@/lib/api-middleware'

// POST /api/ai/optimize-funnel - Analyze and get optimization suggestions
async function optimizeFunnel(request: NextRequest) {
  const supabase = createRouteHandlerClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()
  
  const { funnelId, timeframe = 30 } = await request.json()

  if (!funnelId) {
    throw new Error('Funnel ID is required')
  }

  // Verify user owns the funnel
  const { data: funnel, error } = await supabase
    .from('funnels')
    .select('id, user_id')
    .eq('id', funnelId)
    .eq('user_id', user!.id)
    .single()

  if (error || !funnel) {
    throw new Error('Funnel not found or access denied')
  }

  const optimizer = new AIOptimizer()
  const suggestions = await optimizer.analyzeFunnelPerformance(funnelId, timeframe)

  return NextResponse.json({
    funnelId,
    suggestions,
    totalSuggestions: suggestions.length,
    highImpactSuggestions: suggestions.filter(s => s.expectedLift >= 20).length,
    analysisDate: new Date().toISOString()
  })
}

// POST /api/ai/auto-optimize - Auto-apply optimization to a block
async function autoOptimize(request: NextRequest) {
  const supabase = createRouteHandlerClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()
  
  const { funnelId, blockId } = await request.json()

  if (!funnelId || !blockId) {
    throw new Error('Funnel ID and Block ID are required')
  }

  // Verify user owns the funnel
  const { data: funnel, error } = await supabase
    .from('funnels')
    .select('id, user_id, blocks')
    .eq('id', funnelId)
    .eq('user_id', user!.id)
    .single()

  if (error || !funnel) {
    throw new Error('Funnel not found or access denied')
  }

  const optimizer = new AIOptimizer()
  const optimizedBlock = await optimizer.autoOptimizeBlock(blockId, funnelId)

  // Update the funnel with optimized block
  const updatedBlocks = {
    ...funnel.blocks,
    blocks: funnel.blocks.blocks.map((block: any) => 
      block.id === blockId ? optimizedBlock : block
    )
  }

  const { error: updateError } = await supabase
    .from('funnels')
    .update({ 
      blocks: updatedBlocks,
      updated_at: new Date().toISOString()
    })
    .eq('id', funnelId)

  if (updateError) {
    throw new Error(`Failed to update funnel: ${updateError.message}`)
  }

  return NextResponse.json({
    success: true,
    optimizedBlock,
    message: 'Block optimized successfully'
  })
}

// POST /api/ai/generate-ab-test - Generate A/B test variations
async function generateABTest(request: NextRequest) {
  const supabase = createRouteHandlerClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()
  
  const { funnelId, blockId, testType } = await request.json()

  if (!funnelId || !blockId || !testType) {
    throw new Error('Funnel ID, Block ID, and test type are required')
  }

  // Verify user owns the funnel
  const { data: funnel, error } = await supabase
    .from('funnels')
    .select('id, user_id')
    .eq('id', funnelId)
    .eq('user_id', user!.id)
    .single()

  if (error || !funnel) {
    throw new Error('Funnel not found or access denied')
  }

  const optimizer = new AIOptimizer()
  const variations = await optimizer.generateABTestVariations(funnelId, blockId, testType)

  // Store the A/B test in the database
  const { data: abTest, error: testError } = await supabase
    .from('ab_tests')
    .insert({
      funnel_id: funnelId,
      user_id: user!.id,
      block_id: blockId,
      test_type: testType,
      variations: variations,
      status: 'draft',
      created_at: new Date().toISOString()
    })
    .select()
    .single()

  if (testError) {
    throw new Error(`Failed to create A/B test: ${testError.message}`)
  }

  return NextResponse.json({
    abTest,
    variations,
    message: 'A/B test variations generated successfully'
  })
}

// GET /api/ai/optimization-history - Get optimization history for a funnel
async function getOptimizationHistory(request: NextRequest) {
  const supabase = createRouteHandlerClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()
  
  const { searchParams } = new URL(request.url)
  const funnelId = searchParams.get('funnelId')
  const limit = Math.min(parseInt(searchParams.get('limit') || '50'), 100)

  if (!funnelId) {
    throw new Error('Funnel ID is required')
  }

  // Verify user owns the funnel
  const { data: funnel, error } = await supabase
    .from('funnels')
    .select('id, user_id')
    .eq('id', funnelId)
    .eq('user_id', user!.id)
    .single()

  if (error || !funnel) {
    throw new Error('Funnel not found or access denied')
  }

  // Get optimization history
  const { data: history, error: historyError } = await supabase
    .from('optimization_log')
    .select('*')
    .eq('funnel_id', funnelId)
    .order('created_at', { ascending: false })
    .limit(limit)

  if (historyError) {
    throw new Error(`Failed to fetch optimization history: ${historyError.message}`)
  }

  return NextResponse.json({
    funnelId,
    history: history || [],
    totalOptimizations: history?.length || 0
  })
}

export const POST = withErrorHandling(withAuth(withRateLimit(async (request: NextRequest) => {
  const { pathname } = new URL(request.url)
  
  if (pathname.endsWith('/optimize-funnel')) {
    return optimizeFunnel(request)
  } else if (pathname.endsWith('/auto-optimize')) {
    return autoOptimize(request)
  } else if (pathname.endsWith('/generate-ab-test')) {
    return generateABTest(request)
  }
  
  throw new Error('Invalid endpoint')
})))

export const GET = withErrorHandling(withAuth(withRateLimit(getOptimizationHistory)))