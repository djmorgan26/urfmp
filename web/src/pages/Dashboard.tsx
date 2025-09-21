import { useState } from 'react'
import {
  Activity,
  Bot,
  AlertTriangle,
  Zap,
  XCircle,
} from 'lucide-react'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts'
import { useURFMP } from '@/hooks/useURFMP'
import { useDashboard } from '@/hooks/useDashboard'
import { RobotCard } from '@/components/dashboard/RobotCard'
import { AlertFeed } from '@/components/dashboard/AlertFeed'
import { MetricCard } from '@/components/dashboard/MetricCard'
import { RealTimeAlertPanel } from '@/components/alerts/RealTimeAlertPanel'


export function Dashboard() {
  const { robots } = useURFMP()
  const {
    metrics,
    telemetryData,
    alerts,
    robotStatusDistribution,
    isLoading,
    error,
    refresh
  } = useDashboard()
  const [selectedTimeRange, setSelectedTimeRange] = useState('24h')

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex items-center space-x-2">
          <div className="spinner h-6 w-6 border-2 border-primary border-t-transparent rounded-full" />
          <span>Loading dashboard...</span>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <XCircle className="h-12 w-12 mx-auto mb-2 text-red-500" />
          <p className="text-red-600 mb-2">Error loading dashboard data</p>
          <p className="text-sm text-muted-foreground">{error}</p>
          <button
            onClick={refresh}
            className="mt-4 px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:bg-primary/90"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  // Map robot status distribution for pie chart
  const statusData = robotStatusDistribution.map(item => ({
    name: item.status.charAt(0).toUpperCase() + item.status.slice(1),
    value: item.count,
    color: item.color,
  })).filter((item) => item.value > 0)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Fleet Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Real-time monitoring and control for your robot fleet
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <select
            value={selectedTimeRange}
            onChange={(e) => setSelectedTimeRange(e.target.value)}
            className="rounded-md border border-input bg-background px-3 py-2 text-sm"
          >
            <option value="1h">Last Hour</option>
            <option value="24h">Last 24 Hours</option>
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
          </select>
          <button
            onClick={refresh}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:bg-primary/90"
          >
            Refresh
          </button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Total Robots"
          value={metrics.totalRobots.toString()}
          icon={Bot}
          trend={`${metrics.onlineRobots} online`}
          color="blue"
        />

        <MetricCard
          title="Average Temperature"
          value={`${metrics.avgTemperature}°C`}
          icon={Activity}
          trend={metrics.avgTemperature > 40 ? 'High temperature' : 'Normal range'}
          color={metrics.avgTemperature > 40 ? 'red' : 'green'}
        />

        <MetricCard
          title="Active Alerts"
          value={metrics.alertCount.toString()}
          icon={AlertTriangle}
          trend={metrics.alertCount > 0 ? `${metrics.alertCount} require attention` : 'All clear'}
          color={metrics.alertCount > 0 ? 'red' : 'green'}
        />

        <MetricCard
          title="Power Consumption"
          value={`${metrics.powerConsumption}W`}
          icon={Zap}
          trend={`${metrics.operatingHours}h operating`}
          color="blue"
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Fleet Utilization Over Time */}
        <div className="lg:col-span-2 bg-card rounded-lg border border-border p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Fleet Performance</h3>
            <div className="flex items-center space-x-4 text-sm text-muted-foreground">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 rounded-full bg-blue-500" />
                <span>Utilization</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 rounded-full bg-red-500" />
                <span>Temperature</span>
              </div>
            </div>
          </div>

          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={telemetryData}>
              <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
              <XAxis dataKey="time" />
              <YAxis yAxisId="left" />
              <YAxis yAxisId="right" orientation="right" />
              <Tooltip />
              <Line
                yAxisId="left"
                type="monotone"
                dataKey="utilization"
                stroke="#3B82F6"
                strokeWidth={2}
                dot={{ fill: '#3B82F6', strokeWidth: 2, r: 4 }}
              />
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="temperature"
                stroke="#EF4444"
                strokeWidth={2}
                dot={{ fill: '#EF4444', strokeWidth: 2, r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Fleet Status Distribution */}
        <div className="bg-card rounded-lg border border-border p-6">
          <h3 className="text-lg font-semibold mb-4">Fleet Status</h3>

          {statusData.length > 0 ? (
            <>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={statusData}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={80}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {statusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>

              <div className="space-y-2 mt-4">
                {statusData.map((item, index) => (
                  <div key={index} className="flex items-center justify-between text-sm">
                    <div className="flex items-center space-x-2">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: item.color }}
                      />
                      <span>{item.name}</span>
                    </div>
                    <span className="font-medium">{item.value}</span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="flex items-center justify-center h-48 text-muted-foreground">
              <div className="text-center">
                <Bot className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>No robots found</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Robots and Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Robot Cards */}
        <div className="lg:col-span-2 bg-card rounded-lg border border-border p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Active Robots</h3>
            <span className="text-sm text-muted-foreground">
              {metrics.onlineRobots} of {metrics.totalRobots} robots
            </span>
          </div>

          {robots.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {robots.slice(0, 6).map((robot) => (
                <RobotCard key={robot.id} robot={robot} />
              ))}
            </div>
          ) : (
            <div className="flex items-center justify-center h-48 text-muted-foreground">
              <div className="text-center">
                <Bot className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>No robots connected</p>
                <p className="text-sm">Add robots using the URFMP SDK</p>
              </div>
            </div>
          )}
        </div>

        {/* Real-time Alert System */}
        <RealTimeAlertPanel
          className="h-fit"
          showFilters={false}
          maxHeight="max-h-96"
        />
      </div>
    </div>
  )
}
