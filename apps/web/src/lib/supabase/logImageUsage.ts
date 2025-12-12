import { SupabaseClient } from '@supabase/supabase-js'

interface ImageUsageData {
  prompt?: string | null
  model?: string | null
  provider?: string | null
  cost?: number
  externalId?: string | null
  cached?: boolean
  details?: Record<string, any>
  action?: string | null
}

export async function logImageUsage(supabase: SupabaseClient, data: ImageUsageData) {
  const { data: result, error } = await supabase.rpc("log_image_usage", {
    p_prompt: data.prompt ?? null,
    p_model: data.model ?? null,
    p_provider: data.provider ?? null,
    p_cost: data.cost ?? 0,
    p_external_id: data.externalId ?? null,
    p_cached: data.cached ?? false,
    p_details: data.details ?? {},
    p_action: data.action ?? null,
  })

  if (error) {
    console.error("Error logging image usage:", error)
    throw error
  }

  return result
}
