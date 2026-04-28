import { NextResponse } from 'next/server'
import type { SupabaseClient, User } from '@supabase/supabase-js'

type AuthResult = {
  user: User | null
  response?: NextResponse
}

export async function getRouteUser(
  supabase: SupabaseClient,
  unauthenticatedMessage = 'Unauthorized'
): Promise<AuthResult> {
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  if (user) {
    return { user }
  }

  if (error) {
    console.error('Route auth error:', error.message)
  }

  return {
    user: null,
    response: NextResponse.json({ error: unauthenticatedMessage }, { status: 401 }),
  }
}
