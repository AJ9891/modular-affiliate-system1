# Team Collaboration Feature

## Overview
The team collaboration feature allows Agency plan users to invite team members and collaborate on funnels and offers.

## Features Implemented

### 1. Database Schema
- **team_members** table with roles (owner, admin, editor, viewer)
- **team_activity_log** for tracking changes
- Team support added to funnels and offers tables
- Row Level Security (RLS) policies for permission enforcement

### 2. API Endpoints

#### GET /api/team
Lists team members for the authenticated user
- Returns owned team members
- Returns teams user is a member of

#### POST /api/team
Invites a new team member
- Requires Agency plan
- Sends email invitation
- Generates unique invite token

#### PATCH /api/team/[memberId]
Updates team member role
- Owner/Admin only
- Changes between viewer, editor, admin

#### DELETE /api/team?memberId=xxx
Removes team member
- Owner only
- Cascades to remove access

#### GET/POST /api/team/accept
Accepts team invitation
- Validates invite token
- Verifies email match
- Activates membership

#### GET /api/team/activity
Retrieves team activity log
- Shows recent changes
- Includes user actions on funnels/offers

### 3. User Interface

#### /team - Team Management Page
- Invite team members with email and role
- View pending and active members
- Update member roles
- Remove team members
- Copy invite links
- View teams you're part of

#### /team/accept - Accept Invitation Page
- Processes invite tokens
- Handles login redirect if needed
- Shows success/error states

#### Dashboard Integration
- Shows team member count
- Quick link to team management
- Displays team context

### 4. Permissions

**Role Capabilities:**

- **Owner** (Account holder)
  - Full account access
  - Invite/remove members
  - Manage billing
  - All funnel/offer operations

- **Admin**
  - Invite/remove members
  - Full funnel/offer access
  - Cannot manage billing

- **Editor**
  - Create/edit funnels
  - Manage offers
  - View analytics

- **Viewer**
  - View-only access
  - See funnels and offers
  - View analytics

### 5. Email Notifications

Automated email sent on team invitation:
- Beautiful HTML template
- Role description
- One-click accept link
- Manual token option

### 6. Security

- Row Level Security (RLS) on all tables
- Token-based invitations
- Email verification
- Plan verification (Agency only)
- Audit logging of all actions

## Setup Instructions

### 1. Run Database Migration

```bash
# In Supabase SQL Editor, run:
/infra/migrations/add_team_collaboration.sql
```

This creates:
- team_members table
- team_activity_log table
- Adds team_id columns to funnels/offers
- Sets up RLS policies
- Creates activity logging triggers

### 2. Environment Variables

Ensure these are set:
```env
NEXT_PUBLIC_APP_URL=https://yourdomain.com  # For invite links
```

### 3. Test the Feature

1. **Upgrade to Agency Plan** (or manually set plan in database)
2. **Navigate to /team**
3. **Invite a team member** with their email
4. **Copy the invite link** (in production, email is sent)
5. **Send link to team member**
6. **They accept** and can collaborate

## Usage Examples

### Inviting a Team Member

```javascript
// POST /api/team
{
  "member_email": "colleague@example.com",
  "role": "editor"
}
```

### Updating Member Role

```javascript
// PATCH /api/team/[memberId]
{
  "role": "admin"
}
```

### Checking Team Access

The database RLS policies automatically enforce permissions:
- Viewers can SELECT
- Editors can INSERT/UPDATE
- Admins can DELETE
- All changes logged to activity_log

## Future Enhancements

### Potential Features:
1. **Sendshark Integration** - Actual email delivery
2. **Team Analytics** - Per-member performance
3. **Granular Permissions** - Funnel-level access control
4. **Team Workspaces** - Separate environments
5. **Activity Feed** - Real-time collaboration updates
6. **Slack/Discord Notifications** - Team activity alerts
7. **API Keys** - Team-level API access
8. **Sub-teams** - Hierarchical organization

## Database Activity Logging

All team actions are automatically logged:

```sql
SELECT * FROM team_activity_log 
WHERE team_id = 'user-id'
ORDER BY created_at DESC
LIMIT 50;
```

Logs include:
- Who performed the action
- What was changed (INSERT/UPDATE/DELETE)
- When it happened
- Full before/after state

## Troubleshooting

### Invite not working?
- Check user has Agency plan
- Verify email is valid
- Check invite token hasn't expired
- Ensure user is logged in when accepting

### Permission denied?
- Verify RLS policies are enabled
- Check user role in team_members table
- Ensure team_id is set on resources

### Email not sending?
- Currently emails use /api/email/send endpoint
- Check email service configuration
- Invite link still shown in UI as fallback

## API Response Examples

### Successful Invite
```json
{
  "success": true,
  "member": {
    "id": "uuid",
    "member_email": "user@example.com",
    "role": "editor",
    "status": "pending"
  },
  "inviteLink": "https://app.com/team/accept?token=xxx"
}
```

### Team List
```json
{
  "ownedTeam": [
    {
      "id": "uuid",
      "member_email": "member@example.com",
      "role": "editor",
      "status": "active",
      "accepted_at": "2025-12-06T10:30:00Z"
    }
  ],
  "memberOf": [],
  "isOwner": true
}
```

## Navigation

Team management is accessible from:
- Sidebar: 👥 Team link
- Dashboard: Team info banner (when active)
- Direct URL: `/team`

## Benefits

✅ **Agency Plan Value** - Justifies higher pricing tier
✅ **Collaboration** - Multiple people can work together
✅ **Security** - Role-based access control
✅ **Audit Trail** - Full activity logging
✅ **Scalability** - Support multiple teams per user
✅ **User Experience** - Simple invite flow
