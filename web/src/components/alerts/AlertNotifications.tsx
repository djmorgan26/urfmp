import { useEffect, useState } from 'react'
import { X, AlertTriangle, AlertCircle, Info, Bell } from 'lucide-react'
import { useRealTimeAlerts, RealTimeAlert } from '@/hooks/useRealTimeAlerts'
import { cn } from '@/utils/cn'
import { formatDistanceToNow } from 'date-fns'

interface AlertNotification extends RealTimeAlert {
  isVisible: boolean
  showTimestamp?: boolean
}

const severityConfig = {
  info: {
    icon: Info,
    color: 'text-blue-600 dark:text-blue-400',
    bg: 'bg-blue-50 dark:bg-blue-950/30',
    border: 'border-blue-200 dark:border-blue-800',
    accent: 'border-l-blue-500 dark:border-l-blue-400'
  },
  warning: {
    icon: AlertTriangle,
    color: 'text-yellow-600 dark:text-yellow-400',
    bg: 'bg-yellow-50 dark:bg-yellow-950/30',
    border: 'border-yellow-200 dark:border-yellow-800',
    accent: 'border-l-yellow-500 dark:border-l-yellow-400'
  },
  error: {
    icon: AlertCircle,
    color: 'text-red-600 dark:text-red-400',
    bg: 'bg-red-50 dark:bg-red-950/30',
    border: 'border-red-200 dark:border-red-800',
    accent: 'border-l-red-500 dark:border-l-red-400'
  },
  critical: {
    icon: AlertCircle,
    color: 'text-red-800 dark:text-red-300',
    bg: 'bg-red-100 dark:bg-red-950/50',
    border: 'border-red-400 dark:border-red-700',
    accent: 'border-l-red-700 dark:border-l-red-600'
  }
}

export interface AlertNotificationsProps {
  // Props are now optional as settings come from useAlertNotificationSettings
}

