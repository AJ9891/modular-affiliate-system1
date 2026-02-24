import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { BrandBrainManager } from '@/lib/brand-brain/manager';

async function getSupabaseRouteClient() {
  const cookieStore = await cookies();
  return createRouteHandlerClient({ cookies: () => cookieStore });
}

export async function POST(request: Request) {
  try {
    const supabase = await getSupabaseRouteClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { brandProfileId } = body;

    // Get brand profile
    let brandBrain = null;
    if (brandProfileId) {
      const { data: profile, error: profileError } = await supabase
        .from('brand_profiles')
        .select('*')
        .eq('id', brandProfileId)
        .eq('user_id', user.id)
        .single();
      
      // Ignore no rows (PGRST116) and table not found (PGRST205, PGRST106)
      if (profileError && profileError.code !== 'PGRST116' && profileError.code !== 'PGRST205' && profileError.code !== 'PGRST106') {
        console.error('Error fetching brand profile:', profileError);
        return NextResponse.json({ error: profileError.message }, { status: 500 });
      }
      brandBrain = profile;
    } else {
      // Get active brand profile
      const { data: profile, error: profileError } = await supabase
        .from('brand_profiles')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .single();
      
      // Ignore no rows (PGRST116) and table not found (PGRST205, PGRST106)
      if (profileError && profileError.code !== 'PGRST116' && profileError.code !== 'PGRST205' && profileError.code !== 'PGRST106') {
        console.error('Error fetching active brand profile:', profileError);
        return NextResponse.json({ error: profileError.message }, { status: 500 });
      }
      brandBrain = profile;
    }

    // Generate AI system prompt
    const manager = new BrandBrainManager(brandBrain);
    const systemPrompt = manager.generateAISystemPrompt();

    return NextResponse.json({ 
      systemPrompt,
      brandProfileId: brandBrain?.id || 'default'
    });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
