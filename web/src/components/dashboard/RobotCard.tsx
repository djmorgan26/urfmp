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
import { Robot } from '@urfmp/types'
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

  // Format vendor name nicely
  const vendorName =
    robot.vendor?.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()) || 'Unknown'

  return (
    <Link
      to={`/robots/${robot.id}`}
      className="block bg-card rounded-lg border border-border hover:border-primary/50 hover:shadow-lg transition-all duration-200 overflow-hidden group"
    >
      {/* Status Banner */}
      <div className={cn('h-1.5', status.bg)} />

      <div className="p-5">
        {/* Header with Icon */}
        <div className="flex items-center justify-center mb-4">
          <div className={cn('h-12 w-12 rounded-xl flex items-center justify-center', status.bg)}>
            <Bot className={cn('h-7 w-7', status.color)} />
          </div>
        </div>

        {/* Robot Name - Full Width, No Truncation */}
        <div className="mb-3">
          <h3 className="font-semibold text-base text-foreground group-hover:text-primary transition-colors text-center break-words leading-snug min-h-[2.5rem]">
            {robot.name}
          </h3>
        </div>

        {/* Status Badge - Centered */}
        <div className="flex items-center justify-center gap-1.5 mb-4">
          <span
            className={cn(
              'inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full',
              status.bg,
              status.color
            )}
          >
            <StatusIcon className="h-3 w-3" />
            {status.label}
          </span>
          {robot.status === 'running' && (
            <div className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse" />
          )}
        </div>

        {/* Robot Info */}
        <div className="space-y-2 mb-4">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Model</span>
            <span className="font-medium text-foreground">
              {robot.model || (robot as any).type || 'N/A'}
            </span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Vendor</span>
            <span className="font-medium text-foreground">{vendorName}</span>
          </div>
          {robot.serialNumber && (
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Serial</span>
              <span className="font-mono text-xs text-foreground">{robot.serialNumber}</span>
            </div>
          )}
        </div>

        {/* Last Seen */}
        {robot.lastSeen && (
          <div className="pt-3 border-t border-border">
            <p className="text-xs text-muted-foreground flex items-center gap-1.5">
              <Clock className="h-3 w-3" />
              Last seen{' '}
              {formatDistanceToNow(
                typeof robot.lastSeen === 'string' ? parseISO(robot.lastSeen) : robot.lastSeen,
                { addSuffix: true }
              )}
            </p>
          </div>
        )}

        {/* Quick Actions */}
        <div className="flex items-center gap-2 mt-4 pt-3 border-t border-border">
          {robot.status === 'idle' || robot.status === 'stopped' ? (
            <button
              onClick={(e) => {
                e.preventDefault()
                handleCommand('START')
              }}
              disabled={isLoading}
              className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-md transition-colors disabled:opacity-50"
            >
              <Play className="h-3.5 w-3.5" />
              <span>Start</span>
            </button>
          ) : robot.status === 'running' ? (
            <button
              onClick={(e) => {
                e.preventDefault()
                handleCommand('STOP')
              }}
              disabled={isLoading}
              className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-md transition-colors disabled:opacity-50"
            >
              <Square className="h-3.5 w-3.5" />
              <span>Stop</span>
            </button>
          ) : (
            <div className="flex-1 px-3 py-2 bg-muted text-muted-foreground text-sm text-center rounded-md">
              {status.label}
            </div>
          )}

          <button
            onClick={(e) => {
              e.preventDefault()
              // TODO: Implement robot menu
            }}
            className="p-2 rounded-md hover:bg-accent text-muted-foreground hover:text-foreground transition-colors"
          >
            <MoreVertical className="h-4 w-4" />
          </button>
        </div>
      </div>
    </Link>
  )
}
