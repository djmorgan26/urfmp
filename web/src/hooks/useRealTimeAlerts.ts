import { useState, useEffect } from 'react'
import { useURFMP } from './useURFMP'
import { usePredictiveMaintenance } from './usePredictiveMaintenance'

export interface RealTimeAlert {
  id: string
  type: 'telemetry' | 'maintenance' | 'system' | 'geofence'
  severity: 'info' | 'warning' | 'error' | 'critical'
  robotId: string
  robotName: string
  title: string
  message: string
  timestamp: Date
  source: string
  data?: any
  acknowledged?: boolean
  dismissible?: boolean
}

export interface AlertStats {
  total: number
  critical: number
  error: number
  warning: number
  info: number
  unacknowledged: number
}

export interface UseRealTimeAlertsReturn {
  alerts: RealTimeAlert[]
  alertStats: AlertStats
  isConnected: boolean
  acknowledgeAlert: (alertId: string) => Promise<void>
  dismissAlert: (alertId: string) => void
  clearAllAlerts: () => void
  filterAlerts: (filters: AlertFilters) => RealTimeAlert[]
  subscribeToRobot: (robotId: string) => void
  unsubscribeFromRobot: (robotId: string) => void
}

export interface AlertFilters {
  severity?: ('info' | 'warning' | 'error' | 'critical')[]
  type?: ('telemetry' | 'maintenance' | 'system' | 'geofence')[]
  robotId?: string
  acknowledged?: boolean
  timeRange?: {
    start: Date
    end: Date
  }
}

