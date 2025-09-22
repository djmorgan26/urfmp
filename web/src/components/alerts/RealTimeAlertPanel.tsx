import { useState, useEffect } from 'react'
import {
  Bell,
  AlertTriangle,
  AlertCircle,
  Info,
  X,
  Check,
  Filter,
  Trash2,
  Settings,
  ExternalLink,
} from 'lucide-react'
import { useRealTimeAlerts, RealTimeAlert, AlertFilters } from '@/hooks/useRealTimeAlerts'
import { cn } from '@/utils/cn'
import { formatDistanceToNow } from 'date-fns'

interface RealTimeAlertPanelProps {
  className?: string
  showFilters?: boolean
  maxHeight?: string
  robotId?: string
}

const severityConfig = {
  info: {
    icon: Info,
    color: 'text-blue-600 dark:text-blue-400',
    bg: 'bg-blue-50 dark:bg-blue-950/30',
    border: 'border-blue-200 dark:border-blue-800',
    badgeColor: 'bg-blue-500 dark:bg-blue-600',
  },
  warning: {
    icon: AlertTriangle,
    color: 'text-yellow-600 dark:text-yellow-400',
    bg: 'bg-yellow-50 dark:bg-yellow-950/30',
    border: 'border-yellow-200 dark:border-yellow-800',
    badgeColor: 'bg-yellow-500 dark:bg-yellow-600',
  },
  error: {
    icon: AlertCircle,
    color: 'text-red-600 dark:text-red-400',
    bg: 'bg-red-50 dark:bg-red-950/30',
    border: 'border-red-200 dark:border-red-800',
    badgeColor: 'bg-red-500 dark:bg-red-600',
  },
  critical: {
    icon: AlertCircle,
    color: 'text-red-800 dark:text-red-300',
    bg: 'bg-red-100 dark:bg-red-950/50',
    border: 'border-red-400 dark:border-red-700',
    badgeColor: 'bg-red-700 dark:bg-red-600',
  },
}

const typeLabels = {
  telemetry: 'Telemetry',
  maintenance: 'Maintenance',
  system: 'System',
  geofence: 'Geofence',
}

