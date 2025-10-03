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
            onClick={() => refreshRobots(true)}
            className="px-4 py-2 bg-blue-500 dark:bg-blue-600 text-white rounded hover:bg-blue-600 dark:hover:bg-blue-500 flex items-center gap-2"
          >
            <RefreshCw className="w-4 w-4" />
            Retry
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="h-[calc(100vh-4rem)] sm:h-screen flex flex-col">
      {/* Header */}
      <div
        className={cn(
          'border-b px-3 sm:px-6 py-2 sm:py-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2',
          isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
        )}
      >
        <div className="min-w-0">
          <h1
            className={cn(
              'text-lg sm:text-2xl font-bold truncate',
              isDark ? 'text-gray-100' : 'text-gray-900'
            )}
          >
            Robot GPS Map
          </h1>
          <p
            className={cn(
              'text-xs sm:text-sm hidden sm:block',
              isDark ? 'text-gray-300' : 'text-gray-600'
            )}
          >
            Real-time robot positioning and fleet tracking
          </p>
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          {/* Layer Toggles */}
          <div className="flex items-center gap-1 px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded-lg shrink-0">
            {/* Geofence Toggle */}
            <button
              onClick={() => setShowGeofences(!showGeofences)}
              className={cn(
                'px-2 py-1 rounded flex items-center gap-1 text-xs font-medium transition-colors min-h-[36px] min-w-[36px] whitespace-nowrap',
                showGeofences
                  ? 'bg-blue-500 dark:bg-blue-600 text-white'
                  : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100'
              )}
              title="Toggle Geofences"
            >
              <Shield className="w-3 h-3 flex-shrink-0" />
              <span className="hidden sm:inline">Geofences</span>
            </button>

            {/* Waypoint Toggle */}
            <button
              onClick={() => setShowWaypoints(!showWaypoints)}
              className={cn(
                'px-2 py-1 rounded flex items-center gap-1 text-xs font-medium transition-colors min-h-[36px] min-w-[36px] whitespace-nowrap',
                showWaypoints
                  ? 'bg-green-500 dark:bg-green-600 text-white'
                  : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100'
              )}
              title="Toggle Waypoints"
            >
              <MapPin className="w-3 h-3 flex-shrink-0" />
              <span className="hidden sm:inline">Waypoints</span>
            </button>

            {/* Paths Toggle */}
            <button
              onClick={() => setShowPaths(!showPaths)}
              className={cn(
                'px-2 py-1 rounded flex items-center gap-1 text-xs font-medium transition-colors min-h-[36px] min-w-[36px] whitespace-nowrap',
                showPaths
                  ? 'bg-purple-500 dark:bg-purple-600 text-white'
                  : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100'
              )}
              title="Toggle Paths"
            >
              <GitBranch className="w-3 h-3 flex-shrink-0" />
              <span className="hidden sm:inline">Paths</span>
            </button>
          </div>

          {/* Refresh Button */}
          <button
            onClick={() => refreshRobots(true)}
            disabled={isLoading}
            className={cn(
              'px-2 py-1 transition-colors min-h-[36px] min-w-[36px] flex items-center justify-center rounded shrink-0',
              isDark
                ? 'text-gray-300 hover:text-gray-100 hover:bg-gray-700'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
            )}
            aria-label="Refresh robot data"
          >
            <RefreshCw className={cn('w-4 h-4', isLoading && 'animate-spin')} />
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
            'absolute top-2 sm:top-4 left-2 sm:left-4 rounded-lg shadow-lg backdrop-blur-sm border z-[70] max-w-[calc(100vw-1rem)] sm:max-w-xs',
            isDark ? 'bg-gray-800/95 border-gray-700' : 'bg-white/95 border-gray-200'
          )}
          style={{
            position: 'absolute',
            pointerEvents: 'auto',
          }}
        >
          {/* Panel Header */}
          <button
            onClick={() => setIsFleetPanelExpanded(!isFleetPanelExpanded)}
            className={cn(
              'w-full flex items-center justify-between p-2 sm:p-3 hover:bg-opacity-80 transition-colors min-h-[44px]',
              isFleetPanelExpanded ? 'rounded-t-lg' : 'rounded-lg',
              isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
            )}
          >
            <div className="flex items-center gap-2">
              <Settings className="w-4 h-4 shrink-0" />
              <h3
                className={cn('font-semibold text-sm', isDark ? 'text-gray-200' : 'text-gray-900')}
              >
                Fleet ({robots.length})
              </h3>
            </div>
            {isFleetPanelExpanded ? (
              <ChevronUp
                className={cn('w-4 h-4 shrink-0', isDark ? 'text-gray-400' : 'text-gray-600')}
              />
            ) : (
              <ChevronDown
                className={cn('w-4 h-4 shrink-0', isDark ? 'text-gray-400' : 'text-gray-600')}
              />
            )}
          </button>

          {/* Panel Content */}
          {isFleetPanelExpanded && (
            <div className="p-2 sm:p-3 pt-0 w-full max-h-[60vh] sm:max-h-72 overflow-y-auto">
              <div className="space-y-2">
                {robots.map((robot) => (
                  <div
                    key={robot.id}
                    className={cn(
                      'p-2 sm:p-2.5 rounded border cursor-pointer transition-colors min-h-[44px]',
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
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 min-w-0 flex-1">
                        <div
                          className={cn(
                            'w-2 h-2 rounded-full shrink-0',
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
                            'font-medium text-sm truncate',
                            isDark ? 'text-gray-200' : 'text-gray-900'
                          )}
                        >
                          {robot.name}
                        </span>
                      </div>
                      <span
                        className={cn(
                          'text-xs whitespace-nowrap shrink-0',
                          isDark ? 'text-gray-400' : 'text-gray-500'
                        )}
                      >
                        {robot.status}
                      </span>
                    </div>
                    <div
                      className={cn(
                        'text-xs mt-1 truncate',
                        isDark ? 'text-gray-400' : 'text-gray-600'
                      )}
                    >
                      {robot.model} • {robot.vendor}
                    </div>
                  </div>
                ))}
              </div>

              {robots.length === 0 && !isLoading && (
                <div className={cn('text-center py-6', isDark ? 'text-gray-400' : 'text-gray-500')}>
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
