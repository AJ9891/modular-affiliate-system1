import { type NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { PLAN_IDS, isPlanId, type PlanId } from '@contracts/plans'

export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { plan } = await req.json() as { plan?: PlanId }
    
    if (!isPlanId(plan)) {
      return NextResponse.json({ error: 'Invalid plan' }, { status: 400 })
    }

    const updatePayload =
      plan === 'free'
        ? { plan: null as string | null, plan_tier: 'free' }
        : { plan, plan_tier: plan }

    const { error } = await supabase
      .from('users')
      .update(updatePayload)
      .eq('id', user.id)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, plan })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function GET(req: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: profile, error } = await supabase
      .from('users')
      .select('plan, plan_tier, launchpad_stage')
      .eq('id', user.id)
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    const plan = (profile?.plan ??
      profile?.plan_tier ??
      'free') as PlanId

    const normalizedPlan = isPlanId(plan) ? plan : PLAN_IDS[0]

    return NextResponse.json({
      plan: normalizedPlan,
      launchpad_stage: profile?.launchpad_stage ?? null,
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
