import { NextResponse } from 'next/server'
import { withRouteHandler } from '@/features/shared/api/route-handler'
import { readJson } from '@/lib/http'
import { createLaunchpadFromRequest } from '@/features/launchpad/server/launchpad.service'

export const POST = withRouteHandler(async ({ request, user }) => {
  const body = await readJson<Record<string, unknown>>(request)
  const launchpad = await createLaunchpadFromRequest(user!, body)

  return NextResponse.json(
    {
      success: true,
      ...launchpad,
    },
    { status: 201 }
  )
})
