import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClientCompat } from '@/lib/subdomain-auth'
import { checkSupabase } from '@/lib/check-supabase'

export async function GET(_request: NextRequest) {
  const check = checkSupabase()
  if (check) return check
  
  try {
    const supabase = await createRouteHandlerClientCompat()
    const { data: modules, error } = await supabase!
      .from('niches')
      .select('*')

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({ modules }, { status: 200 })
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
