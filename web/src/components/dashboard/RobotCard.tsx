import { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Bot,
  Activity,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  Play,
  Square,
  MoreVertical,
} from 'lucide-react'
import { Robot, RobotStatus } from '@urfmp/types'
import { useURFMP } from '@/hooks/useURFMP'
import { cn } from '@/utils/cn'
import { formatDistanceToNow, parseISO } from 'date-fns'

interface RobotCardProps {
  robot: Robot
}

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

export function RobotCard({ robot }: RobotCardProps) {
  const { sendCommand } = useURFMP()
  const [isLoading, setIsLoading] = useState(false)

  const status = statusConfig[robot.status as keyof typeof statusConfig] || statusConfig.offline
  const StatusIcon = status.icon

  const handleCommand = async (commandType: string) => {
    if (isLoading) return

    setIsLoading(true)
    try {
      await sendCommand(robot.id, { type: commandType })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 p-6 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-start space-x-3 flex-1 min-w-0 pr-2">
          <div className="h-10 w-10 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center flex-shrink-0">
            <Bot className="h-5 w-5 text-gray-500 dark:text-gray-400" />
          </div>

          <div className="flex-1 min-w-0 overflow-hidden">
            <Link
              to={`/robots/${robot.id}`}
              className="font-medium text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors truncate block"
            >
              {robot.name}
            </Link>
            <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
              {robot.model || (robot as any).type} • {robot.vendor?.replace('_', ' ') || 'Unknown'}
            </p>
          </div>
        </div>

        <button className="p-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 flex-shrink-0">
          <MoreVertical className="h-4 w-4 text-gray-500 dark:text-gray-400" />
        </button>
      </div>

      {/* Status */}
      <div className="flex items-center space-x-2 mb-4">
        <div className={cn('h-6 w-6 rounded-full flex items-center justify-center', status.bg)}>
          <StatusIcon className={cn('h-3 w-3', status.color)} />
        </div>
        <span className={cn('text-sm font-medium', status.color)}>{status.label}</span>
        {robot.status === 'running' && (
          <div className="h-2 w-2 rounded-full bg-green-500 pulse-dot" />
        )}
      </div>

      {/* Last Seen */}
      {robot.lastSeen && (
        <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">
          Last seen{' '}
          {formatDistanceToNow(
            typeof robot.lastSeen === 'string' ? parseISO(robot.lastSeen) : robot.lastSeen,
            { addSuffix: true }
          )}
        </p>
      )}

      {/* Quick Actions */}
      <div className="flex items-center space-x-2">
        {robot.status === 'idle' || robot.status === 'stopped' ? (
          <button
            onClick={() => handleCommand('START')}
            disabled={isLoading}
            className="flex items-center space-x-1 px-3 py-1.5 bg-green-600 text-white text-xs rounded-md hover:bg-green-700 disabled:opacity-50"
          >
            <Play className="h-3 w-3" />
            <span>Start</span>
          </button>
        ) : robot.status === 'running' ? (
          <button
            onClick={() => handleCommand('STOP')}
            disabled={isLoading}
            className="flex items-center space-x-1 px-3 py-1.5 bg-red-600 text-white text-xs rounded-md hover:bg-red-700 disabled:opacity-50"
          >
            <Square className="h-3 w-3" />
            <span>Stop</span>
          </button>
        ) : null}

        <Link
          to={`/robots/${robot.id}`}
          className="px-3 py-1.5 border border-gray-200 dark:border-gray-700 text-xs text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
        >
          View Details
        </Link>
      </div>
    </div>
  )
}
