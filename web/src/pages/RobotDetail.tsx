import { useState, useEffect } from 'react'
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
  const { robots, sendCommand } = useURFMP()
  const [isLoading, setIsLoading] = useState(false)
  const [selectedTimeRange, setSelectedTimeRange] = useState('1h')

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

  const status = statusConfig[robot.status] || statusConfig.offline
  const StatusIcon = status.icon

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link to="/robots" className="p-2 rounded-md hover:bg-muted">
            <ArrowLeft className="h-5 w-5" />
          </Link>

          <div className="flex items-center space-x-4">
            <div className="h-12 w-12 rounded-lg bg-muted flex items-center justify-center">
              <Bot className="h-6 w-6 text-muted-foreground" />
            </div>

            <div>
              <h1 className="text-3xl font-bold tracking-tight">{robot.name}</h1>
              <p className="text-muted-foreground">
                {robot.model} • {robot.vendor.replace('_', ' ')}
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <select
            value={selectedTimeRange}
            onChange={(e) => setSelectedTimeRange(e.target.value)}
            className="rounded-md border border-input bg-background px-3 py-2 text-sm"
          >
            <option value="1h">Last Hour</option>
            <option value="6h">Last 6 Hours</option>
            <option value="24h">Last 24 Hours</option>
            <option value="7d">Last 7 Days</option>
          </select>

          <button className="p-2 rounded-md border border-input hover:bg-muted">
            <Download className="h-4 w-4" />
          </button>

          <button className="p-2 rounded-md border border-input hover:bg-muted">
            <RefreshCw className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Status and Controls */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Status Card */}
        <div className="bg-card rounded-lg border border-border p-6">
          <h3 className="text-lg font-semibold mb-4">Current Status</h3>

          <div className="flex items-center space-x-3 mb-4">
            <div
              className={cn('h-10 w-10 rounded-full flex items-center justify-center', status.bg)}
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
              Last seen {formatDistanceToNow(typeof robot.lastSeen === 'string' ? parseISO(robot.lastSeen) : robot.lastSeen, { addSuffix: true })}
            </p>
          )}

          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">IP Address</span>
              <span>{robot.ipAddress}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Software Version</span>
              <span>5.12.0</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Uptime</span>
              <span>24h 15m</span>
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
                className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
              >
                <Play className="h-4 w-4" />
                <span>Start Robot</span>
              </button>
            ) : robot.status === 'running' ? (
              <button
                onClick={() => handleCommand('STOP')}
                disabled={isLoading}
                className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50"
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
              disabled={isLoading}
              className="w-full flex items-center justify-center space-x-2 px-4 py-3 border border-border rounded-md hover:bg-muted disabled:opacity-50"
            >
              <Settings className="h-4 w-4" />
              <span>Configure</span>
            </button>
          </div>
        </div>

        {/* Current Values */}
        <div className="bg-card rounded-lg border border-border p-6">
          <h3 className="text-lg font-semibold mb-4">Current Values</h3>

          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Temperature</span>
              <span className="font-medium">46°C</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Current</span>
              <span className="font-medium">2.1 A</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Voltage</span>
              <span className="font-medium">48.2 V</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Speed</span>
              <span className="font-medium">15%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Load</span>
              <span className="font-medium">45%</span>
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

      {/* Program Information */}
      <div className="bg-card rounded-lg border border-border p-6">
        <h3 className="text-lg font-semibold mb-4">Current Program</h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <p className="text-sm text-muted-foreground mb-1">Program Name</p>
            <p className="font-medium">pick_and_place_v2.urp</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground mb-1">Cycle Time</p>
            <p className="font-medium">45.2 seconds</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground mb-1">Cycles Completed</p>
            <p className="font-medium">1,247</p>
          </div>
        </div>

        <div className="mt-4 p-4 bg-muted rounded-md">
          <p className="text-sm text-muted-foreground mb-2">Program Status</p>
          <p className="text-sm">
            Currently executing waypoint 3 of 8 in main loop. Next action: Move to pick position.
          </p>
        </div>
      </div>
    </div>
  )
}
