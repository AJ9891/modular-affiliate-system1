import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClientCompat } from '@/lib/subdomain-auth'
import { withRateLimit, withErrorHandling } from '@/lib/api-middleware'
import { getRouteUser } from '@/lib/auth/session'
import { resolveTeamScope } from '@/lib/team/service'

// GET /api/team/activity - Get team activity log
async function getTeamActivity(request: NextRequest) {
  const supabase = await createRouteHandlerClientCompat()
  const { user, response } = await getRouteUser(supabase)
  if (!user) return response!
  const scope = await resolveTeamScope(supabase, user.id)
  
  const { searchParams } = new URL(request.url)
  const limit = Math.min(parseInt(searchParams.get('limit') || '50'), 100)
  const page = parseInt(searchParams.get('page') || '1')
  const offset = (page - 1) * limit
  const resourceType = searchParams.get('resourceType') // Optional filter
  const startDate = searchParams.get('startDate')
  const endDate = searchParams.get('endDate')

  let query = supabase
    .from('team_activity_log')
    .select(`
      *,
      user:users!team_activity_log_user_id_fkey(
        subdomain,
        email
      )
    `)
    .eq('team_id', scope.ownerId)
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1)

  // Apply filters
  if (resourceType) {
    query = query.eq('resource_type', resourceType)
  }

  if (startDate) {
    query = query.gte('created_at', startDate)
  }

  if (endDate) {
    query = query.lte('created_at', endDate)
  }

  const { data: activities, error } = await query

  if (error) {
    throw new Error(`Failed to fetch team activities: ${error.message}`)
  }

  // Get total count for pagination
  const { count, error: countError } = await supabase
    .from('team_activity_log')
    .select('*', { count: 'exact', head: true })
    .eq('team_id', scope.ownerId)

  if (countError) {
    throw new Error(`Failed to get activity count: ${countError.message}`)
  }

  return NextResponse.json({
    activities: activities || [],
    pagination: {
      total: count || 0,
      page,
      limit,
      totalPages: Math.ceil((count || 0) / limit)
    }
  })
}

// POST /api/team/activity - Log team activity
async function logTeamActivity(request: NextRequest) {
  const supabase = await createRouteHandlerClientCompat()
  const { user, response } = await getRouteUser(supabase)
  if (!user) return response!
  
  const { action, resourceType, resourceId, description } = await request.json()

  if (!action || !resourceType) {
    throw new Error('Action and resourceType are required')
  }

  const scope = await resolveTeamScope(supabase, user.id)

  // Log the activity
  const { data: activity, error } = await supabase
    .from('team_activity_log')
    .insert({
      team_id: scope.ownerId,
      user_id: user.id,
      action,
      resource_type: resourceType,
      resource_id: resourceId,
      description: description || generateActivityDescription(action, resourceType, resourceId)
    })
    .select()
    .single()

  if (error) {
    throw new Error(`Failed to log activity: ${error.message}`)
  }

  return NextResponse.json({ activity })
}

// Helper function to generate activity descriptions
function generateActivityDescription(action: string, resourceType: string, resourceId?: string): string {
  const resourceName = resourceId ? `${resourceType} ${resourceId}` : resourceType

  const descriptions: Record<string, string> = {
    'created': `Created ${resourceName}`,
    'updated': `Updated ${resourceName}`,
    'deleted': `Deleted ${resourceName}`,
    'published': `Published ${resourceName}`,
    'unpublished': `Unpublished ${resourceName}`,
    'duplicated': `Duplicated ${resourceName}`,
    'archived': `Archived ${resourceName}`,
    'restored': `Restored ${resourceName}`,
    'shared': `Shared ${resourceName}`,
    'viewed': `Viewed ${resourceName}`,
    'downloaded': `Downloaded ${resourceName}`,
    'invited': 'Invited team member',
    'joined': 'Joined team',
    'left': 'Left team',
    'role_changed': 'Changed team member role'
  }

  return descriptions[action] || `${action} ${resourceName}`
}

export const GET = withErrorHandling(withRateLimit(getTeamActivity, { requests: 60, window: 60 }))
export const POST = withErrorHandling(withRateLimit(logTeamActivity, { requests: 30, window: 60 }))
