import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import {
  ArrowLeft,
  Activity,
  Bot,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  Play,
  Square,
  Settings,
  Download,
  RefreshCw,
  Edit,
} from 'lucide-react'
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
import { useURFMP } from '@/hooks/useURFMP'
import { cn } from '@/utils/cn'
import { formatDistanceToNow, parseISO } from 'date-fns'
import { EditRobotModal } from '@/components/robots/EditRobotModal'
import { TelemetryDashboard } from '@/components/telemetry/TelemetryDashboard'

const mockTelemetryData = [
  { time: '00:00', temperature: 42, current: 2.1, voltage: 48.2, position: [120, 45, 230] },
  { time: '00:15', temperature: 43, current: 2.3, voltage: 48.1, position: [125, 48, 235] },
  { time: '00:30', temperature: 44, current: 2.2, voltage: 48.3, position: [130, 42, 240] },
  { time: '00:45', temperature: 45, current: 2.4, voltage: 48.0, position: [128, 46, 238] },
  { time: '01:00', temperature: 46, current: 2.1, voltage: 48.2, position: [132, 44, 242] },
]

const statusConfig = {
  online: { icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-100', label: 'Online' },
  running: { icon: Activity, color: 'text-blue-600', bg: 'bg-blue-100', label: 'Running' },
  idle: { icon: Clock, color: 'text-gray-600', bg: 'bg-gray-100', label: 'Idle' },
  offline: { icon: XCircle, color: 'text-red-600', bg: 'bg-red-100', label: 'Offline' },
  error: { icon: AlertTriangle, color: 'text-red-600', bg: 'bg-red-100', label: 'Error' },
  maintenance: {
    icon: AlertTriangle,
    color: 'text-yellow-600',
    bg: 'bg-yellow-100',
    label: 'Maintenance',
  },
  stopped: { icon: Square, color: 'text-gray-600', bg: 'bg-gray-100', label: 'Stopped' },
  emergency_stop: { icon: AlertTriangle, color: 'text-red-600', bg: 'bg-red-100', label: 'E-Stop' },
}

export function RobotDetail() {
  const { id } = useParams<{ id: string }>()
  const { robots, sendCommand, refreshRobots } = useURFMP()
  const [isLoading, setIsLoading] = useState(false)
  const [selectedTimeRange, setSelectedTimeRange] = useState('1h')
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [activeTab, setActiveTab] = useState('overview')

  const robot = robots.find((r) => r.id === id)

  const handleCommand = async (commandType: string) => {
    if (isLoading || !robot) return

    setIsLoading(true)
    try {
      await sendCommand(robot.id, { type: commandType })
    } finally {
      setIsLoading(false)
    }
  }

  if (!robot) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Bot className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
          <h2 className="text-xl font-semibold mb-2">Robot Not Found</h2>
          <p className="text-muted-foreground mb-4">The robot with ID "{id}" could not be found.</p>
          <Link
            to="/robots"
            className="inline-flex items-center space-x-2 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Robots</span>
          </Link>
        </div>
      </div>
    )
  }

  const status = statusConfig[robot.status as keyof typeof statusConfig] || statusConfig.offline
  const StatusIcon = status.icon

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center space-x-3 sm:space-x-4">
          <Link to="/robots" className="p-2 rounded-md hover:bg-muted shrink-0">
            <ArrowLeft className="h-5 w-5" />
          </Link>

          <div className="flex items-center space-x-3 sm:space-x-4 min-w-0">
            <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-lg bg-muted flex items-center justify-center shrink-0">
              <Bot className="h-5 w-5 sm:h-6 sm:w-6 text-muted-foreground" />
            </div>

            <div className="min-w-0">
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold tracking-tight truncate">
                {robot.name}
              </h1>
              <p className="text-sm text-muted-foreground truncate">
                {robot.model} • {robot.vendor.replace('_', ' ')}
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-2 overflow-x-auto pb-1">
          <button
            onClick={() => setIsEditModalOpen(true)}
            className="flex items-center space-x-2 px-3 py-2 border border-input rounded-md hover:bg-muted whitespace-nowrap shrink-0"
          >
            <Edit className="h-4 w-4" />
            <span className="hidden sm:inline">Edit Robot</span>
            <span className="sm:hidden">Edit</span>
          </button>

          <select
            value={selectedTimeRange}
            onChange={(e) => setSelectedTimeRange(e.target.value)}
            className="rounded-md border border-input bg-background px-2 sm:px-3 py-2 text-xs sm:text-sm shrink-0"
          >
            <option value="1h">1h</option>
            <option value="6h">6h</option>
            <option value="24h">24h</option>
            <option value="7d">7d</option>
          </select>

          <button
            className="p-2 rounded-md border border-input hover:bg-muted shrink-0"
            title="Download data"
          >
            <Download className="h-4 w-4" />
          </button>

          <button
            onClick={() => refreshRobots(true)}
            className="p-2 rounded-md border border-input hover:bg-muted shrink-0"
            title="Refresh"
          >
            <RefreshCw className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="border-b border-border -mx-4 sm:mx-0">
        <nav className="flex space-x-4 sm:space-x-8 overflow-x-auto px-4 sm:px-0 scrollbar-hide">
          {[
            { id: 'overview', label: 'Overview' },
            { id: 'telemetry', label: 'Telemetry' },
            { id: 'commands', label: 'Commands' },
            { id: 'history', label: 'History' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                'py-3 sm:py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap',
                activeTab === tab.id
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted-foreground hover:text-foreground hover:border-muted-foreground'
              )}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <>
          {/* Status and Controls */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Status Card */}
            <div className="bg-card rounded-lg border border-border p-6">
              <h3 className="text-lg font-semibold mb-4">Current Status</h3>

              <div className="flex items-center space-x-3 mb-4">
                <div
                  className={cn(
                    'h-10 w-10 rounded-full flex items-center justify-center',
                    status.bg
                  )}
                >
                  <StatusIcon className={cn('h-5 w-5', status.color)} />
                </div>
                <div>
                  <p className={cn('font-medium', status.color)}>{status.label}</p>
                  {robot.status === 'running' && (
                    <div className="flex items-center space-x-2 mt-1">
                      <div className="h-2 w-2 rounded-full bg-green-500 pulse-dot" />
                      <span className="text-xs text-muted-foreground">Active</span>
                    </div>
                  )}
                </div>
              </div>

              {robot.lastSeen && (
                <p className="text-sm text-muted-foreground mb-4">
                  Last seen{' '}
                  {formatDistanceToNow(
                    typeof robot.lastSeen === 'string' ? parseISO(robot.lastSeen) : robot.lastSeen,
                    { addSuffix: true }
                  )}
                </p>
              )}

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Serial Number</span>
                  <span>{robot.serialNumber || 'N/A'}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Firmware Version</span>
                  <span>{robot.firmwareVersion || 'N/A'}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Location</span>
                  <span>
                    {robot.location?.facility && robot.location?.cell
                      ? `${robot.location.facility} - ${robot.location.cell}`
                      : 'Not specified'}
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Controls */}
            <div className="bg-card rounded-lg border border-border p-6">
              <h3 className="text-lg font-semibold mb-4">Quick Controls</h3>

              <div className="space-y-3">
                {robot.status === 'idle' || robot.status === 'stopped' ? (
                  <button
                    onClick={() => handleCommand('START')}
                    disabled={isLoading}
                    className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-green-600 dark:bg-green-700 text-white rounded-md hover:bg-green-700 dark:hover:bg-green-600 disabled:opacity-50"
                  >
                    <Play className="h-4 w-4" />
                    <span>Start Robot</span>
                  </button>
                ) : robot.status === 'running' ? (
                  <button
                    onClick={() => handleCommand('STOP')}
                    disabled={isLoading}
                    className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-red-600 dark:bg-red-700 text-white rounded-md hover:bg-red-700 dark:hover:bg-red-600 disabled:opacity-50"
                  >
                    <Square className="h-4 w-4" />
                    <span>Stop Robot</span>
                  </button>
                ) : null}

                <button
                  onClick={() => handleCommand('EMERGENCY_STOP')}
                  disabled={isLoading}
                  className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50"
                >
                  <AlertTriangle className="h-4 w-4" />
                  <span>Emergency Stop</span>
                </button>

                <button
                  onClick={() => {
                    // TODO: Implement robot configuration dialog
                    console.log(`Configure clicked for robot ${robot.id}`)
                  }}
                  disabled={isLoading}
                  className="w-full flex items-center justify-center space-x-2 px-4 py-3 border border-border rounded-md hover:bg-muted disabled:opacity-50"
                >
                  <Settings className="h-4 w-4" />
                  <span>Configure</span>
                </button>
              </div>
            </div>

            {/* Robot Specifications */}
            <div className="bg-card rounded-lg border border-border p-6">
              <h3 className="text-lg font-semibold mb-4">Specifications</h3>

              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Max Payload</span>
                  <span className="font-medium">
                    {robot.configuration?.payload ? `${robot.configuration.payload} kg` : 'N/A'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Reach</span>
                  <span className="font-medium">
                    {robot.configuration?.reach ? `${robot.configuration.reach} mm` : 'N/A'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Joints</span>
                  <span className="font-medium">{robot.configuration?.axes || 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Created</span>
                  <span className="font-medium">
                    {formatDistanceToNow(
                      typeof robot.createdAt === 'string'
                        ? parseISO(robot.createdAt)
                        : robot.createdAt,
                      { addSuffix: true }
                    )}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Last Updated</span>
                  <span className="font-medium">
                    {formatDistanceToNow(
                      typeof robot.updatedAt === 'string'
                        ? parseISO(robot.updatedAt)
                        : robot.updatedAt,
                      { addSuffix: true }
                    )}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Telemetry Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Temperature Chart */}
            <div className="bg-card rounded-lg border border-border p-6">
              <h3 className="text-lg font-semibold mb-4">Temperature</h3>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={mockTelemetryData}>
                  <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                  <XAxis dataKey="time" />
                  <YAxis />
                  <Tooltip />
                  <Area
                    type="monotone"
                    dataKey="temperature"
                    stroke="#EF4444"
                    fill="#EF4444"
                    fillOpacity={0.1}
                    strokeWidth={2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {/* Current & Voltage Chart */}
            <div className="bg-card rounded-lg border border-border p-6">
              <h3 className="text-lg font-semibold mb-4">Power Consumption</h3>
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
                    dataKey="current"
                    stroke="#3B82F6"
                    strokeWidth={2}
                    dot={{ fill: '#3B82F6', strokeWidth: 2, r: 4 }}
                  />
                  <Line
                    yAxisId="right"
                    type="monotone"
                    dataKey="voltage"
                    stroke="#10B981"
                    strokeWidth={2}
                    dot={{ fill: '#10B981', strokeWidth: 2, r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Robot Information */}
          <div className="bg-card rounded-lg border border-border p-6">
            <h3 className="text-lg font-semibold mb-4">Robot Information</h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Robot ID</p>
                <p className="font-medium font-mono text-xs break-all">{robot.id}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Organization</p>
                <p className="font-medium font-mono text-xs break-all">{robot.organizationId}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Status</p>
                <div className="flex items-center space-x-2">
                  <StatusIcon className={cn('h-4 w-4', status.color)} />
                  <span className={cn('font-medium', status.color)}>{status.label}</span>
                </div>
              </div>
            </div>

            {robot.location && (
              <div className="mt-6 p-4 bg-muted rounded-md">
                <p className="text-sm text-muted-foreground mb-2">Location Details</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Facility:</span>
                    <span className="ml-2 font-medium">
                      {robot.location.facility || 'Not specified'}
                    </span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Cell/Station:</span>
                    <span className="ml-2 font-medium">
                      {robot.location.cell || 'Not specified'}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {robot.configuration && (
              <div className="mt-4 p-4 bg-muted rounded-md">
                <p className="text-sm text-muted-foreground mb-2">Configuration Details</p>
                <div className="text-sm">
                  <pre className="text-xs">{JSON.stringify(robot.configuration, null, 2)}</pre>
                </div>
              </div>
            )}
          </div>
        </>
      )}

      {/* Telemetry Tab */}
      {activeTab === 'telemetry' && <TelemetryDashboard robotId={robot.id} />}

      {/* Commands Tab */}
      {activeTab === 'commands' && (
        <div className="space-y-6">
          {/* Command Builder */}
          <div className="bg-card rounded-lg border border-border p-4 sm:p-6">
            <h3 className="text-lg font-semibold mb-4">Send Command</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              <button
                onClick={() => handleCommand('START')}
                disabled={isLoading || robot.status === 'running'}
                className="flex items-center justify-center space-x-2 px-4 py-3 bg-green-600 dark:bg-green-700 text-white rounded-md hover:bg-green-700 dark:hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Play className="h-4 w-4" />
                <span>Start</span>
              </button>
              <button
                onClick={() => handleCommand('STOP')}
                disabled={isLoading || robot.status === 'stopped'}
                className="flex items-center justify-center space-x-2 px-4 py-3 bg-red-600 dark:bg-red-700 text-white rounded-md hover:bg-red-700 dark:hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Square className="h-4 w-4" />
                <span>Stop</span>
              </button>
              <button
                onClick={() => handleCommand('PAUSE')}
                disabled={isLoading || robot.status !== 'running'}
                className="flex items-center justify-center space-x-2 px-4 py-3 bg-yellow-600 text-white rounded-md hover:bg-yellow-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Clock className="h-4 w-4" />
                <span>Pause</span>
              </button>
              <button
                onClick={() => handleCommand('RESET')}
                disabled={isLoading}
                className="flex items-center justify-center space-x-2 px-4 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <RefreshCw className="h-4 w-4" />
                <span>Reset</span>
              </button>
            </div>
          </div>

          {/* Command History */}
          <div className="bg-card rounded-lg border border-border p-4 sm:p-6">
            <h3 className="text-lg font-semibold mb-4">Command History</h3>
            <div className="space-y-3">
              {[
                {
                  id: '1',
                  command: 'START',
                  timestamp: new Date(Date.now() - 300000),
                  status: 'success',
                  user: 'Admin User',
                },
                {
                  id: '2',
                  command: 'STOP',
                  timestamp: new Date(Date.now() - 600000),
                  status: 'success',
                  user: 'Admin User',
                },
                {
                  id: '3',
                  command: 'RESET',
                  timestamp: new Date(Date.now() - 900000),
                  status: 'success',
                  user: 'Admin User',
                },
              ].map((cmd) => (
                <div
                  key={cmd.id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-muted rounded-md gap-3 sm:gap-0"
                >
                  <div className="flex items-center space-x-3 flex-1">
                    <div
                      className={cn(
                        'h-8 w-8 rounded-full flex items-center justify-center',
                        cmd.status === 'success'
                          ? 'bg-green-100 dark:bg-green-950/30 text-green-600 dark:text-green-400'
                          : 'bg-red-100 dark:bg-red-950/30 text-red-600 dark:text-red-400'
                      )}
                    >
                      {cmd.status === 'success' ? (
                        <CheckCircle className="h-4 w-4" />
                      ) : (
                        <XCircle className="h-4 w-4" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm">{cmd.command}</p>
                      <p className="text-xs text-muted-foreground truncate">
                        Executed by {cmd.user}
                      </p>
                    </div>
                  </div>
                  <div className="text-xs text-muted-foreground sm:text-right">
                    {formatDistanceToNow(cmd.timestamp, { addSuffix: true })}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Advanced Commands */}
          <div className="bg-card rounded-lg border border-border p-4 sm:p-6">
            <h3 className="text-lg font-semibold mb-4">Advanced Commands</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Custom Command</label>
                <div className="flex flex-col sm:flex-row gap-2">
                  <input
                    type="text"
                    placeholder="Enter custom command..."
                    className="flex-1 rounded-md border border-input bg-background px-3 py-2 text-sm"
                  />
                  <button
                    disabled={isLoading}
                    className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 disabled:opacity-50 whitespace-nowrap"
                  >
                    Send Command
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Move to Position</label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <input
                    type="number"
                    placeholder="X"
                    className="rounded-md border border-input bg-background px-3 py-2 text-sm"
                  />
                  <input
                    type="number"
                    placeholder="Y"
                    className="rounded-md border border-input bg-background px-3 py-2 text-sm"
                  />
                  <input
                    type="number"
                    placeholder="Z"
                    className="rounded-md border border-input bg-background px-3 py-2 text-sm"
                  />
                </div>
                <button
                  disabled={isLoading}
                  className="mt-2 w-full sm:w-auto px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 disabled:opacity-50"
                >
                  Move Robot
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* History Tab */}
      {activeTab === 'history' && (
        <div className="space-y-6">
          {/* Activity Timeline */}
          <div className="bg-card rounded-lg border border-border p-4 sm:p-6">
            <h3 className="text-lg font-semibold mb-4">Activity Timeline</h3>
            <div className="space-y-4">
              {[
                {
                  id: '1',
                  type: 'status_change',
                  title: 'Status changed to Running',
                  description: 'Robot started production cycle',
                  timestamp: new Date(Date.now() - 180000),
                  user: 'Admin User',
                  icon: Activity,
                  color: 'text-green-600 bg-green-100',
                },
                {
                  id: '2',
                  type: 'command',
                  title: 'Command executed: STOP',
                  description: 'Robot stopped for maintenance',
                  timestamp: new Date(Date.now() - 3600000),
                  user: 'Admin User',
                  icon: Square,
                  color: 'text-red-600 bg-red-100',
                },
                {
                  id: '3',
                  type: 'config_change',
                  title: 'Configuration updated',
                  description: 'Payload capacity increased to 5.5kg',
                  timestamp: new Date(Date.now() - 7200000),
                  user: 'Admin User',
                  icon: Settings,
                  color: 'text-blue-600 bg-blue-100',
                },
                {
                  id: '4',
                  type: 'maintenance',
                  title: 'Maintenance completed',
                  description: 'Scheduled maintenance task completed successfully',
                  timestamp: new Date(Date.now() - 10800000),
                  user: 'System',
                  icon: CheckCircle,
                  color: 'text-green-600 bg-green-100',
                },
                {
                  id: '5',
                  type: 'alert',
                  title: 'Temperature alert cleared',
                  description: 'Temperature returned to normal range',
                  timestamp: new Date(Date.now() - 14400000),
                  user: 'System',
                  icon: AlertTriangle,
                  color: 'text-yellow-600 bg-yellow-100',
                },
              ].map((event, index, array) => (
                <div key={event.id} className="relative flex gap-4">
                  {/* Timeline line */}
                  {index < array.length - 1 && (
                    <div className="absolute left-4 top-10 bottom-0 w-0.5 bg-border" />
                  )}

                  {/* Event icon */}
                  <div
                    className={cn(
                      'h-8 w-8 rounded-full flex items-center justify-center shrink-0',
                      event.color
                    )}
                  >
                    <event.icon className="h-4 w-4" />
                  </div>

                  {/* Event content */}
                  <div className="flex-1 pb-6">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-1">
                      <h4 className="font-medium text-sm">{event.title}</h4>
                      <span className="text-xs text-muted-foreground">
                        {formatDistanceToNow(event.timestamp, { addSuffix: true })}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground mb-1">{event.description}</p>
                    <p className="text-xs text-muted-foreground">by {event.user}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* System Logs */}
          <div className="bg-card rounded-lg border border-border p-4 sm:p-6">
            <h3 className="text-lg font-semibold mb-4">System Logs</h3>
            <div className="bg-muted rounded-md p-4 font-mono text-xs overflow-x-auto">
              <div className="space-y-1 whitespace-pre">
                <div className="text-muted-foreground">
                  [{new Date().toISOString()}] INFO: Robot operational
                </div>
                <div className="text-green-600">
                  [{new Date(Date.now() - 60000).toISOString()}] SUCCESS: Position reached: [125.5,
                  245.8, 300.2]
                </div>
                <div className="text-blue-600">
                  [{new Date(Date.now() - 120000).toISOString()}] INFO: Telemetry update received
                </div>
                <div className="text-yellow-600">
                  [{new Date(Date.now() - 180000).toISOString()}] WARN: Temperature slightly
                  elevated: 46°C
                </div>
                <div className="text-green-600">
                  [{new Date(Date.now() - 240000).toISOString()}] SUCCESS: Command executed:
                  MOVE_TO_HOME
                </div>
                <div className="text-muted-foreground">
                  [{new Date(Date.now() - 300000).toISOString()}] INFO: WebSocket connection
                  established
                </div>
              </div>
            </div>
          </div>

          {/* Performance Metrics */}
          <div className="bg-card rounded-lg border border-border p-4 sm:p-6">
            <h3 className="text-lg font-semibold mb-4">Performance Metrics</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-4 bg-muted rounded-md">
                <p className="text-sm text-muted-foreground mb-1">Uptime</p>
                <p className="text-2xl font-bold">99.8%</p>
                <p className="text-xs text-green-600">+0.2% from last month</p>
              </div>
              <div className="p-4 bg-muted rounded-md">
                <p className="text-sm text-muted-foreground mb-1">Cycles Completed</p>
                <p className="text-2xl font-bold">1,247</p>
                <p className="text-xs text-green-600">+12% from last week</p>
              </div>
              <div className="p-4 bg-muted rounded-md">
                <p className="text-sm text-muted-foreground mb-1">Avg Cycle Time</p>
                <p className="text-2xl font-bold">2.3s</p>
                <p className="text-xs text-green-600">-0.1s improvement</p>
              </div>
              <div className="p-4 bg-muted rounded-md">
                <p className="text-sm text-muted-foreground mb-1">Error Rate</p>
                <p className="text-2xl font-bold">0.2%</p>
                <p className="text-xs text-green-600">-0.1% improvement</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Robot Modal */}
      {robot && (
        <EditRobotModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          onSuccess={refreshRobots}
          robot={robot}
        />
      )}
    </div>
  )
}
