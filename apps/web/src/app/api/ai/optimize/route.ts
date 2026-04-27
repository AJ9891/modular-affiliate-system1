import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClientCompat } from '@/lib/subdomain-auth'
import { AIOptimizer } from '@/lib/ai-optimizer'
import { withRateLimit, withErrorHandling } from '@/lib/api-middleware'
import { checkUserCanPerform, incrementUserUsage } from '@/lib/plan-manager'

type ABTestType = 'headline' | 'cta' | 'copy' | 'style'
type OptimizeAction = 'optimize-funnel' | 'auto-optimize' | 'generate-ab-test'

interface OptimizePayload {
  action?: OptimizeAction
  funnelId?: string
  timeframe?: number
  blockId?: string
  testType?: ABTestType
}

function normalizeAction(payload: OptimizePayload): OptimizeAction {
  if (payload.action) return payload.action
  if (payload.blockId && payload.testType) return 'generate-ab-test'
  if (payload.blockId) return 'auto-optimize'
  return 'optimize-funnel'
}

async function optimizeFunnel(payload: OptimizePayload) {
  const supabase = await createRouteHandlerClientCompat()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const funnelId = payload.funnelId
  const timeframe = payload.timeframe ?? 30

  if (!funnelId) {
    throw new Error('Funnel ID is required')
  }

  const { data: funnel, error } = await supabase
    .from('funnels')
    .select('funnel_id, user_id')
    .eq('funnel_id', funnelId)
    .eq('user_id', user.id)
    .single()

  if (error || !funnel) {
    throw new Error('Funnel not found or access denied')
  }

  const allowed = await checkUserCanPerform(user.id, 'maxAIGenerationsPerMonth')
  if (!allowed) {
    return NextResponse.json({ error: 'Plan limit reached for AI generations' }, { status: 402 })
  }

  const optimizer = new AIOptimizer()
  const suggestions = await optimizer.analyzeFunnelPerformance(funnelId, timeframe)
  await incrementUserUsage(user.id, 'ai_generation')

  return NextResponse.json({
    funnelId,
    suggestions,
    totalSuggestions: suggestions.length,
    highImpactSuggestions: suggestions.filter((suggestion) => suggestion.expectedLift >= 20).length,
    analysisDate: new Date().toISOString(),
  })
}

async function autoOptimize(payload: OptimizePayload) {
  const supabase = await createRouteHandlerClientCompat()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const funnelId = payload.funnelId
  const blockId = payload.blockId

  if (!funnelId || !blockId) {
    throw new Error('Funnel ID and Block ID are required')
  }

  const { data: funnel, error } = await supabase
    .from('funnels')
    .select('funnel_id, user_id, blocks')
    .eq('funnel_id', funnelId)
    .eq('user_id', user.id)
    .single()

  if (error || !funnel) {
    throw new Error('Funnel not found or access denied')
  }

  const allowed = await checkUserCanPerform(user.id, 'maxAIGenerationsPerMonth')
  if (!allowed) {
    return NextResponse.json({ error: 'Plan limit reached for AI generations' }, { status: 402 })
  }

  const optimizer = new AIOptimizer()
  const optimizedBlock = await optimizer.autoOptimizeBlock(blockId, funnelId)

  const sourceBlocks = typeof funnel.blocks === 'string' ? JSON.parse(funnel.blocks) : funnel.blocks
  const updatedBlocks = {
    ...sourceBlocks,
    blocks: (sourceBlocks.blocks || []).map((block: any) => (block.id === blockId ? optimizedBlock : block)),
  }

  const { error: updateError } = await supabase
    .from('funnels')
    .update({
      blocks: updatedBlocks,
      updated_at: new Date().toISOString(),
    })
    .eq('funnel_id', funnelId)

  if (updateError) {
    throw new Error(`Failed to update funnel: ${updateError.message}`)
  }

  await incrementUserUsage(user.id, 'ai_generation')

  return NextResponse.json({
    success: true,
    optimizedBlock,
    message: 'Block optimized successfully',
  })
}

async function generateABTest(payload: OptimizePayload) {
  const supabase = await createRouteHandlerClientCompat()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const funnelId = payload.funnelId
  const blockId = payload.blockId
  const testType = payload.testType

  if (!funnelId || !blockId || !testType) {
    throw new Error('Funnel ID, Block ID, and test type are required')
  }

  const { data: funnel, error } = await supabase
    .from('funnels')
    .select('funnel_id, user_id')
    .eq('funnel_id', funnelId)
    .eq('user_id', user.id)
    .single()

  if (error || !funnel) {
    throw new Error('Funnel not found or access denied')
  }

  const optimizer = new AIOptimizer()
  const variations = await optimizer.generateABTestVariations(funnelId, blockId, testType)

  const { data: abTest, error: testError } = await supabase
    .from('ab_tests')
    .insert({
      funnel_id: funnelId,
      user_id: user.id,
      block_id: blockId,
      test_type: testType,
      variations,
      status: 'draft',
      created_at: new Date().toISOString(),
    })
    .select()
    .single()

  if (testError) {
    throw new Error(`Failed to create A/B test: ${testError.message}`)
  }

  return NextResponse.json({
    abTest,
    variations,
    message: 'A/B test variations generated successfully',
  })
}

async function getOptimizationHistory(request: NextRequest) {
  const supabase = await createRouteHandlerClientCompat()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { searchParams } = new URL(request.url)
  const funnelId = searchParams.get('funnelId')
  const limit = Math.min(parseInt(searchParams.get('limit') || '50', 10), 100)

  if (!funnelId) {
    throw new Error('Funnel ID is required')
  }

  const { data: funnel, error } = await supabase
    .from('funnels')
    .select('funnel_id, user_id')
    .eq('funnel_id', funnelId)
    .eq('user_id', user.id)
    .single()

  if (error || !funnel) {
    throw new Error('Funnel not found or access denied')
  }

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
    totalOptimizations: history?.length || 0,
  })
}

export const POST = withErrorHandling(
  withRateLimit(async (request: NextRequest) => {
    const payload = (await request.json()) as OptimizePayload
    const action = normalizeAction(payload)

    if (action === 'auto-optimize') {
      return autoOptimize(payload)
    }

    if (action === 'generate-ab-test') {
      return generateABTest(payload)
    }

    return optimizeFunnel(payload)
  })
)

export const GET = withErrorHandling(withRateLimit(getOptimizationHistory))
