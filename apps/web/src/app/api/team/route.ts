import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

// GET /api/team - List team members
export async function GET(request: NextRequest) {
  try {
    const accessToken = request.cookies.get('sb-access-token')?.value
    
    if (!accessToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken)
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get team members where user is the owner
    const { data: ownedTeamMembers, error: ownedError } = await supabase
      .from('team_members')
      .select('*')
      .eq('account_owner_id', user.id)
      .order('created_at', { ascending: false })

    if (ownedError) {
      return NextResponse.json({ error: ownedError.message }, { status: 500 })
    }

    // Get teams where user is a member
    const { data: memberOf, error: memberError } = await supabase
      .from('team_members')
      .select('*')
      .eq('member_user_id', user.id)
      .eq('status', 'active')
      .order('created_at', { ascending: false })

    if (memberError) {
      return NextResponse.json({ error: memberError.message }, { status: 500 })
    }

    return NextResponse.json({
      ownedTeam: ownedTeamMembers || [],
      memberOf: memberOf || [],
      isOwner: (ownedTeamMembers?.length || 0) > 0
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// POST /api/team - Invite team member
export async function POST(request: NextRequest) {
  try {
    const accessToken = request.cookies.get('sb-access-token')?.value
    
    if (!accessToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken)
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user has Agency plan
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('plan, is_admin')
      .eq('id', user.id)
      .single()

    if (userError || (!userData?.is_admin && userData?.plan !== 'agency')) {
      return NextResponse.json({ 
        error: 'Team collaboration is only available on the Agency plan' 
      }, { status: 403 })
    }

    const body = await request.json()
    const { member_email, role = 'viewer' } = body

    if (!member_email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 })
    }

    // Generate invite token
    const inviteToken = crypto.randomUUID()

    // Check if user with this email already exists
    const { data: existingUser } = await supabase
      .from('users')
      .select('id')
      .eq('email', member_email)
      .single()

    // Create team member invite
    const { data, error } = await supabase
      .from('team_members')
      .insert({
        account_owner_id: user.id,
        member_user_id: existingUser?.id || null,
        member_email: member_email,
        role: role,
        status: 'pending',
        invite_token: inviteToken
      })
      .select()
      .single()

    if (error) {
      if (error.code === '23505') { // Unique violation
        return NextResponse.json({ 
          error: 'This user is already invited or is a team member' 
        }, { status: 400 })
      }
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Send invite email via Sendshark
    try {
      const inviteLink = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3001'}/team/accept?token=${inviteToken}`
      
      const emailResponse = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3001'}/api/email/send`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: member_email,
          subject: 'You\'ve been invited to join a team on Launchpad4Success',
          html: `
            <!DOCTYPE html>
            <html>
            <head>
              <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
                .content { background: #f9f9f9; padding: 30px; }
                .button { display: inline-block; background: #667eea; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
                .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
              </style>
            </head>
            <body>
              <div class="container">
                <div class="header">
                  <h1>🚀 Team Invitation</h1>
                </div>
                <div class="content">
                  <p>Hi there!</p>
                  <p>You've been invited to join a team on <strong>Launchpad4Success</strong> as a <strong>${role}</strong>.</p>
                  <p>This gives you access to collaborate on funnels, offers, and analytics with your team.</p>
                  <p style="text-align: center;">
                    <a href="${inviteLink}" class="button">Accept Invitation</a>
                  </p>
                  <p style="font-size: 12px; color: #666;">
                    Or copy this link: <br>
                    <code style="background: #e0e0e0; padding: 5px 10px; border-radius: 3px; display: inline-block; margin-top: 5px;">${inviteLink}</code>
                  </p>
                  <p><strong>Role Permissions:</strong></p>
                  <ul>
                    ${role === 'viewer' ? '<li>View funnels and offers</li>' : ''}
                    ${role === 'editor' ? '<li>Create and edit funnels</li><li>Manage offers</li>' : ''}
                    ${role === 'admin' ? '<li>Full team access</li><li>Manage team members</li><li>Create, edit, and delete all resources</li>' : ''}
                  </ul>
                </div>
                <div class="footer">
                  <p>This invitation was sent from Launchpad4Success</p>
                  <p>If you didn't expect this invitation, you can safely ignore this email.</p>
                </div>
              </div>
            </body>
            </html>
          `
        })
      })

      if (!emailResponse.ok) {
        console.error('Failed to send invite email:', await emailResponse.text())
      }
    } catch (emailError) {
      console.error('Error sending invite email:', emailError)
      // Don't fail the invite if email fails
    }
    
    return NextResponse.json({ 
      success: true, 
      member: data,
      inviteLink: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3001'}/team/accept?token=${inviteToken}`
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// DELETE /api/team?memberId=xxx - Remove team member
export async function DELETE(request: NextRequest) {
  try {
    const accessToken = request.cookies.get('sb-access-token')?.value
    
    if (!accessToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken)
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const memberId = searchParams.get('memberId')

    if (!memberId) {
      return NextResponse.json({ error: 'Member ID is required' }, { status: 400 })
    }

    // Delete team member (must be owner)
    const { error } = await supabase
      .from('team_members')
      .delete()
      .eq('id', memberId)
      .eq('account_owner_id', user.id)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
