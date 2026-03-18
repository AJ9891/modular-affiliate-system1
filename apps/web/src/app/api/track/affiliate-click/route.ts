import { NextRequest } from 'next/server'
import { createServiceRoleClient } from '@/lib/supabase-server'
import { validateAffiliateClick } from '@/lib/validators/affiliate'
import { error, ok, readJson } from '@/lib/http'

export async function POST(req: NextRequest) {
  try {
    const supabase = createServiceRoleClient()

    const { user_id, partner, source, metadata } = validateAffiliateClick(await readJson(req))

    const { data, error } = await supabase
      .from('affiliate_clicks')
      .insert({
        user_id: user_id || null,
        partner,
        source: source || 'unknown',
        metadata: metadata || {},
      })
      .select()
      .single()

    if (error) {
      throw error
    }

    return ok({ success: true, click: data })
  } catch (err: any) {
    console.error('Affiliate click tracking error:', err)
    return error(err)
  }
}
