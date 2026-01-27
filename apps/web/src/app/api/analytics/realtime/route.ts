import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

// Server-Sent Events for real-time analytics updates
export async function GET(request: NextRequest) {
  const supabase = createRouteHandlerClient({ cookies })
  
  // Check authentication
  const { data: { user }, error } = await supabase.auth.getUser()
  if (error || !user) {
    return new NextResponse('Unauthorized', { status: 401 })
  }

  const encoder = new TextEncoder()
  
  const customReadable = new ReadableStream({
    start(controller) {
      // Send initial connection message
      const data = encoder.encode(`data: ${JSON.stringify({ 
        type: 'connected',
        timestamp: new Date().toISOString(),
        userId: user.id 
      })}\n\n`)
      controller.enqueue(data)

      // Set up real-time subscription to analytics changes
      const subscription = supabase
        .channel(`analytics_${user.id}`)
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'leads',
            filter: `user_id=eq.${user.id}`
          },
          (payload) => {
            const message = encoder.encode(`data: ${JSON.stringify({
              type: 'new_lead',
              data: payload.new,
              timestamp: new Date().toISOString()
            })}\n\n`)
            controller.enqueue(message)
          }
        )
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'clicks',
            filter: `user_id=eq.${user.id}`
          },
          (payload) => {
            const message = encoder.encode(`data: ${JSON.stringify({
              type: 'new_click',
              data: payload.new,
              timestamp: new Date().toISOString()
            })}\n\n`)
            controller.enqueue(message)
          }
        )
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'conversions'
          },
          (payload) => {
            const message = encoder.encode(`data: ${JSON.stringify({
              type: 'new_conversion',
              data: payload.new,
              timestamp: new Date().toISOString()
            })}\n\n`)
            controller.enqueue(message)
          }
        )
        .subscribe()

      // Send periodic heartbeat and stats updates
      const interval = setInterval(async () => {
        try {
          // Get quick stats for real-time updates
          const today = new Date().toISOString().split('T')[0]
          
          const [leadsResult, clicksResult] = await Promise.all([
            supabase
              .from('leads')
              .select('id', { count: 'exact', head: true })
              .gte('created_at', today),
            supabase
              .from('clicks')
              .select('id', { count: 'exact', head: true })
              .gte('clicked_at', today)
          ])

          const stats = {
            todayLeads: leadsResult.count || 0,
            todayClicks: clicksResult.count || 0,
            timestamp: new Date().toISOString()
          }

          const message = encoder.encode(`data: ${JSON.stringify({
            type: 'stats_update',
            data: stats,
            timestamp: new Date().toISOString()
          })}\n\n`)
          
          controller.enqueue(message)
        } catch (error) {
          console.error('Real-time stats update error:', error)
        }
      }, 30000) // Update every 30 seconds

      // Cleanup when connection closes
      request.signal.addEventListener('abort', () => {
        clearInterval(interval)
        subscription.unsubscribe()
        controller.close()
      })
    }
  })

  return new NextResponse(customReadable, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET',
      'Access-Control-Allow-Headers': 'Cache-Control',
    },
  })
}