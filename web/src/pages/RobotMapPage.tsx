import { useState } from 'react'
import { useURFMP } from '@/hooks/useURFMP'
import { useTheme } from '@/contexts/ThemeContext'
import { useGeofencing } from '@/hooks/useGeofencing'
import { SimpleRobotMap } from '@/components/gps/SimpleRobotMap'
import {
  Settings,
  RefreshCw,
  Shield,
  ChevronDown,
  ChevronUp,
  MapPin,
  GitBranch,
} from 'lucide-react'
import { cn } from '@/utils/cn'

export function RobotMapPage() {
  const { robots, isLoading, error, refreshRobots } = useURFMP()
  const { isDark } = useTheme()
  const { geofences, waypoints, paths } = useGeofencing()
  const [selectedRobotId, setSelectedRobotId] = useState<string>()
  const [isFleetPanelExpanded, setIsFleetPanelExpanded] = useState(false)
  const [showGeofences, setShowGeofences] = useState(true)
  const [showWaypoints, setShowWaypoints] = useState(true)
  const [showPaths, setShowPaths] = useState(true)

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 dark:text-red-400 text-lg font-semibold mb-2">Error</div>
          <div className="text-gray-600 dark:text-gray-400 mb-4">{error}</div>
          <button
            onClick={refreshRobots}
            className="px-4 py-2 bg-blue-500 dark:bg-blue-600 text-white rounded hover:bg-blue-600 dark:hover:bg-blue-500 flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Retry
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="h-screen flex flex-col">
      {/* Header */}
      <div
        className={cn(
          'border-b px-6 py-3 flex items-center justify-between',
          isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
        )}
      >
        <div>
          <h1 className={cn('text-2xl font-bold', isDark ? 'text-gray-100' : 'text-gray-900')}>
            Robot GPS Map
          </h1>
          <p className={cn(isDark ? 'text-gray-300' : 'text-gray-600')}>
            Real-time robot positioning and fleet tracking
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Layer Toggles */}
          <div className="flex items-center gap-1 px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded-lg">
            {/* Geofence Toggle */}
            <button
              onClick={() => setShowGeofences(!showGeofences)}
              className={cn(
                'px-2 py-1 rounded flex items-center gap-1 text-xs font-medium transition-colors',
                showGeofences
                  ? 'bg-blue-500 dark:bg-blue-600 text-white'
                  : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100'
              )}
            >
              <Shield className="w-3 h-3" />
              Geofences
            </button>

            {/* Waypoint Toggle */}
            <button
              onClick={() => setShowWaypoints(!showWaypoints)}
              className={cn(
                'px-2 py-1 rounded flex items-center gap-1 text-xs font-medium transition-colors',
                showWaypoints
                  ? 'bg-green-500 dark:bg-green-600 text-white'
                  : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100'
              )}
            >
              <MapPin className="w-3 h-3" />
              Waypoints
            </button>

            {/* Paths Toggle */}
            <button
              onClick={() => setShowPaths(!showPaths)}
              className={cn(
                'px-2 py-1 rounded flex items-center gap-1 text-xs font-medium transition-colors',
                showPaths
                  ? 'bg-purple-500 dark:bg-purple-600 text-white'
                  : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100'
              )}
            >
              <GitBranch className="w-3 h-3" />
              Paths
            </button>
          </div>

          {/* Refresh Button */}
          <button
            onClick={refreshRobots}
            disabled={isLoading}
            className={cn(
              'px-2 py-1 transition-colors',
              isDark ? 'text-gray-300 hover:text-gray-100' : 'text-gray-600 hover:text-gray-900'
            )}
          >
            <RefreshCw className={cn('w-3 h-3', isLoading && 'animate-spin')} />
          </button>
        </div>
      </div>

      {/* Map Content */}
      <div className="flex-1 relative">
        <div className="absolute inset-0 z-0">
          <SimpleRobotMap
            robots={robots}
            selectedRobotId={selectedRobotId}
            onRobotSelect={setSelectedRobotId}
            geofences={showGeofences ? geofences : []}
            waypoints={showWaypoints ? waypoints : []}
            paths={showPaths ? paths : []}
            className="w-full h-full"
          />
        </div>

        {/* Collapsible Fleet Status Panel */}
        <div
          className={cn(
            'absolute top-4 left-4 rounded-lg shadow-lg backdrop-blur-sm border z-[1000]',
            isDark ? 'bg-gray-800/90 border-gray-700' : 'bg-white/90 border-gray-200'
          )}
          style={{
            position: 'absolute',
            zIndex: 1000,
            pointerEvents: 'auto',
          }}
        >
          {/* Panel Header */}
          <button
            onClick={() => setIsFleetPanelExpanded(!isFleetPanelExpanded)}
            className={cn(
              'w-full flex items-center justify-between p-2 hover:bg-opacity-80 transition-colors',
              isFleetPanelExpanded ? 'rounded-t-lg' : 'rounded-lg',
              isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
            )}
          >
            <div className="flex items-center gap-1">
              <Settings className="w-3 h-3" />
              <h3
                className={cn('font-semibold text-xs', isDark ? 'text-gray-200' : 'text-gray-900')}
              >
                Fleet Status ({robots.length})
              </h3>
            </div>
            {isFleetPanelExpanded ? (
              <ChevronUp className={cn('w-3 h-3', isDark ? 'text-gray-400' : 'text-gray-600')} />
            ) : (
              <ChevronDown className={cn('w-3 h-3', isDark ? 'text-gray-400' : 'text-gray-600')} />
            )}
          </button>

          {/* Panel Content */}
          {isFleetPanelExpanded && (
            <div className="p-2 pt-0 w-56 max-h-72 overflow-y-auto">
              <div className="space-y-1">
                {robots.map((robot) => (
                  <div
                    key={robot.id}
                    className={cn(
                      'p-1.5 rounded border cursor-pointer transition-colors',
                      selectedRobotId === robot.id
                        ? isDark
                          ? 'border-blue-400 bg-blue-900/30'
                          : 'border-blue-500 bg-blue-50'
                        : isDark
                          ? 'border-gray-600 hover:border-gray-500'
                          : 'border-gray-200 hover:border-gray-300'
                    )}
                    onClick={() => setSelectedRobotId(robot.id)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div
                          className={cn(
                            'w-2 h-2 rounded-full',
                            robot.status === 'online'
                              ? 'bg-green-500'
                              : robot.status === 'error'
                                ? 'bg-red-500'
                                : robot.status === 'idle'
                                  ? 'bg-yellow-500'
                                  : 'bg-gray-400'
                          )}
                        />
                        <span
                          className={cn(
                            'font-medium text-xs',
                            isDark ? 'text-gray-200' : 'text-gray-900'
                          )}
                        >
                          {robot.name}
                        </span>
                      </div>
                      <span className={cn('text-xs', isDark ? 'text-gray-400' : 'text-gray-500')}>
                        {robot.status}
                      </span>
                    </div>
                    <div
                      className={cn('text-xs mt-0.5', isDark ? 'text-gray-400' : 'text-gray-600')}
                    >
                      {robot.model} • {robot.vendor}
                    </div>
                  </div>
                ))}
              </div>

              {robots.length === 0 && !isLoading && (
                <div className={cn('text-center py-4', isDark ? 'text-gray-400' : 'text-gray-500')}>
                  <Settings className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No robots found</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
