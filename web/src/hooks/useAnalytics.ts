import { useState, useEffect } from 'react'
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

  const fetchAnalyticsData = async () => {
    if (!urfmp || robots.length === 0) return

    setIsLoading(true)
    setError(null)

    try {
      // Calculate fleet metrics from robots and telemetry
      const totalRobots = robots.length
      const onlineRobots = robots.filter(r => r.status === 'online').length

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
            const _latestTelemetry = await urfmp.getLatestTelemetry(robot.id)

            // Calculate metrics (using mock data for now, but could be derived from telemetry)
            const cycles = Math.floor(Math.random() * 2000) + 500 // Mock cycles
            const efficiency = Math.floor(Math.random() * 20) + 80 // 80-100%
            const uptime = Math.floor(Math.random() * 10) + 90 // 90-100%
            const powerConsumption = Math.floor(Math.random() * 200) + 50 // 50-250W
            const operatingHours = Math.floor(Math.random() * 500) + 100 // 100-600h

            return {
              robotId: robot.id,
              robotName: robot.name,
              cycles,
              efficiency,
              uptime,
              status: robot.status,
              powerConsumption,
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
      const avgEfficiency = robotPerformanceData.length > 0
        ? robotPerformanceData.reduce((sum, r) => sum + r.efficiency, 0) / robotPerformanceData.length
        : 0
      const avgUptime = robotPerformanceData.length > 0
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
  }

  const fetchAggregatedMetric = async (_metric: string, _aggregation: string, _timeWindow: string, _from: Date): Promise<{ value: number }[]> => {
    try {
      if (!urfmp) return []

      // This would use the real aggregation endpoint
      // For now, return mock data since we don't have telemetry yet
      return []
    } catch (err) {
      console.warn(`Failed to fetch aggregated metric ${_metric}:`, err)
      return []
    }
  }

  const getDaysFromTimeRange = (range: TimeRange): number => {
    switch (range) {
      case '7d': return 7
      case '30d': return 30
      case '90d': return 90
      case '1y': return 365
      default: return 30
    }
  }

  const generateFleetTrendData = (range: TimeRange): FleetTrendData[] => {
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
  }

  useEffect(() => {
    fetchAnalyticsData()
  }, [urfmp, robots, timeRange])

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