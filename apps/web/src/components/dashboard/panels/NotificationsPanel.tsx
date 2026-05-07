'use client'

import DashboardPanel from '@/components/cockpit/DashboardPanel'

interface NotificationItem {
  level: 'info' | 'warning' | 'success'
  message: string
}

function levelStyle(level: NotificationItem['level']) {
  if (level === 'warning') return 'instrument-status-caution'
  if (level === 'success') return 'instrument-status-ok'
  return 'instrument-status-info'
}

export default function NotificationsPanel({ notifications }: { notifications: NotificationItem[] }) {
  return (
    <DashboardPanel title="Notifications" description="System notices and optimization prompts." expandable>
      <div className="space-y-2">
        {notifications.map((notification, index) => (
          <div key={`${notification.message}-${index}`} className={`rounded-lg border px-3 py-2 text-sm ${levelStyle(notification.level)}`}>
            {notification.message}
          </div>
        ))}
      </div>
    </DashboardPanel>
  )
}
