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
    const { content, brandProfileId, contentType, funnelId, pageId } = body;

    if (!content) {
      return NextResponse.json({ error: 'Content is required' }, { status: 400 });
    }

    // Get brand profile if specified
    let brandBrain = null;
    if (brandProfileId) {
      const { data: profile } = await supabase
        .from('brand_profiles')
        .select('*')
        .eq('id', brandProfileId)
        .eq('user_id', user.id)
        .single();
      
      if (profile) {
        brandBrain = profile;
      }
    } else {
      // Get active brand profile
      const { data: profile } = await supabase
        .from('brand_profiles')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .single();
      
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

    // Store validation result
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
      console.error('Error storing validation:', validationError);
    }

    return NextResponse.json({
      validation: {
        ...validation,
        validationId: validationRecord?.id
      }
    });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
