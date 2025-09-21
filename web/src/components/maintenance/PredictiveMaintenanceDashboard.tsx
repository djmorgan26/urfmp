import { useState } from 'react'
import {
  AlertTriangle,
  Calendar,
  DollarSign,
  Activity,
  CheckCircle,
  XCircle,
  AlertCircle,
  Settings,
  Filter
} from 'lucide-react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart as RechartsPieChart,
  Pie,
  Cell
} from 'recharts'
import { usePredictiveMaintenance } from '../../hooks/usePredictiveMaintenance'
import { cn } from '../../lib/utils'

export function PredictiveMaintenanceDashboard() {
  const [selectedSeverity, setSelectedSeverity] = useState<string>('all')
  const {
    alerts,
    schedule,
    componentHealth,
    insights,
    isLoading,
    error,
    refresh
  } = usePredictiveMaintenance()

  const filteredAlerts = alerts.filter(alert =>
    selectedSeverity === 'all' || alert.severity === selectedSeverity
  )

  const alertsBySeverity = alerts.reduce((acc, alert) => {
    acc[alert.severity] = (acc[alert.severity] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  const upcomingMaintenance = schedule
    .filter(item => item.status === 'scheduled' || item.status === 'overdue')
    .sort((a, b) => new Date(a.nextDue).getTime() - new Date(b.nextDue).getTime())
    .slice(0, 5)

  const componentHealthData = componentHealth.map(comp => ({
    name: comp.component,
    health: comp.healthScore,
    robot: comp.robotName
  }))

  const severityColors = {
    low: '#10B981',
    medium: '#F59E0B',
    high: '#EF4444',
    critical: '#7C2D12'
  }

  const pieData = Object.entries(alertsBySeverity).map(([severity, count]) => ({
    name: severity,
    value: count,
    color: severityColors[severity as keyof typeof severityColors]
  }))

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical':
        return <XCircle className="h-4 w-4 text-red-700 dark:text-red-400" />
      case 'high':
        return <AlertTriangle className="h-4 w-4 text-red-600 dark:text-red-400" />
      case 'medium':
        return <AlertCircle className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
      case 'low':
        return <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
      default:
        return <Activity className="h-4 w-4" />
    }
  }


  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin h-8 w-8 border-4 border-blue-600 dark:border-blue-400 border-t-transparent rounded-full" />
        <span className="ml-3 text-muted-foreground">Loading maintenance data...</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-lg p-6">
        <div className="flex items-center">
          <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400 mr-2" />
          <span className="text-red-800 dark:text-red-400 font-medium">Error loading maintenance data</span>
        </div>
        <p className="text-red-700 dark:text-red-300 text-sm mt-1">{error}</p>
        <button
          onClick={refresh}
          className="mt-3 px-4 py-2 bg-red-600 dark:bg-red-700 text-white rounded-md hover:bg-red-700 dark:hover:bg-red-600 transition-colors"
        >
          Retry
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Predictive Maintenance</h2>
          <p className="text-muted-foreground">
            AI-powered maintenance insights and scheduling
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <select
            value={selectedSeverity}
            onChange={(e) => setSelectedSeverity(e.target.value)}
            className="px-3 py-2 border border-input bg-background rounded-md text-sm"
          >
            <option value="all">All Severities</option>
            <option value="critical">Critical</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>

          <button
            onClick={refresh}
            className="flex items-center space-x-2 px-4 py-2 border border-input rounded-md hover:bg-muted transition-colors"
          >
            <Activity className="h-4 w-4" />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-card rounded-lg border border-border p-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium text-muted-foreground">Active Alerts</p>
            <AlertTriangle className="h-4 w-4 text-red-600 dark:text-red-400" />
          </div>
          <p className="text-3xl font-bold">{alerts.length}</p>
          <p className="text-sm text-muted-foreground">
            {alerts.filter(a => a.severity === 'critical').length} critical
          </p>
        </div>

        <div className="bg-card rounded-lg border border-border p-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium text-muted-foreground">Upcoming Tasks</p>
            <Calendar className="h-4 w-4 text-blue-600 dark:text-blue-400" />
          </div>
          <p className="text-3xl font-bold">{upcomingMaintenance.length}</p>
          <p className="text-sm text-muted-foreground">Next 30 days</p>
        </div>

        <div className="bg-card rounded-lg border border-border p-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium text-muted-foreground">Fleet Health</p>
            <Activity className="h-4 w-4 text-green-600 dark:text-green-400" />
          </div>
          <p className="text-3xl font-bold">
            {componentHealth.length > 0
              ? Math.round(componentHealth.reduce((sum, c) => sum + c.healthScore, 0) / componentHealth.length)
              : 0}%
          </p>
          <p className="text-sm text-muted-foreground">Average score</p>
        </div>

        <div className="bg-card rounded-lg border border-border p-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium text-muted-foreground">Cost Savings</p>
            <DollarSign className="h-4 w-4 text-green-600 dark:text-green-400" />
          </div>
          <p className="text-3xl font-bold">
            ${insights.reduce((sum, insight) => sum + (insight.estimatedSavings || 0), 0).toLocaleString()}
          </p>
          <p className="text-sm text-muted-foreground">Potential annual</p>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Alert Distribution */}
        <div className="bg-card rounded-lg border border-border p-6">
          <h3 className="text-lg font-semibold mb-4">Alert Distribution</h3>
          <div className="flex items-center justify-center">
            <ResponsiveContainer width="100%" height={200}>
              <RechartsPieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={40}
                  outerRadius={80}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </RechartsPieChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-2 gap-2 mt-4">
            {pieData.map((item) => (
              <div key={item.name} className="flex items-center space-x-2 text-sm">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                <span className="capitalize">{item.name}: {item.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Component Health */}
        <div className="bg-card rounded-lg border border-border p-6">
          <h3 className="text-lg font-semibold mb-4">Component Health</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={componentHealthData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis domain={[0, 100]} />
              <Tooltip />
              <Bar
                dataKey="health"
                fill="#3B82F6"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Alerts List */}
      <div className="bg-card rounded-lg border border-border p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Maintenance Alerts</h3>
          <div className="flex items-center space-x-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">
              Showing {filteredAlerts.length} of {alerts.length} alerts
            </span>
          </div>
        </div>

        <div className="space-y-3">
          {filteredAlerts.map((alert) => (
            <div key={alert.id} className="border border-border rounded-lg p-4 hover:bg-muted/50 transition-colors">
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-3">
                  {getSeverityIcon(alert.severity)}
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <h4 className="font-medium">{alert.robotName}</h4>
                      <span className="text-sm text-muted-foreground">•</span>
                      <span className="text-sm text-muted-foreground">{alert.component}</span>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">{alert.description}</p>
                    <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                      <span>Due in {alert.daysUntilDue} days</span>
                      <span>Confidence: {alert.confidence}%</span>
                      <span>Downtime: {alert.estimatedDowntime.toFixed(1)}h</span>
                      <span>Cost: ${alert.estimatedCost.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <span className={cn(
                    "px-2 py-1 rounded-full text-xs font-medium",
                    alert.severity === 'critical' ? 'bg-red-100 dark:bg-red-950/30 text-red-800 dark:text-red-400' :
                    alert.severity === 'high' ? 'bg-red-50 dark:bg-red-950/20 text-red-700 dark:text-red-400' :
                    alert.severity === 'medium' ? 'bg-yellow-100 dark:bg-yellow-950/30 text-yellow-800 dark:text-yellow-400' :
                    'bg-green-100 dark:bg-green-950/30 text-green-800 dark:text-green-400'
                  )}>
                    {alert.severity}
                  </span>
                  <button className="p-1 hover:bg-muted rounded">
                    <Settings className="h-4 w-4 text-muted-foreground" />
                  </button>
                </div>
              </div>

              {alert.recommendation && (
                <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-md">
                  <p className="text-sm text-blue-800 dark:text-blue-400">
                    <strong>Recommendation:</strong> {alert.recommendation}
                  </p>
                </div>
              )}
            </div>
          ))}

          {filteredAlerts.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <CheckCircle className="h-12 w-12 mx-auto mb-3 text-green-600 dark:text-green-400" />
              <p>No maintenance alerts for the selected criteria</p>
            </div>
          )}
        </div>
      </div>

      {/* Upcoming Maintenance */}
      <div className="bg-card rounded-lg border border-border p-6">
        <h3 className="text-lg font-semibold mb-4">Upcoming Maintenance</h3>
        <div className="space-y-3">
          {upcomingMaintenance.map((task) => (
            <div key={task.id} className="flex items-center justify-between p-3 border border-border rounded-lg">
              <div className="flex items-center space-x-3">
                <Calendar className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                <div>
                  <h4 className="font-medium">{task.title}</h4>
                  <p className="text-sm text-muted-foreground">
                    {task.robotName} • {task.component}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium">
                  {new Date(task.nextDue).toLocaleDateString()}
                </p>
                <p className="text-xs text-muted-foreground">
                  {task.estimatedDuration}h duration
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* AI Insights */}
      <div className="bg-card rounded-lg border border-border p-6">
        <h3 className="text-lg font-semibold mb-4">AI-Powered Insights</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {insights.map((insight, index) => (
            <div key={index} className="border border-border rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium">{insight.title}</h4>
                <span className={cn(
                  "px-2 py-1 rounded-full text-xs font-medium",
                  insight.priority === 'high' ? 'bg-orange-100 dark:bg-orange-950/30 text-orange-800 dark:text-orange-400' :
                  insight.priority === 'medium' ? 'bg-yellow-100 dark:bg-yellow-950/30 text-yellow-800 dark:text-yellow-400' :
                  'bg-green-100 dark:bg-green-950/30 text-green-800 dark:text-green-400'
                )}>
                  {insight.priority}
                </span>
              </div>
              <p className="text-sm text-muted-foreground mb-3">{insight.description}</p>
              <p className="text-sm font-medium mb-2">{insight.impact}</p>
              {insight.estimatedSavings && (
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Savings: ${insight.estimatedSavings.toLocaleString()}</span>
                  {insight.roi && <span>ROI: {insight.roi}%</span>}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}