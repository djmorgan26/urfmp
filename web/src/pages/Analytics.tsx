import { useState } from 'react'
import {
  BarChart,
  Bar,
  LineChart,
  Line,
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
} from 'recharts'
import {
  TrendingUp,
  TrendingDown,
  Activity,
  Clock,
  AlertTriangle,
  Download,
  Filter,
} from 'lucide-react'

const fleetPerformanceData = [
  { date: '2024-01-01', utilization: 85, efficiency: 92, downtime: 2.1 },
  { date: '2024-01-02', utilization: 88, efficiency: 94, downtime: 1.8 },
  { date: '2024-01-03', utilization: 82, efficiency: 89, downtime: 3.2 },
  { date: '2024-01-04', utilization: 91, efficiency: 96, downtime: 1.2 },
  { date: '2024-01-05', utilization: 87, efficiency: 93, downtime: 2.0 },
  { date: '2024-01-06', utilization: 89, efficiency: 95, downtime: 1.5 },
  { date: '2024-01-07', utilization: 93, efficiency: 97, downtime: 0.8 },
]

const robotPerformanceData = [
  { robot: 'UR10e-001', cycles: 1247, efficiency: 96, uptime: 99.2 },
  { robot: 'UR5e-002', cycles: 1156, efficiency: 94, uptime: 98.8 },
  { robot: 'UR3e-003', cycles: 892, efficiency: 91, uptime: 97.5 },
  { robot: 'UR10e-004', cycles: 1334, efficiency: 97, uptime: 99.5 },
  { robot: 'UR5e-005', cycles: 1089, efficiency: 93, uptime: 98.2 },
]

const errorDistributionData = [
  { type: 'Safety Stop', count: 12, color: '#EF4444' },
  { type: 'Communication', count: 8, color: '#F59E0B' },
  { type: 'Program Error', count: 15, color: '#10B981' },
  { type: 'Hardware', count: 5, color: '#3B82F6' },
  { type: 'Other', count: 3, color: '#8B5CF6' },
]

const productionTrendData = [
  { month: 'Jan', target: 10000, actual: 9850, quality: 98.5 },
  { month: 'Feb', target: 10500, actual: 10320, quality: 98.8 },
  { month: 'Mar', target: 11000, actual: 10890, quality: 98.2 },
  { month: 'Apr', target: 11500, actual: 11200, quality: 98.7 },
  { month: 'May', target: 12000, actual: 11780, quality: 98.4 },
  { month: 'Jun', target: 12500, actual: 12150, quality: 98.9 },
]

export function Analytics() {
  const [selectedTimeRange, setSelectedTimeRange] = useState('30d')
  const [selectedMetric, setSelectedMetric] = useState('all')

  const totalCycles = robotPerformanceData.reduce((sum, robot) => sum + robot.cycles, 0)
  const avgEfficiency =
    robotPerformanceData.reduce((sum, robot) => sum + robot.efficiency, 0) /
    robotPerformanceData.length
  const avgUptime =
    robotPerformanceData.reduce((sum, robot) => sum + robot.uptime, 0) / robotPerformanceData.length

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
            onChange={(e) => setSelectedTimeRange(e.target.value)}
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
            <option value="quality">Quality</option>
          </select>

          <button className="flex items-center space-x-2 px-4 py-2 border border-input rounded-md hover:bg-muted">
            <Download className="h-4 w-4" />
            <span>Export</span>
          </button>
        </div>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-card rounded-lg border border-border p-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium text-muted-foreground">Total Cycles</p>
            <Activity className="h-4 w-4 text-blue-600" />
          </div>
          <p className="text-3xl font-bold">{totalCycles.toLocaleString()}</p>
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
          <p className="text-3xl font-bold">{avgEfficiency.toFixed(1)}%</p>
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
          <p className="text-3xl font-bold">{avgUptime.toFixed(1)}%</p>
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
          <p className="text-3xl font-bold">0.8%</p>
          <div className="flex items-center mt-2 text-sm">
            <TrendingDown className="h-4 w-4 text-green-600 mr-1" />
            <span className="text-green-600">-0.3%</span>
            <span className="text-muted-foreground ml-1">vs last month</span>
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
            </div>
          </div>

          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={fleetPerformanceData}>
              <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
              <XAxis
                dataKey="date"
                tickFormatter={(value) => new Date(value).toLocaleDateString()}
              />
              <YAxis />
              <Tooltip labelFormatter={(value) => new Date(value).toLocaleDateString()} />
              <Line
                type="monotone"
                dataKey="utilization"
                stroke="#3B82F6"
                strokeWidth={2}
                dot={{ fill: '#3B82F6', strokeWidth: 2, r: 4 }}
              />
              <Line
                type="monotone"
                dataKey="efficiency"
                stroke="#10B981"
                strokeWidth={2}
                dot={{ fill: '#10B981', strokeWidth: 2, r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Error Distribution */}
        <div className="bg-card rounded-lg border border-border p-6">
          <h3 className="text-lg font-semibold mb-4">Error Distribution</h3>

          <div className="flex items-center justify-center">
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={errorDistributionData}
                  cx="50%"
                  cy="50%"
                  innerRadius={40}
                  outerRadius={80}
                  paddingAngle={2}
                  dataKey="count"
                >
                  {errorDistributionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-2 gap-2 mt-4">
            {errorDistributionData.map((item, index) => (
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
            <BarChart data={robotPerformanceData}>
              <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
              <XAxis dataKey="robot" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="cycles" fill="#3B82F6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Production Targets vs Actual */}
        <div className="bg-card rounded-lg border border-border p-6">
          <h3 className="text-lg font-semibold mb-4">Production: Target vs Actual</h3>

          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={productionTrendData}>
              <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Area
                type="monotone"
                dataKey="target"
                stackId="1"
                stroke="#94A3B8"
                fill="#94A3B8"
                fillOpacity={0.3}
              />
              <Area
                type="monotone"
                dataKey="actual"
                stackId="2"
                stroke="#10B981"
                fill="#10B981"
                fillOpacity={0.6}
              />
            </AreaChart>
          </ResponsiveContainer>
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
                <th className="text-left py-3 px-4 font-medium text-muted-foreground">
                  Efficiency
                </th>
                <th className="text-left py-3 px-4 font-medium text-muted-foreground">Uptime</th>
                <th className="text-left py-3 px-4 font-medium text-muted-foreground">
                  Last Error
                </th>
                <th className="text-left py-3 px-4 font-medium text-muted-foreground">Status</th>
              </tr>
            </thead>
            <tbody>
              {robotPerformanceData.map((robot, index) => (
                <tr key={index} className="border-b border-border hover:bg-muted/50">
                  <td className="py-3 px-4 font-medium">{robot.robot}</td>
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
                  <td className="py-3 px-4 text-sm text-muted-foreground">2h ago</td>
                  <td className="py-3 px-4">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      Running
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
