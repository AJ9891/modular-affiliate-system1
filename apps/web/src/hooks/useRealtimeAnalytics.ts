'use client'

import { useEffect, useState, useCallback } from 'react'

export interface RealtimeAnalyticsData {
  todayLeads: number
  todayClicks: number
  todayConversions: number
  timestamp: string
}

export interface RealtimeEvent {
  type: 'connected' | 'new_lead' | 'new_click' | 'new_conversion' | 'stats_update'
  data?: any
  timestamp: string
  userId?: string
}

export function useRealtimeAnalytics() {
  const [data, setData] = useState<RealtimeAnalyticsData>({
    todayLeads: 0,
    todayClicks: 0,
    todayConversions: 0,
    timestamp: new Date().toISOString()
  })
  
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'disconnected' | 'error'>('disconnected')
  const [lastEvent, setLastEvent] = useState<RealtimeEvent | null>(null)

  const connect = useCallback(() => {
    if (connectionStatus === 'connected' || connectionStatus === 'connecting') {
      return
    }

    setConnectionStatus('connecting')

    const eventSource = new EventSource('/api/analytics/realtime')

    eventSource.onopen = () => {
      setConnectionStatus('connected')
      console.log('✅ Real-time analytics connected')
    }

    eventSource.onmessage = (event) => {
      try {
        const eventData: RealtimeEvent = JSON.parse(event.data)
        setLastEvent(eventData)

        switch (eventData.type) {
          case 'connected':
            console.log('Real-time analytics session started')
            break

          case 'new_lead':
            setData(prev => ({
              ...prev,
              todayLeads: prev.todayLeads + 1,
              timestamp: eventData.timestamp
            }))
            console.log('📧 New lead captured!', eventData.data)
            break

          case 'new_click':
            setData(prev => ({
              ...prev,
              todayClicks: prev.todayClicks + 1,
              timestamp: eventData.timestamp
            }))
            console.log('👆 New click tracked!', eventData.data)
            break

          case 'new_conversion':
            setData(prev => ({
              ...prev,
              todayConversions: prev.todayConversions + 1,
              timestamp: eventData.timestamp
            }))
            console.log('💰 New conversion!', eventData.data)
            break

          case 'stats_update':
            setData(prev => ({
              ...prev,
              ...eventData.data,
              timestamp: eventData.timestamp
            }))
            break
        }
      } catch (error) {
        console.error('Error parsing real-time event:', error)
      }
    }

    eventSource.onerror = (error) => {
      console.error('Real-time analytics connection error:', error)
      setConnectionStatus('error')
      eventSource.close()
      
      // Attempt to reconnect after 5 seconds
      setTimeout(() => {
        if (connectionStatus !== 'connected') {
          connect()
        }
      }, 5000)
    }

    // Cleanup function
    return () => {
      eventSource.close()
      setConnectionStatus('disconnected')
    }
  }, [connectionStatus])

  // Auto-connect on mount
  useEffect(() => {
    const cleanup = connect()
    return cleanup
  }, [connect])

  // Periodic reconnection for reliability
  useEffect(() => {
    const interval = setInterval(() => {
      if (connectionStatus === 'error' || connectionStatus === 'disconnected') {
        connect()
      }
    }, 30000) // Try to reconnect every 30 seconds

    return () => clearInterval(interval)
  }, [connectionStatus, connect])

  return {
    data,
    connectionStatus,
    lastEvent,
    connect,
    disconnect: () => {
      setConnectionStatus('disconnected')
    }
  }
}

// Component for displaying real-time connection status
export function RealtimeStatus({ connectionStatus }: { connectionStatus: string }) {
  const getStatusColor = () => {
    switch (connectionStatus) {
      case 'connected': return 'text-green-500'
      case 'connecting': return 'text-yellow-500'
      case 'error': return 'text-red-500'
      default: return 'text-gray-500'
    }
  }

  const getStatusIcon = () => {
    switch (connectionStatus) {
      case 'connected': return '🟢'
      case 'connecting': return '🟡'
      case 'error': return '🔴'
      default: return '⚪'
    }
  }

  return (
    <div className={`flex items-center gap-2 text-sm ${getStatusColor()}`}>
      <span>{getStatusIcon()}</span>
      <span className="capitalize">{connectionStatus}</span>
      {connectionStatus === 'connected' && (
        <span className="text-xs text-gray-500">Live</span>
      )}
    </div>
  )
}

// Notification component for new events
export function RealtimeNotifications({ lastEvent }: { lastEvent: RealtimeEvent | null }) {
  const [notifications, setNotifications] = useState<RealtimeEvent[]>([])

  useEffect(() => {
    if (lastEvent && ['new_lead', 'new_click', 'new_conversion'].includes(lastEvent.type)) {
      setNotifications(prev => [lastEvent, ...prev.slice(0, 4)]) // Keep last 5 notifications
      
      // Auto-remove notification after 5 seconds
      setTimeout(() => {
        setNotifications(prev => prev.filter(n => n.timestamp !== lastEvent.timestamp))
      }, 5000)
    }
  }, [lastEvent])

  if (notifications.length === 0) return null

  return (
    <div className="fixed top-20 right-4 z-50 space-y-2">
      {notifications.map((notification, index) => (
        <div 
          key={notification.timestamp}
          className="bg-white border-l-4 border-blue-500 rounded-lg shadow-lg p-3 max-w-sm animate-slide-in-right"
          style={{ opacity: 1 - (index * 0.2) }}
        >
          <div className="flex items-center gap-2">
            <span className="text-lg">
              {notification.type === 'new_lead' && '📧'}
              {notification.type === 'new_click' && '👆'}
              {notification.type === 'new_conversion' && '💰'}
            </span>
            <div>
              <p className="font-medium text-gray-900">
                {notification.type === 'new_lead' && 'New Lead!'}
                {notification.type === 'new_click' && 'New Click!'}
                {notification.type === 'new_conversion' && 'New Conversion!'}
              </p>
              <p className="text-xs text-gray-500">
                {new Date(notification.timestamp).toLocaleTimeString()}
              </p>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}