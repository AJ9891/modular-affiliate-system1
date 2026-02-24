import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { BrandBrainManager } from '@/lib/brand-brain/manager';

async function getSupabaseRouteClient() {
  const cookieStore = await cookies();
  const cookieAdapter = (() => cookieStore) as unknown as () => ReturnType<typeof cookies>;
  return createRouteHandlerClient({ cookies: cookieAdapter });
}

export async function POST(request: Request) {
  try {
    const supabase = await getSupabaseRouteClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { content, brandProfileId, contentType, funnelId, pageId } = body;

    if (!content) {
      return NextResponse.json({ error: 'Content is required' }, { status: 400 });
    }

    // Get brand profile if specified
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
      if (profile) {
        brandBrain = profile;
      }
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
      if (profile) {
        brandBrain = profile;
      }
    }

    // Validate content
    const manager = new BrandBrainManager(brandBrain);
    const validation = manager.validateContent(
      content,
      brandBrain?.id || 'default'
    );

    // Try to store validation result (table might not exist in all environments)
    let validationId = null;
    try {
      const { data: validationRecord, error: validationError } = await supabase
        .from('content_validations')
        .insert({
          brand_profile_id: brandBrain?.id || null,
          user_id: user.id,
          content_type: contentType,
          content_text: content,
          content_length: content.split(/\s+/).length,
          violations: validation.violations,
          score: validation.score,
          approved: validation.approved,
          funnel_id: funnelId || null,
          page_id: pageId || null
        })
        .select()
        .single();

      if (validationError) {
        console.warn('Could not store validation record:', validationError.message);
      } else if (validationRecord) {
        validationId = validationRecord.id;
      }
    } catch (err) {
      console.warn('Error storing validation (table may not exist):', err);
    }

    return NextResponse.json({
      validation: {
        ...validation,
        validationId: validationId
      }
    });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
