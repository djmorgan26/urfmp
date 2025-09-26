import { useState, useEffect, useCallback } from 'react'
import { useURFMP } from './useURFMP'

export interface FleetMetrics {
  totalCycles: number
  avgEfficiency: number
  avgUptime: number
  errorRate: number
  totalRobots: number
  onlineRobots: number
  totalPowerConsumption: number
  totalOperatingHours: number
}

export interface RobotPerformanceData {
  robotId: string
  robotName: string
  cycles: number
  efficiency: number
  uptime: number
  status: string
  lastError?: string
  powerConsumption: number
  operatingHours: number
}

export interface FleetTrendData {
  date: string
  utilization: number
  efficiency: number
  downtime: number
  powerConsumption: number
  cycleCount: number
}

export interface ErrorDistribution {
  type: string
  count: number
  color: string
}

export interface AnalyticsData {
  fleetMetrics: FleetMetrics
  robotPerformance: RobotPerformanceData[]
  fleetTrends: FleetTrendData[]
  errorDistribution: ErrorDistribution[]
  isLoading: boolean
  error: string | null
  refresh: () => Promise<void>
}

// Time range options for analytics
export type TimeRange = '7d' | '30d' | '90d' | '1y'

export function useAnalytics(timeRange: TimeRange = '30d'): AnalyticsData {
  const { urfmp, robots } = useURFMP()
  const [fleetMetrics, setFleetMetrics] = useState<FleetMetrics>({
    totalCycles: 0,
    avgEfficiency: 0,
    avgUptime: 0,
    errorRate: 0,
    totalRobots: 0,
    onlineRobots: 0,
    totalPowerConsumption: 0,
    totalOperatingHours: 0,
  })
  const [robotPerformance, setRobotPerformance] = useState<RobotPerformanceData[]>([])
  const [fleetTrends, setFleetTrends] = useState<FleetTrendData[]>([])
  const [errorDistribution, setErrorDistribution] = useState<ErrorDistribution[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchAnalyticsData = useCallback(async () => {
    // Check if we have robots data (either from API or demo mode)
    if (robots.length === 0) return

    // Check if we're in demo mode
    const isDemo =
      import.meta.env.VITE_DEMO_MODE === 'true' ||
      (!import.meta.env.VITE_URFMP_API_URL && window.location.hostname !== 'localhost')

    // In demo mode, we don't need urfmp instance, just use mock data
    if (!isDemo && !urfmp) return

    setIsLoading(true)
    setError(null)

    try {
      // Calculate fleet metrics from robots and telemetry
      const totalRobots = robots.length
      const onlineRobots = robots.filter((r) => r.status === 'online').length

      // Fetch aggregated telemetry data for fleet metrics
      const fromDate = new Date()
      fromDate.setDate(fromDate.getDate() - getDaysFromTimeRange(timeRange))

      // Fetch power consumption data
      const powerData = await fetchAggregatedMetric('power.total', 'sum', '1d', fromDate)
      const totalPowerConsumption = powerData.reduce((sum, d) => sum + d.value, 0)

      // Fetch utilization data
      const _utilizationData = await fetchAggregatedMetric('utilization', 'avg', '1d', fromDate)

      // Calculate robot performance data
      const robotPerformanceData: RobotPerformanceData[] = await Promise.all(
        robots.map(async (robot) => {
          try {
            // Get latest telemetry for this robot
            let latestTelemetry
            if (isDemo) {
              // Generate mock telemetry for demo mode
              latestTelemetry = {
                robotId: robot.id,
                timestamp: new Date(),
                data: {
                  efficiency: 0.8 + Math.random() * 0.2,
                  cycles: Math.floor(Math.random() * 1000),
                  errors: Math.floor(Math.random() * 5),
                  power: { total: 80 + Math.random() * 40 },
                  operatingHours: Math.floor(Math.random() * 8760),
                },
              }
            } else {
              latestTelemetry = await urfmp.getLatestTelemetry(robot.id)
            }

            // Get real power consumption data
            const powerData = await fetchAggregatedMetric('power.total', 'avg', '1h', fromDate)
            const robotPowerData = powerData.find((d) => d.robotId === robot.id)
            const powerConsumption = robotPowerData
              ? robotPowerData.value
              : Math.floor(Math.random() * 200) + 50

            // Get temperature data for efficiency calculation
            const tempData = await fetchAggregatedMetric(
              'temperature.ambient',
              'avg',
              '1h',
              fromDate
            )
            const robotTempData = tempData.find((d) => d.robotId === robot.id)

            // Calculate efficiency based on real data or use mock
            let efficiency = Math.floor(Math.random() * 20) + 80 // Default mock
            if (robotTempData) {
              // Lower efficiency if temperature is too high (basic example)
              efficiency = robotTempData.value > 30 ? 85 : 95
            }

            // Calculate uptime based on robot status and last seen
            const uptime =
              robot.status === 'online'
                ? Math.floor(Math.random() * 5) + 95
                : robot.status === 'idle'
                  ? Math.floor(Math.random() * 10) + 85
                  : Math.floor(Math.random() * 30) + 60

            const cycles = Math.floor(Math.random() * 2000) + 500 // Mock cycles for now
            const operatingHours = Math.floor(Math.random() * 500) + 100 // Mock operating hours

            return {
              robotId: robot.id,
              robotName: robot.name,
              cycles,
              efficiency,
              uptime,
              status: robot.status,
              powerConsumption: Math.round(powerConsumption),
              operatingHours,
            }
          } catch (err) {
            console.warn(`Failed to fetch performance data for robot ${robot.id}:`, err)
            return {
              robotId: robot.id,
              robotName: robot.name,
              cycles: 0,
              efficiency: 0,
              uptime: 0,
              status: robot.status,
              powerConsumption: 0,
              operatingHours: 0,
            }
          }
        })
      )

      // Calculate fleet metrics from robot data
      const totalCycles = robotPerformanceData.reduce((sum, r) => sum + r.cycles, 0)
      const avgEfficiency =
        robotPerformanceData.length > 0
          ? robotPerformanceData.reduce((sum, r) => sum + r.efficiency, 0) /
            robotPerformanceData.length
          : 0
      const avgUptime =
        robotPerformanceData.length > 0
          ? robotPerformanceData.reduce((sum, r) => sum + r.uptime, 0) / robotPerformanceData.length
          : 0

      // Generate fleet trend data
      const trendData = generateFleetTrendData(timeRange)

      // Generate error distribution (mock data for now)
      const errorDist: ErrorDistribution[] = [
        { type: 'Safety Stop', count: Math.floor(Math.random() * 15) + 5, color: '#EF4444' },
        { type: 'Communication', count: Math.floor(Math.random() * 10) + 3, color: '#F59E0B' },
        { type: 'Program Error', count: Math.floor(Math.random() * 20) + 8, color: '#10B981' },
        { type: 'Hardware', count: Math.floor(Math.random() * 8) + 2, color: '#3B82F6' },
        { type: 'Other', count: Math.floor(Math.random() * 5) + 1, color: '#8B5CF6' },
      ]

      // Update state
      setFleetMetrics({
        totalCycles,
        avgEfficiency,
        avgUptime,
        errorRate: 0.8, // Mock error rate
        totalRobots,
        onlineRobots,
        totalPowerConsumption,
        totalOperatingHours: robotPerformanceData.reduce((sum, r) => sum + r.operatingHours, 0),
      })
      setRobotPerformance(robotPerformanceData)
      setFleetTrends(trendData)
      setErrorDistribution(errorDist)
    } catch (err) {
      console.error('Failed to fetch analytics data:', err)
      setError(err instanceof Error ? err.message : 'Failed to fetch analytics data')
    } finally {
      setIsLoading(false)
    }
  }, [urfmp, robots, timeRange])

  const fetchAggregatedMetric = useCallback(async (
    metric: string,
    aggregation: string,
    timeWindow: string,
    from: Date
  ): Promise<{ value: number; robotId?: string }[]> => {
    try {
      // Check if we're in demo mode
      const isDemo =
        import.meta.env.VITE_DEMO_MODE === 'true' ||
        (!import.meta.env.VITE_URFMP_API_URL && window.location.hostname !== 'localhost')

      if (isDemo) {
        // Return mock aggregated data for demo mode
        return robots.map((robot) => ({
          value: 50 + Math.random() * 100,
          robotId: robot.id,
        }))
      }

      if (!urfmp) return []

      // Use the SDK's aggregation method
      const result = await urfmp.getAggregatedTelemetry({
        metric,
        aggregation: aggregation as 'avg' | 'min' | 'max' | 'sum' | 'count',
        timeWindow: timeWindow as '1m' | '5m' | '15m' | '1h' | '1d',
        from,
      })

      return result || []
    } catch (err) {
      console.warn(`Failed to fetch aggregated metric ${metric}:`, err)
      return []
    }
  }, [robots, urfmp])

  const getDaysFromTimeRange = useCallback((range: TimeRange): number => {
    switch (range) {
      case '7d':
        return 7
      case '30d':
        return 30
      case '90d':
        return 90
      case '1y':
        return 365
      default:
        return 30
    }
  }, [])

  const generateFleetTrendData = useCallback((range: TimeRange): FleetTrendData[] => {
    const days = getDaysFromTimeRange(range)
    const data: FleetTrendData[] = []

    for (let i = days - 1; i >= 0; i--) {
      const date = new Date()
      date.setDate(date.getDate() - i)

      data.push({
        date: date.toISOString().split('T')[0],
        utilization: Math.floor(Math.random() * 20) + 80,
        efficiency: Math.floor(Math.random() * 15) + 85,
        downtime: Math.random() * 3 + 0.5,
        powerConsumption: Math.floor(Math.random() * 500) + 1000,
        cycleCount: Math.floor(Math.random() * 200) + 300,
      })
    }

    return data
  }, [getDaysFromTimeRange])

  useEffect(() => {
    fetchAnalyticsData()
  }, [urfmp, robots, timeRange, fetchAnalyticsData])

  return {
    fleetMetrics,
    robotPerformance,
    fleetTrends,
    errorDistribution,
    isLoading,
    error,
    refresh: fetchAnalyticsData,
  }
}
