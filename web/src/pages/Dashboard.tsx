import { useState, useEffect } from 'react'
import {
  Activity,
  Bot,
  AlertTriangle,
  TrendingUp,
  Zap,
  Clock,
  CheckCircle,
  XCircle,
} from 'lucide-react'
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
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
import { RobotCard } from '@/components/dashboard/RobotCard'
import { AlertFeed } from '@/components/dashboard/AlertFeed'
import { MetricCard } from '@/components/dashboard/MetricCard'
import { cn } from '@/utils/cn'

const mockTelemetryData = [
  { time: '00:00', temperature: 42, utilization: 85, errors: 0 },
  { time: '04:00', temperature: 45, utilization: 78, errors: 1 },
  { time: '08:00', temperature: 48, utilization: 92, errors: 0 },
  { time: '12:00', temperature: 52, utilization: 88, errors: 2 },
  { time: '16:00', temperature: 49, utilization: 95, errors: 1 },
  { time: '20:00', temperature: 46, utilization: 82, errors: 0 },
]

const mockAlerts = [
  {
    id: '1',
    type: 'warning',
    robot: 'UR10e-001',
    message: 'High temperature detected (52°C)',
    timestamp: new Date(Date.now() - 10 * 60 * 1000),
    severity: 'warning' as const,
  },
  {
    id: '2',
    type: 'error',
    robot: 'UR5e-002',
    message: 'Protective stop triggered',
    timestamp: new Date(Date.now() - 25 * 60 * 1000),
    severity: 'error' as const,
  },
  {
    id: '3',
    type: 'info',
    robot: 'UR3e-003',
    message: 'Maintenance scheduled for tomorrow',
    timestamp: new Date(Date.now() - 45 * 60 * 1000),
    severity: 'info' as const,
  },
]

const statusColors = {
  running: '#10B981',
  idle: '#6B7280',
  offline: '#EF4444',
  maintenance: '#F59E0B',
}

export function Dashboard() {
  const { robots, isLoading, refreshRobots } = useURFMP()
  const [selectedTimeRange, setSelectedTimeRange] = useState('24h')

  useEffect(() => {
    const interval = setInterval(() => {
      refreshRobots()
    }, 30000) // Refresh every 30 seconds

    return () => clearInterval(interval)
  }, [refreshRobots])

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

  const activeRobots = robots.filter((r) => r.status === 'running' || r.status === 'online').length
  const totalRobots = robots.length
  const errorRobots = robots.filter((r) => r.status === 'error').length
  const offlineRobots = robots.filter((r) => r.status === 'offline').length

  // Calculate fleet utilization (mock calculation)
  const fleetUtilization = totalRobots > 0 ? (activeRobots / totalRobots) * 100 : 0

  // Status distribution for pie chart
  const statusData = [
    {
      name: 'Running',
      value: robots.filter((r) => r.status === 'running').length,
      color: statusColors.running,
    },
    {
      name: 'Idle',
      value: robots.filter((r) => r.status === 'idle').length,
      color: statusColors.idle,
    },
    { name: 'Offline', value: offlineRobots, color: statusColors.offline },
    {
      name: 'Maintenance',
      value: robots.filter((r) => r.status === 'maintenance').length,
      color: statusColors.maintenance,
    },
  ].filter((item) => item.value > 0)

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
            onClick={refreshRobots}
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
          value={totalRobots.toString()}
          icon={Bot}
          trend="+2 this week"
          color="blue"
        />

        <MetricCard
          title="Active Now"
          value={activeRobots.toString()}
          icon={CheckCircle}
          trend={`${fleetUtilization.toFixed(1)}% utilization`}
          color="green"
        />

        <MetricCard
          title="Alerts"
          value={mockAlerts.length.toString()}
          icon={AlertTriangle}
          trend={errorRobots > 0 ? `${errorRobots} critical` : 'All clear'}
          color={errorRobots > 0 ? 'red' : 'yellow'}
        />

        <MetricCard
          title="Uptime"
          value="99.2%"
          icon={TrendingUp}
          trend="+0.3% vs last month"
          color="green"
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
            <LineChart data={mockTelemetryData}>
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
              {activeRobots} of {totalRobots} robots
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

        {/* Alert Feed */}
        <div className="bg-card rounded-lg border border-border p-6">
          <h3 className="text-lg font-semibold mb-4">Recent Alerts</h3>
          <AlertFeed alerts={mockAlerts} />
        </div>
      </div>
    </div>
  )
}
