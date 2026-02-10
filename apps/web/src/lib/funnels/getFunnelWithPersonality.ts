import { createServerClient } from '@/lib/supabase-server';
import { getBrandPersonality } from '@/lib/ai-generator';
import { BrandModeId } from '@/lib/ai-generator';

export async function getFunnelWithPersonality(funnelId: string) {
  const supabase = await createServerClient();

  const { data: funnel, error } = await supabase
    .from('funnels')
    .select('*')
    .eq('funnel_id', funnelId)
    .single();

  if (error || !funnel) {
    throw new Error('Funnel not found');
  }

  // Default to 'rocket_future' if brand_mode is not set
  const brandMode = (funnel.brand_mode as BrandModeId) || 'rocket_future';
  const personality = getBrandPersonality(brandMode);

  return {
    funnel,
    personality,
  };
}