export function RealTimeAlertPanel({
  className,
  showFilters = true,
  maxHeight = 'max-h-96',
  robotId,
}: RealTimeAlertPanelProps) {
  const {
    alerts,
    alertStats,
    isConnected,
    acknowledgeAlert,
    dismissAlert,
    clearAllAlerts,
    filterAlerts,
  } = useRealTimeAlerts()

  const [filters, setFilters] = useState<AlertFilters>({
    robotId,
    acknowledged: false,
  })
  const [showFiltersPanel, setShowFiltersPanel] = useState(false)

  // Update filters when robotId prop changes
  useEffect(() => {
    setFilters((prev) => ({ ...prev, robotId }))
  }, [robotId])

  const filteredAlerts = filterAlerts(filters)

  const handleSeverityFilter = (severity: 'info' | 'warning' | 'error' | 'critical') => {
    setFilters((prev) => ({
      ...prev,
      severity: prev.severity?.includes(severity)
        ? prev.severity.filter((s) => s !== severity)
        : [...(prev.severity || []), severity],
    }))
  }

  const handleTypeFilter = (type: 'telemetry' | 'maintenance' | 'system' | 'geofence') => {
    setFilters((prev) => ({
      ...prev,
      type: prev.type?.includes(type)
        ? prev.type.filter((t) => t !== type)
        : [...(prev.type || []), type],
    }))
  }

  const handleAcknowledge = async (alert: RealTimeAlert) => {
    await acknowledgeAlert(alert.id)
  }

  const handleDismiss = (alert: RealTimeAlert) => {
    if (alert.dismissible) {
      dismissAlert(alert.id)
    }
  }

  const getAlertActions = (alert: RealTimeAlert) => {
    const actions = []

    if (!alert.acknowledged) {
      actions.push(
        <button
          key="ack"
          onClick={() => handleAcknowledge(alert)}
          className="p-1 hover:bg-white rounded-full transition-colors"
          title="Acknowledge alert"
        >
          <Check className="h-4 w-4 text-green-600" />
        </button>
      )
    }

    if (alert.dismissible) {
      actions.push(
        <button
          key="dismiss"
          onClick={() => handleDismiss(alert)}
          className="p-1 hover:bg-white rounded-full transition-colors"
          title="Dismiss alert"
        >
          <X className="h-4 w-4 text-gray-600" />
        </button>
      )
    }

    return actions
  }

  return (
    <div className={cn('bg-card rounded-lg border border-border', className)}>
      {/* Header */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="relative">
              <Bell className="h-5 w-5 text-foreground" />
              <div
                className={cn(
                  'absolute -top-1 -right-1 h-3 w-3 rounded-full flex items-center justify-center',
                  isConnected ? 'bg-green-500' : 'bg-red-500'
                )}
              >
                <div className="h-1.5 w-1.5 bg-white rounded-full" />
              </div>
            </div>
            <h3 className="text-lg font-semibold">
              Real-time Alerts
              {alertStats.unacknowledged > 0 && (
                <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                  {alertStats.unacknowledged} new
                </span>
              )}
            </h3>
          </div>

          <div className="flex items-center space-x-2">
            {showFilters && (
              <button
                onClick={() => setShowFiltersPanel(!showFiltersPanel)}
                className={cn(
                  'p-2 rounded-md transition-colors',
                  showFiltersPanel ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'
                )}
                title="Filter alerts"
              >
                <Filter className="h-4 w-4" />
              </button>
            )}

            {alerts.length > 0 && (
              <button
                onClick={clearAllAlerts}
                className="p-2 hover:bg-muted rounded-md transition-colors"
                title="Clear all alerts"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>

        {/* Alert Statistics */}
        <div className="flex items-center space-x-4 mt-2 text-sm text-muted-foreground">
          <span>Total: {alertStats.total}</span>
          {alertStats.critical > 0 && (
            <span className="flex items-center space-x-1">
              <div className="w-2 h-2 rounded-full bg-red-700" />
              <span>Critical: {alertStats.critical}</span>
            </span>
          )}
          {alertStats.error > 0 && (
            <span className="flex items-center space-x-1">
              <div className="w-2 h-2 rounded-full bg-red-500" />
              <span>Error: {alertStats.error}</span>
            </span>
          )}
          {alertStats.warning > 0 && (
            <span className="flex items-center space-x-1">
              <div className="w-2 h-2 rounded-full bg-yellow-500" />
              <span>Warning: {alertStats.warning}</span>
            </span>
          )}
        </div>
      </div>

      {/* Filters Panel */}
      {showFiltersPanel && (
        <div className="p-4 border-b border-border bg-muted/30">
          <div className="space-y-3">
            {/* Severity Filters */}
            <div>
              <label className="text-sm font-medium mb-2 block">Severity</label>
              <div className="flex flex-wrap gap-2">
                {(['critical', 'error', 'warning', 'info'] as const).map((severity) => (
                  <button
                    key={severity}
                    onClick={() => handleSeverityFilter(severity)}
                    className={cn(
                      'inline-flex items-center px-3 py-1 rounded-full text-xs font-medium transition-colors',
                      filters.severity?.includes(severity)
                        ? cn(severityConfig[severity].badgeColor, 'text-white')
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    )}
                  >
                    {severity.charAt(0).toUpperCase() + severity.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            {/* Type Filters */}
            <div>
              <label className="text-sm font-medium mb-2 block">Type</label>
              <div className="flex flex-wrap gap-2">
                {(['telemetry', 'maintenance', 'system', 'geofence'] as const).map((type) => (
                  <button
                    key={type}
                    onClick={() => handleTypeFilter(type)}
                    className={cn(
                      'inline-flex items-center px-3 py-1 rounded-full text-xs font-medium transition-colors',
                      filters.type?.includes(type)
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    )}
                  >
                    {typeLabels[type]}
                  </button>
                ))}
              </div>
            </div>

            {/* Acknowledged Filter */}
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="show-acknowledged"
                checked={filters.acknowledged === undefined}
                onChange={(e) =>
                  setFilters((prev) => ({
                    ...prev,
                    acknowledged: e.target.checked ? undefined : false,
                  }))
                }
                className="rounded border-gray-300"
              />
              <label htmlFor="show-acknowledged" className="text-sm font-medium">
                Show acknowledged alerts
              </label>
            </div>
          </div>
        </div>
      )}

      {/* Alert List */}
      <div className={cn('overflow-y-auto', maxHeight)}>
        {filteredAlerts.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground">
            <Bell className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p>No alerts match your filters</p>
            {!isConnected && (
              <p className="text-sm mt-1 text-red-600">Disconnected from real-time updates</p>
            )}
          </div>
        ) : (
          <div className="divide-y divide-border">
            {filteredAlerts.map((alert) => {
              const config = severityConfig[alert.severity]
              const Icon = config.icon

              return (
                <div
                  key={alert.id}
                  className={cn(
                    'p-4 transition-colors hover:bg-muted/50',
                    alert.acknowledged && 'opacity-60'
                  )}
                >
                  <div className="flex items-start space-x-3">
                    {/* Severity Icon */}
                    <div
                      className={cn(
                        'flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center',
                        config.bg,
                        config.border,
                        'border'
                      )}
                    >
                      <Icon className={cn('h-4 w-4', config.color)} />
                    </div>

                    {/* Alert Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-1">
                            <h4 className="text-sm font-medium text-foreground">{alert.title}</h4>
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
                              {typeLabels[alert.type]}
                            </span>
                            {alert.acknowledged && (
                              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700">
                                Acknowledged
                              </span>
                            )}
                          </div>

                          <p className="text-sm text-muted-foreground mb-2">{alert.message}</p>

                          <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                            <span className="font-medium">{alert.robotName}</span>
                            <span>{alert.source}</span>
                            <span>{formatDistanceToNow(alert.timestamp, { addSuffix: true })}</span>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center space-x-1 ml-4">
                          {getAlertActions(alert)}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Connection Status */}
      {!isConnected && (
        <div className="p-3 border-t border-border bg-red-50 text-red-700 text-sm">
          <div className="flex items-center space-x-2">
            <AlertTriangle className="h-4 w-4" />
            <span>Disconnected from real-time updates. Attempting to reconnect...</span>
          </div>
        </div>
      )}
    </div>
  )
}
