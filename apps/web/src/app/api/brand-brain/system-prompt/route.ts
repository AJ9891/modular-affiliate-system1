import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { BrandBrainManager } from '@/lib/brand-brain/manager';

export async function POST(request: Request) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { brandProfileId } = body;

    // Get brand profile
    let brandBrain = null;
    if (brandProfileId) {
      const { data: profile } = await supabase
        .from('brand_profiles')
        .select('*')
        .eq('id', brandProfileId)
        .eq('user_id', user.id)
        .single();
      
      brandBrain = profile;
    } else {
      // Get active brand profile
      const { data: profile } = await supabase
        .from('brand_profiles')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .single();
      
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
