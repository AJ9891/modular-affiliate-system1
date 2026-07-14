import { supabase } from '@/lib/supabase'
import type { Launchpad, LaunchpadStage } from '../domain/launchpad.types'

export async function getLaunchpad(id: string): Promise<Launchpad> {
  const { data, error } = await supabase
    .from('launchpads')
    .select('*')
    .eq('id', id)
    .single()

  if (error) {
    throw new Error(`Unable to load launchpad: ${error.message}`)
  }

  return data as Launchpad
}

export async function updateLaunchpadStage({
  id,
  expectedStage,
  nextStage,
  offerId,
  funnelId,
}: {
  id: string
  expectedStage: LaunchpadStage
  nextStage: LaunchpadStage
  offerId?: string
  funnelId?: string
}): Promise<Launchpad> {
  const { data, error } = await supabase.rpc('advance_launchpad_stage', {
    p_launchpad_id: id,
    p_expected_stage: expectedStage,
    p_next_stage: nextStage,
    p_offer_id: offerId ?? null,
    p_funnel_id: funnelId ?? null,
  })

  if (error) {
    throw new Error(`Unable to update launchpad stage: ${error.message}`)
  }

  return data as Launchpad
}
