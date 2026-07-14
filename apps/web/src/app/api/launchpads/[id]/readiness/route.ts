import { NextResponse } from 'next/server'
import { LaunchpadService } from '@/features/launchpad/server/launchpad.orchestrator'
import { withRouteHandler } from '@/features/shared/api/route-handler'

async function getLaunchpadId(
  params?: Promise<Record<string, string>> | Record<string, string>
) {
  const resolved = params ? await params : {}
  if (!resolved.id) {
    const error = new Error('Missing launchpad id')
    ;(error as Error & { status?: number }).status = 400
    throw error
  }
  return resolved.id
}

export const GET = withRouteHandler(async ({ supabase, user, params }) => {
  const launchpadId = await getLaunchpadId(params)
  const launchpadService = new LaunchpadService(supabase, user!.id)
  const readiness = await launchpadService.runReadinessChecks(launchpadId)

  return NextResponse.json(readiness, {
    status: 200,
    headers: { 'Cache-Control': 'no-store' },
  })
})
