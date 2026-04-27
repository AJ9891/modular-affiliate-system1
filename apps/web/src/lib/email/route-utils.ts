import type { NextRequest } from 'next/server'
import { createSubdomainRouteHandlerClient } from '@/lib/subdomain-auth'

const upstreamEmailErrorPattern =
  /\b(ses|smtp|provider|mailbox|dns|network|socket|timeout|timed?\s*out|refused|unreachable|fetch failed)\b/i

export function resolveEmailErrorStatus(message: string): number {
  return upstreamEmailErrorPattern.test(message) ? 502 : 500
}

export async function getOptionalAuthenticatedUserId(request: NextRequest): Promise<string | null> {
  try {
    const supabase = await createSubdomainRouteHandlerClient(request)
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser()

    if (error || !user) return null
    return user.id
  } catch {
    return null
  }
}