export function useRealTimeAlerts(): UseRealTimeAlertsReturn {
  const { urfmp, robots, isConnected } = useURFMP()
  const { alerts: maintenanceAlerts } = usePredictiveMaintenance()
  const [alerts, setAlerts] = useState<RealTimeAlert[]>([])
  const [subscribedRobots, setSubscribedRobots] = useState<Set<string>>(new Set())

  // Initialize alerts from maintenance system
  useEffect(() => {
    const convertedAlerts: RealTimeAlert[] = maintenanceAlerts.map((alert) => ({
      id: `maint-${alert.id}`,
      type: 'maintenance' as const,
      severity:
        alert.severity === 'high'
          ? 'error'
          : alert.severity === 'critical'
            ? 'critical'
            : 'warning',
      robotId: alert.robotId,
      robotName: alert.robotName,
      title: 'Maintenance Alert',
      message: alert.description,
      timestamp: alert.createdAt,
      source: 'Predictive Maintenance',
      data: {
        component: alert.component,
        confidence: alert.confidence,
        recommendation: alert.recommendation,
      },
      acknowledged: false,
      dismissible: true,
    }))

    setAlerts((prev) => {
      // Remove old maintenance alerts and add new ones
      const nonMaintenanceAlerts = prev.filter((alert) => alert.type !== 'maintenance')
      return [...nonMaintenanceAlerts, ...convertedAlerts]
    })
  }, [maintenanceAlerts])

  // Set up WebSocket listeners for real-time telemetry alerts
  useEffect(() => {
    if (!urfmp || !isConnected) return

    const handleTelemetryUpdate = (data: any) => {
      const { robotId, telemetryData } = data
      const robot = robots.find((r) => r.id === robotId)
      if (!robot || !subscribedRobots.has(robotId)) return

      const newAlerts: RealTimeAlert[] = []
      const timestamp = new Date()

      // Temperature alerts
      if (telemetryData.temperature?.ambient > 50) {
        const severity = telemetryData.temperature.ambient > 55 ? 'critical' : 'error'
        newAlerts.push({
          id: `temp-${robotId}-${timestamp.getTime()}`,
          type: 'telemetry',
          severity,
          robotId,
          robotName: robot.name,
          title: 'High Temperature Alert',
          message: `Temperature ${telemetryData.temperature.ambient.toFixed(1)}°C exceeds safe operating range`,
          timestamp,
          source: 'Temperature Sensor',
          data: { temperature: telemetryData.temperature.ambient, threshold: 50 },
          acknowledged: false,
          dismissible: false,
        })
      }

      // Power consumption alerts
      if (telemetryData.power?.total > 200) {
        newAlerts.push({
          id: `power-${robotId}-${timestamp.getTime()}`,
          type: 'telemetry',
          severity: 'warning',
          robotId,
          robotName: robot.name,
          title: 'High Power Consumption',
          message: `Power consumption ${telemetryData.power.total.toFixed(1)}W above normal operating range`,
          timestamp,
          source: 'Power Monitor',
          data: { powerConsumption: telemetryData.power.total, threshold: 200 },
          acknowledged: false,
          dismissible: true,
        })
      }

      // Voltage alerts
      if (
        telemetryData.voltage?.supply &&
        (telemetryData.voltage.supply < 46 || telemetryData.voltage.supply > 50)
      ) {
        const severity =
          telemetryData.voltage.supply < 44 || telemetryData.voltage.supply > 52
            ? 'error'
            : 'warning'
        newAlerts.push({
          id: `voltage-${robotId}-${timestamp.getTime()}`,
          type: 'telemetry',
          severity,
          robotId,
          robotName: robot.name,
          title: 'Voltage Irregularity',
          message: `Supply voltage ${telemetryData.voltage.supply.toFixed(1)}V outside normal range (46-50V)`,
          timestamp,
          source: 'Voltage Monitor',
          data: { voltage: telemetryData.voltage.supply, normalRange: [46, 50] },
          acknowledged: false,
          dismissible: false,
        })
      }

      // Safety system alerts
      if (telemetryData.safety?.emergencyStop || telemetryData.safety?.protectiveStop) {
        newAlerts.push({
          id: `safety-${robotId}-${timestamp.getTime()}`,
          type: 'telemetry',
          severity: 'critical',
          robotId,
          robotName: robot.name,
          title: 'Safety System Activated',
          message: `${telemetryData.safety.emergencyStop ? 'Emergency stop' : 'Protective stop'} triggered`,
          timestamp,
          source: 'Safety System',
          data: {
            emergencyStop: telemetryData.safety.emergencyStop,
            protectiveStop: telemetryData.safety.protectiveStop,
          },
          acknowledged: false,
          dismissible: false,
        })
      }

      // Position accuracy alerts (GPS/calibration issues)
      if (
        telemetryData.gpsPosition?.accuracy?.horizontal &&
        telemetryData.gpsPosition.accuracy.horizontal > 10
      ) {
        newAlerts.push({
          id: `gps-${robotId}-${timestamp.getTime()}`,
          type: 'telemetry',
          severity: 'warning',
          robotId,
          robotName: robot.name,
          title: 'GPS Accuracy Warning',
          message: `GPS horizontal accuracy ${telemetryData.gpsPosition.accuracy.horizontal.toFixed(1)}m - position may be unreliable`,
          timestamp,
          source: 'GPS System',
          data: { accuracy: telemetryData.gpsPosition.accuracy.horizontal, threshold: 10 },
          acknowledged: false,
          dismissible: true,
        })
      }

      if (newAlerts.length > 0) {
        setAlerts((prev) => {
          // Remove duplicate alerts (same type and robot within last 5 minutes)
          const fiveMinutesAgo = new Date(timestamp.getTime() - 5 * 60 * 1000)
          const filteredPrev = prev.filter(
            (alert) =>
              !(
                alert.robotId === robotId &&
                alert.timestamp > fiveMinutesAgo &&
                newAlerts.some(
                  (newAlert) => newAlert.type === alert.type && newAlert.title === alert.title
                )
              )
          )
          return [...filteredPrev, ...newAlerts].slice(-100) // Keep last 100 alerts
        })
      }
    }

    const handleRobotStatusChange = (data: any) => {
      const { robotId, status, previousStatus } = data
      const robot = robots.find((r) => r.id === robotId)
      if (!robot) return

      if (status === 'error' || status === 'offline') {
        const alert: RealTimeAlert = {
          id: `status-${robotId}-${Date.now()}`,
          type: 'system',
          severity: status === 'error' ? 'error' : 'warning',
          robotId,
          robotName: robot.name,
          title: 'Robot Status Change',
          message: `Robot status changed from ${previousStatus} to ${status}`,
          timestamp: new Date(),
          source: 'System Monitor',
          data: { status, previousStatus },
          acknowledged: false,
          dismissible: true,
        }

        setAlerts((prev) => [...prev, alert].slice(-100))
      }
    }

    // Subscribe to WebSocket events
    if (urfmp && typeof urfmp.on === 'function') {
      urfmp.on('telemetry:update', handleTelemetryUpdate)
      urfmp.on('robot:status:change', handleRobotStatusChange)
    }

    return () => {
      if (urfmp && typeof urfmp.off === 'function') {
        urfmp.off('telemetry:update', handleTelemetryUpdate)
        urfmp.off('robot:status:change', handleRobotStatusChange)
      }
    }
  }, [urfmp, isConnected, robots, subscribedRobots])

  // Auto-subscribe to all robots
  useEffect(() => {
    const robotIds = robots.map((r) => r.id)
    setSubscribedRobots(new Set(robotIds))
  }, [robots])

  // Calculate alert statistics
  const alertStats: AlertStats = {
    total: alerts.length,
    critical: alerts.filter((a) => a.severity === 'critical').length,
    error: alerts.filter((a) => a.severity === 'error').length,
    warning: alerts.filter((a) => a.severity === 'warning').length,
    info: alerts.filter((a) => a.severity === 'info').length,
    unacknowledged: alerts.filter((a) => !a.acknowledged).length,
  }

  const acknowledgeAlert = async (alertId: string) => {
    setAlerts((prev) =>
      prev.map((alert) => (alert.id === alertId ? { ...alert, acknowledged: true } : alert))
    )

    // Optionally sync with backend
    try {
      if (urfmp && 'acknowledgeAlert' in urfmp && typeof (urfmp as any).acknowledgeAlert === 'function') {
        await (urfmp as any).acknowledgeAlert(alertId)
      }
    } catch (error) {
      console.warn('Failed to acknowledge alert on server:', error)
    }
  }

  const dismissAlert = (alertId: string) => {
    setAlerts((prev) => prev.filter((alert) => alert.id !== alertId))
  }

  const clearAllAlerts = () => {
    setAlerts([])
  }

  const filterAlerts = (filters: AlertFilters): RealTimeAlert[] => {
    return alerts.filter((alert) => {
      if (filters.severity && !filters.severity.includes(alert.severity)) return false
      if (filters.type && !filters.type.includes(alert.type)) return false
      if (filters.robotId && alert.robotId !== filters.robotId) return false
      if (filters.acknowledged !== undefined && alert.acknowledged !== filters.acknowledged)
        return false
      if (filters.timeRange) {
        if (alert.timestamp < filters.timeRange.start || alert.timestamp > filters.timeRange.end)
          return false
      }
      return true
    })
  }

  const subscribeToRobot = (robotId: string) => {
    setSubscribedRobots((prev) => new Set([...prev, robotId]))
  }

  const unsubscribeFromRobot = (robotId: string) => {
    setSubscribedRobots((prev) => {
      const newSet = new Set(prev)
      newSet.delete(robotId)
      return newSet
    })
  }

  return {
    alerts: alerts.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime()),
    alertStats,
    isConnected,
    acknowledgeAlert,
    dismissAlert,
    clearAllAlerts,
    filterAlerts,
    subscribeToRobot,
    unsubscribeFromRobot,
  }
}
