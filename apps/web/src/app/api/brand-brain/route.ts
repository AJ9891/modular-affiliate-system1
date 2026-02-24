import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

async function getSupabaseRouteClient() {
  const cookieStore = await cookies();
  return createRouteHandlerClient({ cookies: () => cookieStore });
}

export async function GET(request: Request) {
  const isDevelopment = process.env.NODE_ENV === 'development';
  
  try {
    if (isDevelopment) {
      console.log('[BRAND-BRAIN API] GET request initiated');
      console.log('[BRAND-BRAIN API] Request URL:', request.url);
    }

    const supabase = await getSupabaseRouteClient();
    
    // Check authentication first
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError) {
      const errorDetails = {
        message: 'Authentication error',
        error: authError,
        timestamp: new Date().toISOString(),
      };
      console.error('[BRAND-BRAIN API] Authentication error:', errorDetails);
      return NextResponse.json({ 
        error: 'Authentication failed',
        ...(isDevelopment && { debug: errorDetails })
      }, { status: 401 });
    }

    if (!user) {
      if (isDevelopment) {
        console.log('[BRAND-BRAIN API] No user found in session');
      }
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (isDevelopment) {
      console.log('[BRAND-BRAIN API] User authenticated:', user.id);
    }

    // Get query params
    const { searchParams } = new URL(request.url);
    const activeOnly = searchParams.get('active') === 'true';

    if (isDevelopment) {
      console.log('[BRAND-BRAIN API] Query params:', { activeOnly });
    }

    // Build query with error checking
    let query = supabase
      .from('brand_profiles')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (activeOnly) {
      query = query.eq('is_active', true);
    }

    const { data, error } = await query;

    if (error) {
      // Handle case where table doesn't exist (PGRST205, PGRST106)
      if (error.code === 'PGRST205' || error.code === 'PGRST106' || error.message?.includes('relation') || error.message?.includes('does not exist')) {
        return NextResponse.json({ 
          profiles: [],
          ...(isDevelopment && { debug: { note: 'brand_profiles table does not exist' } })
        });
      }
      
      // Log other actual errors
      const errorDetails = {
        message: 'Database query error',
        error: error,
        code: error.code,
        details: error.details,
        hint: error.hint,
        user_id: user.id,
        timestamp: new Date().toISOString(),
      };
      console.error('[BRAND-BRAIN API] Database error:', errorDetails);
      
      return NextResponse.json({ 
        error: error.message,
        ...(isDevelopment && { debug: errorDetails })
      }, { status: 500 });
    }

    if (isDevelopment) {
      console.log('[BRAND-BRAIN API] Successfully fetched profiles:', data?.length || 0, 'records');
    }

    return NextResponse.json({ profiles: data || [] });
  } catch (error) {
    const errorDetails = {
      message: 'Unexpected error in brand-brain API',
      error: error instanceof Error ? {
        name: error.name,
        message: error.message,
        stack: error.stack,
      } : error,
      timestamp: new Date().toISOString(),
    };
    console.error('[BRAND-BRAIN API] Unexpected error:', errorDetails);
    return NextResponse.json({ 
      error: 'Internal server error',
      ...(isDevelopment && { debug: errorDetails })
    }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const supabase = await getSupabaseRouteClient();
    
    // Check authentication first
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError) {
      console.error('Authentication error:', authError);
      return NextResponse.json({ error: 'Authentication failed' }, { status: 401 });
    }

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();

    // Extract all fields from the request body
    const {
      brand_name,
      is_active = true,
      mission,
      values,
      target_audience,
      archetype,
      voice_tone,
      voice_traits,
      formality_level,
      humor_level,
      emoji_usage,
      language_complexity,
      sentence_structure,
      voice_preference,
      jargon_policy,
      ai_system_instructions,
      ai_content_generation,
      ai_accuracy_rules,
      ai_custom_templates,
      ui_visual,
      ui_copy,
      ui_interaction,
      ui_accessibility,
      ui_expression_profile,
      sound_voice_characteristics,
      sound_word_choice,
      sound_messaging,
      sound_customer_communication,
      forbidden_legal,
      forbidden_regulatory,
      forbidden_ethics,
      forbidden_content_restrictions,
      notes
    } = body;

    // Insert new brand profile
    const { data, error } = await supabase
      .from('brand_profiles')
      .insert({
        user_id: user.id,
        brand_name,
        is_active,
        mission,
        values,
        target_audience,
        archetype,
        voice_tone,
        voice_traits,
        formality_level,
        humor_level,
        emoji_usage,
        language_complexity,
        sentence_structure,
        voice_preference,
        jargon_policy,
        ai_system_instructions,
        ai_content_generation,
        ai_accuracy_rules,
        ai_custom_templates,
        ui_visual,
        ui_copy,
        ui_interaction,
        ui_accessibility,
        ui_expression_profile,
        sound_voice_characteristics,
        sound_word_choice,
        sound_messaging,
        sound_customer_communication,
        forbidden_legal,
        forbidden_regulatory,
        forbidden_ethics,
        forbidden_content_restrictions,
        notes
      })
      .select()
      .single();

    if (error) {
      // Handle case where table doesn't exist (PGRST205, PGRST106)
      if (error.code === 'PGRST205' || error.code === 'PGRST106' || error.message?.includes('relation') || error.message?.includes('does not exist')) {
        return NextResponse.json({ 
          error: 'Brand profiles feature not available. Please run database migrations.' 
        }, { status: 503 });
      }
      
      console.error('Error creating brand profile:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ profile: data }, { status: 201 });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
