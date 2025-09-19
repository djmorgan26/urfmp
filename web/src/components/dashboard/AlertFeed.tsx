import { AlertTriangle, Info, AlertCircle } from 'lucide-react'
import { cn } from '@/utils/cn'
import { formatDistanceToNow, parseISO } from 'date-fns'

interface Alert {
  id: string
  type: string
  robot: string
  message: string
  timestamp: Date
  severity: 'info' | 'warning' | 'error'
}

interface AlertFeedProps {
  alerts: Alert[]
}

const severityConfig = {
  info: {
    icon: Info,
    color: 'text-blue-600',
    bg: 'bg-blue-50',
    border: 'border-blue-200',
  },
  warning: {
    icon: AlertTriangle,
    color: 'text-yellow-600',
    bg: 'bg-yellow-50',
    border: 'border-yellow-200',
  },
  error: {
    icon: AlertCircle,
    color: 'text-red-600',
    bg: 'bg-red-50',
    border: 'border-red-200',
  },
}

export function AlertFeed({ alerts }: AlertFeedProps) {
  if (alerts.length === 0) {
    return (
      <div className="flex h-32 items-center justify-center text-muted-foreground">
        <div className="text-center">
          <AlertTriangle className="mx-auto mb-2 h-8 w-8 opacity-50" />
          <p className="text-sm">No alerts</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {alerts.map((alert) => {
        const config = severityConfig[alert.severity]
        const Icon = config.icon

        return (
          <div
            key={alert.id}
            className={cn(
              'rounded-lg border p-3 transition-colors hover:shadow-sm',
              config.bg,
              config.border
            )}
          >
            <div className="flex items-start space-x-3">
              <div
                className={cn(
                  'mt-0.5 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-white',
                  config.border
                )}
              >
                <Icon className={cn('h-3 w-3', config.color)} />
              </div>

              <div className="min-w-0 flex-1">
                <div className="mb-1 flex items-center justify-between">
                  <p className="truncate text-sm font-medium text-foreground">{alert.robot}</p>
                  <span className="flex-shrink-0 text-xs text-muted-foreground">
                    {formatDistanceToNow(
                      typeof alert.timestamp === 'string'
                        ? parseISO(alert.timestamp)
                        : alert.timestamp,
                      { addSuffix: true }
                    )}
                  </span>
                </div>

                <p className="text-sm text-muted-foreground">{alert.message}</p>
              </div>
            </div>
          </div>
        )
      })}

      {alerts.length > 5 && (
        <button className="w-full py-2 text-center text-sm text-muted-foreground hover:text-foreground">
          View all alerts
        </button>
      )}
    </div>
  )
}
