import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

// GET /api/team/accept?token=xxx - Accept team invite
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const token = searchParams.get('token')

    if (!token) {
      return NextResponse.json({ error: 'Invite token is required' }, { status: 400 })
    }

    const accessToken = request.cookies.get('sb-access-token')?.value
    
    if (!accessToken) {
      return NextResponse.json({ error: 'You must be logged in to accept invites' }, { status: 401 })
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken)
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Find the invite
    const { data: invite, error: inviteError } = await supabase
      .from('team_members')
      .select('*')
      .eq('invite_token', token)
      .eq('status', 'pending')
      .single()

    if (inviteError || !invite) {
      return NextResponse.json({ error: 'Invalid or expired invite' }, { status: 404 })
    }

    // Verify the email matches
    const { data: userData } = await supabase
      .from('users')
      .select('email')
      .eq('id', user.id)
      .single()

    if (userData?.email !== invite.member_email) {
      return NextResponse.json({ 
        error: 'This invite is for a different email address' 
      }, { status: 403 })
    }

    // Accept the invite
    const { data, error } = await supabase
      .from('team_members')
      .update({
        member_user_id: user.id,
        status: 'active',
        accepted_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', invite.id)
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Successfully joined team',
      member: data 
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// POST /api/team/accept - Accept invite (alternative method with body)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { token } = body

    if (!token) {
      return NextResponse.json({ error: 'Invite token is required' }, { status: 400 })
    }

    const accessToken = request.cookies.get('sb-access-token')?.value
    
    if (!accessToken) {
      return NextResponse.json({ error: 'You must be logged in to accept invites' }, { status: 401 })
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken)
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Find the invite
    const { data: invite, error: inviteError } = await supabase
      .from('team_members')
      .select('*')
      .eq('invite_token', token)
      .eq('status', 'pending')
      .single()

    if (inviteError || !invite) {
      return NextResponse.json({ error: 'Invalid or expired invite' }, { status: 404 })
    }

    // Verify the email matches
    const { data: userData } = await supabase
      .from('users')
      .select('email')
      .eq('id', user.id)
      .single()

    if (userData?.email !== invite.member_email) {
      return NextResponse.json({ 
        error: 'This invite is for a different email address' 
      }, { status: 403 })
    }

    // Accept the invite
    const { data, error } = await supabase
      .from('team_members')
      .update({
        member_user_id: user.id,
        status: 'active',
        accepted_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', invite.id)
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Successfully joined team',
      member: data 
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
