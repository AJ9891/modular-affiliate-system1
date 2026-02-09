import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data, error } = await supabase
      .from('brand_profiles')
      .select('*')
      .eq('id', params.id)
      .eq('user_id', user.id)
      .single();

    if (error) {
      // Handle table not found (PGRST205, PGRST106)
      if (error.code === 'PGRST205' || error.code === 'PGRST106') {
        return NextResponse.json({ error: 'Brand profiles feature not available' }, { status: 404 });
      }
      // Handle no rows found
      if (error.code === 'PGRST116') {
        return NextResponse.json({ error: 'Brand profile not found' }, { status: 404 });
      }
      console.error('Error fetching brand profile:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (!data) {
      return NextResponse.json({ error: 'Brand profile not found' }, { status: 404 });
    }

    return NextResponse.json({ profile: data });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();

    // Remove fields that shouldn't be updated directly
    const { id, user_id, created_at, ...updateData } = body;

    const { data, error } = await supabase
      .from('brand_profiles')
      .update(updateData)
      .eq('id', params.id)
      .eq('user_id', user.id)
      .select()
      .single();

    if (error) {
      // Handle table not found (PGRST205, PGRST106)
      if (error.code === 'PGRST205' || error.code === 'PGRST106') {
        return NextResponse.json({ error: 'Brand profiles feature not available' }, { status: 503 });
      }
      console.error('Error updating brand profile:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (!data) {
      return NextResponse.json({ error: 'Brand profile not found' }, { status: 404 });
    }

    return NextResponse.json({ profile: data });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { error } = await supabase
      .from('brand_profiles')
      .delete()
      .eq('id', params.id)
      .eq('user_id', user.id);

    if (error) {
      // Handle table not found (PGRST205, PGRST106)
      if (error.code === 'PGRST205' || error.code === 'PGRST106') {
        return NextResponse.json({ error: 'Brand profiles feature not available' }, { status: 503 });
      }
      console.error('Error deleting brand profile:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
