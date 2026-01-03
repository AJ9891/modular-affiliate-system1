import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get query params
    const { searchParams } = new URL(request.url);
    const activeOnly = searchParams.get('active') === 'true';

    // Build query
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
      console.error('Error fetching brand profiles:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ profiles: data || [] });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const { data: { user } } = await supabase.auth.getUser();

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
      console.error('Error creating brand profile:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ profile: data }, { status: 201 });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