export function AlertNotifications(props: AlertNotificationsProps = {}) {
  const { settings } = useAlertNotificationSettings()

  // Use settings from hook, fallback to defaults
  const {
    position = 'top-right',
    maxNotifications = 5,
    autoHideDuration = 8000,
    showOnlyCritical = false,
    enableSound = true,
    enabled = true
  } = settings
  const { alerts } = useRealTimeAlerts()
  const [notifications, setNotifications] = useState<AlertNotification[]>([])
  const [lastProcessedAlert, setLastProcessedAlert] = useState<string | null>(null)

  // Process new alerts and create notifications
  useEffect(() => {
    const newAlerts = alerts.filter(alert => {
      // Skip if we've already processed this alert
      if (lastProcessedAlert && alert.id <= lastProcessedAlert) return false

      // Filter based on preferences
      if (showOnlyCritical && alert.severity !== 'critical') return false

      // Don't show notifications for acknowledged alerts
      if (alert.acknowledged) return false

      return true
    })

    if (newAlerts.length > 0) {
      const newNotifications: AlertNotification[] = newAlerts.map(alert => ({
        ...alert,
        isVisible: true,
        showTimestamp: true
      }))

      setNotifications(prev => {
        const updated = [...newNotifications, ...prev].slice(0, maxNotifications)
        return updated
      })

      // Play notification sound for critical alerts
      if (enableSound && newAlerts.some(alert => alert.severity === 'critical' || alert.severity === 'error')) {
        playNotificationSound()
      }

      // Update last processed alert
      if (newAlerts.length > 0) {
        setLastProcessedAlert(newAlerts[0].id)
      }
    }
  }, [alerts, lastProcessedAlert, showOnlyCritical, enableSound, maxNotifications])

  // Auto-hide notifications
  useEffect(() => {
    if (autoHideDuration > 0) {
      const timers = notifications.map((notification, index) => {
        // Don't auto-hide critical alerts
        if (notification.severity === 'critical') return null

        return setTimeout(() => {
          hideNotification(notification.id)
        }, autoHideDuration + (index * 500)) // Stagger hiding
      })

      return () => {
        timers.forEach(timer => timer && clearTimeout(timer))
      }
    }
  }, [notifications, autoHideDuration])

  const playNotificationSound = () => {
    try {
      // Create a simple notification sound using Web Audio API
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
      const oscillator = audioContext.createOscillator()
      const gainNode = audioContext.createGain()

      oscillator.connect(gainNode)
      gainNode.connect(audioContext.destination)

      oscillator.frequency.setValueAtTime(800, audioContext.currentTime)
      oscillator.frequency.setValueAtTime(600, audioContext.currentTime + 0.1)

      gainNode.gain.setValueAtTime(0.1, audioContext.currentTime)
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2)

      oscillator.start(audioContext.currentTime)
      oscillator.stop(audioContext.currentTime + 0.2)
    } catch (error) {
      console.warn('Could not play notification sound:', error)
    }
  }

  const hideNotification = (notificationId: string) => {
    setNotifications(prev =>
      prev.map(notif =>
        notif.id === notificationId ? { ...notif, isVisible: false } : notif
      )
    )

    // Remove from DOM after animation
    setTimeout(() => {
      setNotifications(prev => prev.filter(notif => notif.id !== notificationId))
    }, 300)
  }

  const dismissNotification = (notificationId: string) => {
    hideNotification(notificationId)
  }

  const getPositionClasses = () => {
    switch (position) {
      case 'top-left':
        return 'top-4 left-4'
      case 'bottom-right':
        return 'bottom-4 right-4'
      case 'bottom-left':
        return 'bottom-4 left-4'
      default:
        return 'top-4 right-4'
    }
  }

  // Don't render if notifications are disabled or no notifications to show
  if (!enabled || notifications.length === 0) return null

  return (
    <div className={cn('fixed z-50 space-y-2', getPositionClasses())}>
      {notifications.map((notification) => {
        const config = severityConfig[notification.severity]
        const Icon = config.icon

        return (
          <div
            key={notification.id}
            className={cn(
              'w-80 rounded-lg border-l-4 border shadow-lg transition-all duration-300 transform',
              config.bg,
              config.border,
              config.accent,
              notification.isVisible
                ? 'translate-x-0 opacity-100'
                : position.includes('right')
                ? 'translate-x-full opacity-0'
                : '-translate-x-full opacity-0'
            )}
          >
            <div className="p-4">
              <div className="flex items-start space-x-3">
                {/* Icon */}
                <div className="flex-shrink-0">
                  <Icon className={cn('h-5 w-5', config.color)} />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <h4 className="text-sm font-medium text-foreground">
                      {notification.title}
                    </h4>
                    <button
                      onClick={() => dismissNotification(notification.id)}
                      className="flex-shrink-0 p-1 hover:bg-white/50 dark:hover:bg-gray-700/50 rounded-full transition-colors"
                    >
                      <X className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                    </button>
                  </div>

                  <p className="text-sm text-muted-foreground mb-2">
                    {notification.message}
                  </p>

                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span className="font-medium">{notification.robotName}</span>
                    {notification.showTimestamp && (
                      <span>
                        {formatDistanceToNow(notification.timestamp, { addSuffix: true })}
                      </span>
                    )}
                  </div>

                  {/* Severity indicator */}
                  <div className="mt-2 flex items-center space-x-2">
                    <span className={cn(
                      'inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium',
                      notification.severity === 'critical' ? 'bg-red-700 dark:bg-red-800 text-white' :
                      notification.severity === 'error' ? 'bg-red-500 dark:bg-red-600 text-white' :
                      notification.severity === 'warning' ? 'bg-yellow-600 dark:bg-yellow-700 text-white' :
                      'bg-blue-500 dark:bg-blue-600 text-white'
                    )}>
                      {notification.severity.charAt(0).toUpperCase() + notification.severity.slice(1)}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {notification.source}
                    </span>
                  </div>
                </div>
              </div>

              {/* Progress bar for auto-hide (non-critical alerts) */}
              {notification.severity !== 'critical' && autoHideDuration > 0 && (
                <div className="mt-3 h-1 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gray-400 dark:bg-gray-500 transition-all duration-linear"
                    style={{
                      animation: `shrink ${autoHideDuration}ms linear forwards`
                    }}
                  />
                </div>
              )}
            </div>
          </div>
        )
      })}

      <style jsx>{`
        @keyframes shrink {
          from { width: 100%; }
          to { width: 0%; }
        }
      `}</style>
    </div>
  )
}

// Global notification settings hook
export function useAlertNotificationSettings() {
  const [settings, setSettings] = useState({
    enabled: true,
    position: 'top-right' as const,
    maxNotifications: 5,
    autoHideDuration: 8000,
    showOnlyCritical: false,
    enableSound: true
  })

  const updateSettings = (newSettings: Partial<typeof settings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }))
    // Persist to localStorage
    localStorage.setItem('alertNotificationSettings', JSON.stringify({ ...settings, ...newSettings }))
  }

  // Load settings from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('alertNotificationSettings')
    if (saved) {
      try {
        const parsed = JSON.parse(saved)
        setSettings(prev => ({ ...prev, ...parsed }))
      } catch (error) {
        console.warn('Failed to load notification settings:', error)
      }
    }
  }, [])

  return { settings, updateSettings }
}