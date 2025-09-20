import { useState } from 'react'
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart,
  ComposedChart,
  Line,
} from 'recharts'
import {
  TrendingUp,
  TrendingDown,
  Activity,
  Clock,
  AlertTriangle,
  Download,
  Filter,
  Zap,
  RefreshCw,
  Users,
  Timer,
  Settings,
} from 'lucide-react'
import { useAnalytics, TimeRange } from '../hooks/useAnalytics'
import { cn } from '../lib/utils'

export function Analytics() {
  const [selectedTimeRange, setSelectedTimeRange] = useState<TimeRange>('30d')
  const [selectedMetric, setSelectedMetric] = useState('all')
  const {
    fleetMetrics,
    robotPerformance,
    fleetTrends,
    errorDistribution,
    isLoading,
    error,
    refresh,
  } = useAnalytics(selectedTimeRange)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Analytics</h1>
          <p className="text-muted-foreground mt-1">
            Performance insights and trends for your robot fleet
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <select
            value={selectedTimeRange}
            onChange={(e) => setSelectedTimeRange(e.target.value as TimeRange)}
            className="rounded-md border border-input bg-background px-3 py-2 text-sm"
          >
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
            <option value="90d">Last 90 Days</option>
            <option value="1y">Last Year</option>
          </select>

          <select
            value={selectedMetric}
            onChange={(e) => setSelectedMetric(e.target.value)}
            className="rounded-md border border-input bg-background px-3 py-2 text-sm"
          >
            <option value="all">All Metrics</option>
            <option value="utilization">Utilization</option>
            <option value="efficiency">Efficiency</option>
            <option value="power">Power Consumption</option>
            <option value="cycles">Cycle Count</option>
          </select>

          <button
            onClick={refresh}
            disabled={isLoading}
            className={cn(
              "flex items-center space-x-2 px-4 py-2 border border-input rounded-md hover:bg-muted transition-colors",
              isLoading && "opacity-50 cursor-not-allowed"
            )}
          >
            <RefreshCw className={cn("h-4 w-4", isLoading && "animate-spin")} />
            <span>{isLoading ? 'Refreshing...' : 'Refresh'}</span>
          </button>

          <button className="flex items-center space-x-2 px-4 py-2 border border-input rounded-md hover:bg-muted">
            <Download className="h-4 w-4" />
            <span>Export</span>
          </button>
        </div>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="flex items-center justify-center py-12">
          <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
          <span className="ml-2 text-muted-foreground">Loading analytics data...</span>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4 mb-6">
          <div className="flex items-center">
            <AlertTriangle className="h-5 w-5 text-destructive mr-2" />
            <span className="text-destructive font-medium">Error loading analytics data</span>
          </div>
          <p className="text-destructive/80 text-sm mt-1">{error}</p>
        </div>
      )}

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
        <div className="bg-card rounded-lg border border-border p-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium text-muted-foreground">Total Cycles</p>
            <Activity className="h-4 w-4 text-blue-600" />
          </div>
          <p className="text-3xl font-bold">{fleetMetrics.totalCycles.toLocaleString()}</p>
          <div className="flex items-center mt-2 text-sm">
            <TrendingUp className="h-4 w-4 text-green-600 mr-1" />
            <span className="text-green-600">+12.5%</span>
            <span className="text-muted-foreground ml-1">vs last month</span>
          </div>
        </div>

        <div className="bg-card rounded-lg border border-border p-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium text-muted-foreground">Avg Efficiency</p>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </div>
          <p className="text-3xl font-bold">{fleetMetrics.avgEfficiency.toFixed(1)}%</p>
          <div className="flex items-center mt-2 text-sm">
            <TrendingUp className="h-4 w-4 text-green-600 mr-1" />
            <span className="text-green-600">+2.3%</span>
            <span className="text-muted-foreground ml-1">vs last month</span>
          </div>
        </div>

        <div className="bg-card rounded-lg border border-border p-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium text-muted-foreground">Fleet Uptime</p>
            <Clock className="h-4 w-4 text-yellow-600" />
          </div>
          <p className="text-3xl font-bold">{fleetMetrics.avgUptime.toFixed(1)}%</p>
          <div className="flex items-center mt-2 text-sm">
            <TrendingDown className="h-4 w-4 text-red-600 mr-1" />
            <span className="text-red-600">-0.5%</span>
            <span className="text-muted-foreground ml-1">vs last month</span>
          </div>
        </div>

        <div className="bg-card rounded-lg border border-border p-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium text-muted-foreground">Error Rate</p>
            <AlertTriangle className="h-4 w-4 text-red-600" />
          </div>
          <p className="text-3xl font-bold">{fleetMetrics.errorRate.toFixed(1)}%</p>
          <div className="flex items-center mt-2 text-sm">
            <TrendingDown className="h-4 w-4 text-green-600 mr-1" />
            <span className="text-green-600">-0.3%</span>
            <span className="text-muted-foreground ml-1">vs last month</span>
          </div>
        </div>

        <div className="bg-card rounded-lg border border-border p-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium text-muted-foreground">Fleet Status</p>
            <Users className="h-4 w-4 text-purple-600" />
          </div>
          <p className="text-3xl font-bold">{fleetMetrics.onlineRobots}/{fleetMetrics.totalRobots}</p>
          <div className="flex items-center mt-2 text-sm">
            <span className="text-muted-foreground">robots online</span>
          </div>
        </div>

        <div className="bg-card rounded-lg border border-border p-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium text-muted-foreground">Power Usage</p>
            <Zap className="h-4 w-4 text-orange-600" />
          </div>
          <p className="text-3xl font-bold">{(fleetMetrics.totalPowerConsumption / 1000).toFixed(1)}kW</p>
          <div className="flex items-center mt-2 text-sm">
            <span className="text-muted-foreground">total consumption</span>
          </div>
        </div>
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Fleet Performance Trend */}
        <div className="bg-card rounded-lg border border-border p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Fleet Performance Trend</h3>
            <div className="flex items-center space-x-4 text-sm text-muted-foreground">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 rounded-full bg-blue-500" />
                <span>Utilization</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 rounded-full bg-green-500" />
                <span>Efficiency</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 rounded-full bg-yellow-500" />
                <span>Daily Cycles</span>
              </div>
            </div>
          </div>

          <ResponsiveContainer width="100%" height={300}>
            <ComposedChart data={fleetTrends}>
              <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
              <XAxis
                dataKey="date"
                tickFormatter={(value) => new Date(value).toLocaleDateString()}
              />
              <YAxis yAxisId="left" />
              <YAxis yAxisId="right" orientation="right" />
              <Tooltip labelFormatter={(value) => new Date(value).toLocaleDateString()} />
              <Line
                yAxisId="left"
                type="monotone"
                dataKey="utilization"
                stroke="#3B82F6"
                strokeWidth={2}
                dot={{ fill: '#3B82F6', strokeWidth: 2, r: 4 }}
              />
              <Line
                yAxisId="left"
                type="monotone"
                dataKey="efficiency"
                stroke="#10B981"
                strokeWidth={2}
                dot={{ fill: '#10B981', strokeWidth: 2, r: 4 }}
              />
              <Bar
                yAxisId="right"
                dataKey="cycleCount"
                fill="#F59E0B"
                fillOpacity={0.3}
                stroke="#F59E0B"
                strokeWidth={1}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>

        {/* Error Distribution */}
        <div className="bg-card rounded-lg border border-border p-6">
          <h3 className="text-lg font-semibold mb-4">Error Distribution</h3>

          <div className="flex items-center justify-center">
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={errorDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={40}
                  outerRadius={80}
                  paddingAngle={2}
                  dataKey="count"
                >
                  {errorDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-2 gap-2 mt-4">
            {errorDistribution.map((item, index) => (
              <div key={index} className="flex items-center justify-between text-sm">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                  <span>{item.type}</span>
                </div>
                <span className="font-medium">{item.count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Robot Performance Comparison */}
        <div className="bg-card rounded-lg border border-border p-6">
          <h3 className="text-lg font-semibold mb-4">Robot Performance Comparison</h3>

          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={robotPerformance}>
              <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
              <XAxis dataKey="robotName" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="cycles" fill="#3B82F6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Power Consumption Trend */}
        <div className="bg-card rounded-lg border border-border p-6">
          <h3 className="text-lg font-semibold mb-4">Power Consumption Trend</h3>

          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={fleetTrends}>
              <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
              <XAxis dataKey="date" tickFormatter={(value) => new Date(value).toLocaleDateString()} />
              <YAxis />
              <Tooltip labelFormatter={(value) => new Date(value).toLocaleDateString()} />
              <Area
                type="monotone"
                dataKey="powerConsumption"
                stroke="#F59E0B"
                fill="#F59E0B"
                fillOpacity={0.6}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Predictive Maintenance Section */}
      <div className="bg-card rounded-lg border border-border p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Predictive Maintenance Insights</h3>
          <Settings className="h-5 w-5 text-muted-foreground" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Maintenance Alerts */}
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-muted-foreground">Upcoming Maintenance</h4>
            <div className="space-y-2">
              <div className="flex items-center justify-between p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div>
                  <p className="text-sm font-medium">UR10e-001</p>
                  <p className="text-xs text-muted-foreground">Scheduled maintenance in 2 days</p>
                </div>
                <Timer className="h-4 w-4 text-yellow-600" />
              </div>
              <div className="flex items-center justify-between p-3 bg-red-50 border border-red-200 rounded-lg">
                <div>
                  <p className="text-sm font-medium">UR5e-003</p>
                  <p className="text-xs text-muted-foreground">Joint wear detected</p>
                </div>
                <AlertTriangle className="h-4 w-4 text-red-600" />
              </div>
            </div>
          </div>

          {/* Health Scores */}
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-muted-foreground">Robot Health Scores</h4>
            <div className="space-y-3">
              {robotPerformance.slice(0, 3).map((robot, index) => (
                <div key={index} className="flex items-center justify-between">
                  <span className="text-sm">{robot.robotName}</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-16 h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: `${robot.efficiency}%`,
                          backgroundColor: robot.efficiency > 90 ? '#10B981' : robot.efficiency > 80 ? '#F59E0B' : '#EF4444'
                        }}
                      />
                    </div>
                    <span className="text-sm font-medium">{robot.efficiency}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recommendations */}
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-muted-foreground">AI Recommendations</h4>
            <div className="space-y-2 text-sm">
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="font-medium">Optimize Power Usage</p>
                <p className="text-xs text-muted-foreground">Reduce energy consumption by 15% during off-peak hours</p>
              </div>
              <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                <p className="font-medium">Schedule Calibration</p>
                <p className="text-xs text-muted-foreground">UR5e-002 precision may benefit from recalibration</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Detailed Robot Performance Table */}
      <div className="bg-card rounded-lg border border-border p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Detailed Robot Performance</h3>
          <button className="flex items-center space-x-2 px-3 py-2 border border-input rounded-md hover:bg-muted text-sm">
            <Filter className="h-4 w-4" />
            <span>Filter</span>
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-3 px-4 font-medium text-muted-foreground">Robot</th>
                <th className="text-left py-3 px-4 font-medium text-muted-foreground">Cycles</th>
                <th className="text-left py-3 px-4 font-medium text-muted-foreground">Efficiency</th>
                <th className="text-left py-3 px-4 font-medium text-muted-foreground">Uptime</th>
                <th className="text-left py-3 px-4 font-medium text-muted-foreground">Power (W)</th>
                <th className="text-left py-3 px-4 font-medium text-muted-foreground">Operating Hours</th>
                <th className="text-left py-3 px-4 font-medium text-muted-foreground">Status</th>
              </tr>
            </thead>
            <tbody>
              {robotPerformance.map((robot, index) => (
                <tr key={index} className="border-b border-border hover:bg-muted/50">
                  <td className="py-3 px-4 font-medium">{robot.robotName}</td>
                  <td className="py-3 px-4">{robot.cycles.toLocaleString()}</td>
                  <td className="py-3 px-4">
                    <div className="flex items-center space-x-2">
                      <span>{robot.efficiency}%</span>
                      <div className="w-16 h-2 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full bg-green-500 rounded-full"
                          style={{ width: `${robot.efficiency}%` }}
                        />
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center space-x-2">
                      <span>{robot.uptime}%</span>
                      <div className="w-16 h-2 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full bg-blue-500 rounded-full"
                          style={{ width: `${robot.uptime}%` }}
                        />
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4">{robot.powerConsumption}W</td>
                  <td className="py-3 px-4">{robot.operatingHours}h</td>
                  <td className="py-3 px-4">
                    <span className={cn(
                      "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium",
                      robot.status === 'online' ? 'bg-green-100 text-green-800' :
                      robot.status === 'error' ? 'bg-red-100 text-red-800' :
                      robot.status === 'idle' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-gray-100 text-gray-800'
                    )}>
                      {robot.status.charAt(0).toUpperCase() + robot.status.slice(1)}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}