import { useState, useEffect } from 'react'
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import {
  Activity,
  Thermometer,
  Zap,
  Gauge,
  TrendingUp,
  AlertTriangle,
  Download,
  RefreshCw,
} from 'lucide-react'
import { useURFMP } from '@/hooks/useURFMP'
import { cn } from '@/utils/cn'
import { formatDistanceToNow } from 'date-fns'

interface TelemetryDashboardProps {
  robotId: string
  className?: string
}

interface MetricCard {
  title: string
  value: string | number
  unit?: string
  trend?: number
  icon: React.ComponentType<any>
  color: string
  data?: any[]
}

const timeRangeOptions = [
  { value: '1h', label: 'Last Hour' },
  { value: '6h', label: 'Last 6 Hours' },
  { value: '24h', label: 'Last 24 Hours' },
  { value: '7d', label: 'Last 7 Days' },
  { value: '30d', label: 'Last 30 Days' },
]

const aggregationOptions = [
  { value: 'avg', label: 'Average' },
  { value: 'min', label: 'Minimum' },
  { value: 'max', label: 'Maximum' },
  { value: 'sum', label: 'Total' },
  { value: 'count', label: 'Count' },
]

export function TelemetryDashboard({ robotId, className }: TelemetryDashboardProps) {
  const { urfmp } = useURFMP()
  const [isLoading, setIsLoading] = useState(false)
  const [selectedTimeRange, setSelectedTimeRange] = useState('24h')
  const [selectedAggregation, setSelectedAggregation] = useState('avg')
  const [telemetryData, setTelemetryData] = useState<any[]>([])
  const [availableMetrics, setAvailableMetrics] = useState<string[]>([])
  const [latestTelemetry, setLatestTelemetry] = useState<any>(null)
  const [metrics, setMetrics] = useState<MetricCard[]>([])

  useEffect(() => {
    if (urfmp && robotId) {
      loadTelemetryData()
      loadAvailableMetrics()
      loadLatestTelemetry()
    }
  }, [
    urfmp,
    robotId,
    selectedTimeRange,
    selectedAggregation,
    loadTelemetryData,
    loadAvailableMetrics,
    loadLatestTelemetry,
  ])

  const loadTelemetryData = async () => {
    // Check if we're in demo mode
    const isDemo =
      import.meta.env.VITE_DEMO_MODE === 'true' ||
      (!import.meta.env.VITE_URFMP_API_URL && window.location.hostname !== 'localhost')

    if (!isDemo && !urfmp) return

    setIsLoading(true)
    try {
      let history
      if (isDemo) {
        // Generate mock telemetry history for demo mode
        history = []
        for (let i = 0; i < 24; i++) {
          history.push({
            robotId,
            timestamp: new Date(Date.now() - i * 60 * 60 * 1000),
            data: {
              temperature: { ambient: 20 + Math.random() * 15 },
              power: { total: 80 + Math.random() * 40 },
              position: {
                x: 125 + Math.random() * 10,
                y: 245 + Math.random() * 10,
                z: 300 + Math.random() * 5,
              },
              voltage: { supply: 48 + Math.random() * 2 },
              current: { total: 2 + Math.random() * 0.5 },
            },
          })
        }
      } else {
        const from = getTimeRangeDate(selectedTimeRange)
        history = await urfmp.getTelemetryHistory(robotId, {
          from,
          to: new Date(),
          limit: 1000,
        })
      }

      setTelemetryData(history)
    } catch (error) {
      console.error('Failed to load telemetry data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const loadAvailableMetrics = async () => {
    // Check if we're in demo mode
    const isDemo =
      import.meta.env.VITE_DEMO_MODE === 'true' ||
      (!import.meta.env.VITE_URFMP_API_URL && window.location.hostname !== 'localhost')

    if (!isDemo && !urfmp) return

    try {
      let metrics
      if (isDemo) {
        // Mock available metrics for demo mode
        metrics = ['temperature', 'power', 'position', 'voltage', 'current', 'speed', 'force']
      } else {
        metrics = await urfmp.getTelemetryMetrics(robotId)
      }
      setAvailableMetrics(metrics)
    } catch (error) {
      console.error('Failed to load available metrics:', error)
    }
  }

  const loadLatestTelemetry = async () => {
    // Check if we're in demo mode
    const isDemo =
      import.meta.env.VITE_DEMO_MODE === 'true' ||
      (!import.meta.env.VITE_URFMP_API_URL && window.location.hostname !== 'localhost')

    if (!isDemo && !urfmp) return

    try {
      let latest
      if (isDemo) {
        // Mock latest telemetry for demo mode
        latest = {
          robotId,
          timestamp: new Date(),
          data: {
            temperature: { ambient: 25.3, controller: 35.7 },
            power: { total: 103.5 },
            position: { x: 125.5, y: 245.8, z: 300.2 },
            voltage: { supply: 48.2 },
            current: { total: 2.15 },
            speed: { linear: 0.5, angular: 0.1 },
            force: { tcp: 12.5 },
          },
        }
      } else {
        latest = await urfmp.getLatestTelemetry(robotId)
      }
      setLatestTelemetry(latest)

      if (latest?.data) {
        updateMetricsCards(latest.data)
      }
    } catch (error) {
      console.error('Failed to load latest telemetry:', error)
    }
  }

  const updateMetricsCards = (data: any) => {
    const newMetrics: MetricCard[] = []

    // Temperature metrics
    if (data.temperature?.ambient !== undefined) {
      newMetrics.push({
        title: 'Ambient Temperature',
        value: data.temperature.ambient.toFixed(1),
        unit: data.temperature.unit,
        icon: Thermometer,
        color: 'text-red-600',
        trend: calculateTrend('temperature.ambient'),
      })
    }

    // Power metrics
    if (data.voltage?.supply !== undefined) {
      newMetrics.push({
        title: 'Supply Voltage',
        value: data.voltage.supply.toFixed(1),
        unit: data.voltage.unit,
        icon: Zap,
        color: 'text-yellow-600',
        trend: calculateTrend('voltage.supply'),
      })
    }

    if (data.current?.total !== undefined) {
      newMetrics.push({
        title: 'Total Current',
        value: data.current.total.toFixed(2),
        unit: data.current.unit,
        icon: Activity,
        color: 'text-blue-600',
        trend: calculateTrend('current.total'),
      })
    }

    if (data.power?.total !== undefined) {
      newMetrics.push({
        title: 'Power Consumption',
        value: data.power.total.toFixed(1),
        unit: data.power.unit,
        icon: Gauge,
        color: 'text-green-600',
        trend: calculateTrend('power.total'),
      })
    }

    // Safety status
    if (data.safety) {
      const safetyScore = calculateSafetyScore(data.safety)
      newMetrics.push({
        title: 'Safety Status',
        value: safetyScore,
        unit: '%',
        icon: safetyScore === 100 ? Activity : AlertTriangle,
        color: safetyScore === 100 ? 'text-green-600' : 'text-red-600',
      })
    }

    setMetrics(newMetrics)
  }

  const calculateTrend = (metricName: string): number => {
    // Calculate trend from recent telemetry data
    // This is a simplified implementation
    const recentData = telemetryData.slice(-10)
    if (recentData.length < 2) return 0

    const firstValue = getMetricValue(recentData[0], metricName)
    const lastValue = getMetricValue(recentData[recentData.length - 1], metricName)

    if (firstValue === null || lastValue === null) return 0

    return ((lastValue - firstValue) / firstValue) * 100
  }

  const getMetricValue = (telemetry: any, metricName: string): number | null => {
    const parts = metricName.split('.')
    let value = telemetry.data

    for (const part of parts) {
      if (value && typeof value === 'object' && part in value) {
        value = value[part]
      } else {
        return null
      }
    }

    return typeof value === 'number' ? value : null
  }

  const calculateSafetyScore = (safety: any): number => {
    const checks = [
      !safety.emergencyStop,
      !safety.protectiveStop,
      !safety.reducedMode,
      !safety.safetyZoneViolation,
    ]

    const passedChecks = checks.filter(Boolean).length
    return Math.round((passedChecks / checks.length) * 100)
  }

  const getTimeRangeDate = (range: string): Date => {
    const now = new Date()
    switch (range) {
      case '1h':
        return new Date(now.getTime() - 60 * 60 * 1000)
      case '6h':
        return new Date(now.getTime() - 6 * 60 * 60 * 1000)
      case '24h':
        return new Date(now.getTime() - 24 * 60 * 60 * 1000)
      case '7d':
        return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
      case '30d':
        return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
      default:
        return new Date(now.getTime() - 24 * 60 * 60 * 1000)
    }
  }

  const formatChartData = (metricName: string) => {
    return telemetryData
      .map((item) => {
        const value = getMetricValue(item, metricName)
        return value !== null
          ? {
              timestamp: item.timestamp,
              value,
              time: new Date(item.timestamp).toLocaleTimeString(),
            }
          : null
      })
      .filter(Boolean)
      .slice(-50) // Last 50 data points for performance
  }

  return (
    <div className={cn('space-y-6', className)}>
      {/* Header Controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Telemetry Dashboard</h2>
          <p className="text-muted-foreground">
            Real-time metrics and historical data for robot performance monitoring
          </p>
        </div>

        <div className="flex items-center gap-2">
          <select
            value={selectedTimeRange}
            onChange={(e) => setSelectedTimeRange(e.target.value)}
            className="rounded-md border border-input bg-background px-3 py-2 text-sm"
          >
            {timeRangeOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>

          <select
            value={selectedAggregation}
            onChange={(e) => setSelectedAggregation(e.target.value)}
            className="rounded-md border border-input bg-background px-3 py-2 text-sm"
          >
            {aggregationOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>

          <button
            onClick={loadTelemetryData}
            disabled={isLoading}
            className="p-2 rounded-md border border-input hover:bg-muted disabled:opacity-50"
          >
            <RefreshCw className={cn('h-4 w-4', isLoading && 'animate-spin')} />
          </button>

          <button className="p-2 rounded-md border border-input hover:bg-muted">
            <Download className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        {metrics.map((metric, index) => {
          const Icon = metric.icon
          return (
            <div key={index} className="bg-card rounded-lg border border-border p-4">
              <div className="flex items-center justify-between mb-2">
                <Icon className={cn('h-5 w-5', metric.color)} />
                {metric.trend !== undefined && (
                  <div
                    className={cn(
                      'flex items-center text-xs',
                      metric.trend > 0
                        ? 'text-green-600'
                        : metric.trend < 0
                          ? 'text-red-600'
                          : 'text-gray-600'
                    )}
                  >
                    <TrendingUp className="h-3 w-3 mr-1" />
                    {metric.trend > 0 ? '+' : ''}
                    {metric.trend.toFixed(1)}%
                  </div>
                )}
              </div>
              <div className="space-y-1">
                <h3 className="text-sm font-medium text-muted-foreground">{metric.title}</h3>
                <div className="flex items-baseline space-x-1">
                  <span className="text-2xl font-bold">{metric.value}</span>
                  {metric.unit && (
                    <span className="text-sm text-muted-foreground">{metric.unit}</span>
                  )}
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Temperature Chart */}
        {availableMetrics.includes('temperature.ambient') && (
          <div className="bg-card rounded-lg border border-border p-6">
            <h3 className="text-lg font-semibold mb-4">Temperature Trends</h3>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={formatChartData('temperature.ambient')}>
                <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                <XAxis dataKey="time" />
                <YAxis />
                <Tooltip />
                <Area
                  type="monotone"
                  dataKey="value"
                  stroke="#EF4444"
                  fill="#EF4444"
                  fillOpacity={0.1}
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Power Consumption Chart */}
        {availableMetrics.includes('power.total') && (
          <div className="bg-card rounded-lg border border-border p-6">
            <h3 className="text-lg font-semibold mb-4">Power Consumption</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={formatChartData('power.total')}>
                <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                <XAxis dataKey="time" />
                <YAxis />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke="#10B981"
                  strokeWidth={2}
                  dot={{ fill: '#10B981', strokeWidth: 2, r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Voltage Chart */}
        {availableMetrics.includes('voltage.supply') && (
          <div className="bg-card rounded-lg border border-border p-6">
            <h3 className="text-lg font-semibold mb-4">Supply Voltage</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={formatChartData('voltage.supply')}>
                <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                <XAxis dataKey="time" />
                <YAxis />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke="#F59E0B"
                  strokeWidth={2}
                  dot={{ fill: '#F59E0B', strokeWidth: 2, r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Current Chart */}
        {availableMetrics.includes('current.total') && (
          <div className="bg-card rounded-lg border border-border p-6">
            <h3 className="text-lg font-semibold mb-4">Current Draw</h3>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={formatChartData('current.total')}>
                <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                <XAxis dataKey="time" />
                <YAxis />
                <Tooltip />
                <Area
                  type="monotone"
                  dataKey="value"
                  stroke="#3B82F6"
                  fill="#3B82F6"
                  fillOpacity={0.1}
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* Telemetry Info */}
      {latestTelemetry && (
        <div className="bg-card rounded-lg border border-border p-6">
          <h3 className="text-lg font-semibold mb-4">Latest Telemetry Data</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Last Update</p>
              <p className="font-medium">
                {formatDistanceToNow(new Date(latestTelemetry.timestamp), { addSuffix: true })}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">Available Metrics</p>
              <p className="font-medium">{availableMetrics.length} metrics</p>
            </div>
            <div className="md:col-span-2">
              <p className="text-sm text-muted-foreground mb-2">Metric Types</p>
              <div className="flex flex-wrap gap-2">
                {availableMetrics.slice(0, 10).map((metric) => (
                  <span key={metric} className="px-2 py-1 bg-muted rounded-md text-xs font-medium">
                    {metric}
                  </span>
                ))}
                {availableMetrics.length > 10 && (
                  <span className="px-2 py-1 bg-muted rounded-md text-xs font-medium">
                    +{availableMetrics.length - 10} more
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Empty State */}
      {!isLoading && telemetryData.length === 0 && (
        <div className="bg-card rounded-lg border border-border p-12 text-center">
          <Activity className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
          <h3 className="text-lg font-semibold mb-2">No Telemetry Data</h3>
          <p className="text-muted-foreground mb-4">
            No telemetry data found for the selected time range.
          </p>
          <p className="text-sm text-muted-foreground">
            Start sending telemetry data from your robot to see real-time metrics and charts.
          </p>
        </div>
      )}
    </div>
  )
}
