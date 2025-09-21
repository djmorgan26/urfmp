import { useState, useEffect } from 'react'
import { useURFMP } from '@/hooks/useURFMP'
import { useTheme } from '@/contexts/ThemeContext'
import { useGeofencing } from '@/hooks/useGeofencing'
import { Robot } from '@urfmp/types'
import { SimpleRobotMap } from '@/components/gps/SimpleRobotMap'
import { RobotMap3D } from '@/components/gps/RobotMap3D'
import { Map, Globe, Settings, RefreshCw, AlertTriangle, Shield } from 'lucide-react'
import { cn } from '@/utils/cn'

type MapView = '2d' | '3d'

export function RobotMapPage() {
  const { urfmp } = useURFMP()
  const { isDark } = useTheme()
  const { geofences, events, acknowledgeEvent } = useGeofencing()
  const [robots, setRobots] = useState<Robot[]>([])
  const [selectedRobotId, setSelectedRobotId] = useState<string>()
  const [mapView, setMapView] = useState<MapView>('2d')
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showGeofences, setShowGeofences] = useState(true)

  // Load robots
  useEffect(() => {
    if (!urfmp) return

    const loadRobots = async () => {
      try {
        setIsLoading(true)
        setError(null)
        const robotsResponse = await urfmp.getRobots()
        setRobots(robotsResponse)
      } catch (err) {
        console.error('Failed to load robots:', err)
        setError('Failed to load robots')
      } finally {
        setIsLoading(false)
      }
    }

    loadRobots()
  }, [urfmp])

  const handleRefresh = async () => {
    if (!urfmp) return

    try {
      setIsLoading(true)
      const robotsResponse = await urfmp.getRobots()
      setRobots(robotsResponse)
    } catch (err) {
      console.error('Failed to refresh robots:', err)
      setError('Failed to refresh robots')
    } finally {
      setIsLoading(false)
    }
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 dark:text-red-400 text-lg font-semibold mb-2">Error</div>
          <div className="text-gray-600 dark:text-gray-400 mb-4">{error}</div>
          <button
            onClick={handleRefresh}
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
          'border-b px-6 py-4 flex items-center justify-between',
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

        <div className="flex items-center gap-4">
          {/* View Toggle */}
          <div className={cn('flex rounded-lg p-1', isDark ? 'bg-gray-700' : 'bg-gray-100')}>
            <button
              onClick={() => setMapView('2d')}
              className={cn(
                'px-3 py-1 rounded flex items-center gap-2 text-sm font-medium transition-colors',
                mapView === '2d'
                  ? isDark
                    ? 'bg-gray-600 text-gray-100 shadow-sm'
                    : 'bg-white text-gray-900 shadow-sm'
                  : isDark
                    ? 'text-gray-300 hover:text-gray-100'
                    : 'text-gray-600 hover:text-gray-900'
              )}
            >
              <Map className="w-4 h-4" />
              2D Map
            </button>
            <button
              onClick={() => setMapView('3d')}
              className={cn(
                'px-3 py-1 rounded flex items-center gap-2 text-sm font-medium transition-colors',
                mapView === '3d'
                  ? isDark
                    ? 'bg-gray-600 text-gray-100 shadow-sm'
                    : 'bg-white text-gray-900 shadow-sm'
                  : isDark
                    ? 'text-gray-300 hover:text-gray-100'
                    : 'text-gray-600 hover:text-gray-900'
              )}
            >
              <Globe className="w-4 h-4" />
              3D Globe
            </button>
          </div>

          {/* Geofence Toggle */}
          <button
            onClick={() => setShowGeofences(!showGeofences)}
            className={cn(
              'px-3 py-1 rounded flex items-center gap-2 text-sm font-medium transition-colors',
              showGeofences
                ? 'bg-blue-500 dark:bg-blue-600 text-white'
                : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100'
            )}
          >
            <Shield className="w-4 h-4" />
            Geofences
          </button>

          {/* Refresh Button */}
          <button
            onClick={handleRefresh}
            disabled={isLoading}
            className={cn(
              'px-3 py-1 transition-colors',
              isDark ? 'text-gray-300 hover:text-gray-100' : 'text-gray-600 hover:text-gray-900'
            )}
          >
            <RefreshCw className={cn('w-4 h-4', isLoading && 'animate-spin')} />
          </button>
        </div>
      </div>

      {/* Map Content */}
      <div className="flex-1 relative">
        {mapView === '2d' ? (
          <SimpleRobotMap
            robots={robots}
            selectedRobotId={selectedRobotId}
            onRobotSelect={setSelectedRobotId}
            geofences={showGeofences ? geofences : []}
            className="w-full h-full"
          />
        ) : (
          <RobotMap3D
            robots={robots}
            selectedRobotId={selectedRobotId}
            onRobotSelect={setSelectedRobotId}
            geofences={showGeofences ? geofences : []}
            showPaths={true}
            showGeofences={showGeofences}
            className="w-full h-full"
          />
        )}

        {/* Robot List Sidebar */}
        <div
          className={cn(
            'absolute top-4 left-4 rounded-lg shadow-lg p-4 w-64 max-h-96 overflow-y-auto',
            isDark ? 'bg-gray-800 border border-gray-700' : 'bg-white'
          )}
        >
          <h3
            className={cn(
              'font-semibold mb-3 flex items-center gap-2',
              isDark ? 'text-gray-200' : 'text-gray-900'
            )}
          >
            <Settings className="w-4 h-4" />
            Fleet Status ({robots.length})
          </h3>

          <div className="space-y-2">
            {robots.map((robot) => (
              <div
                key={robot.id}
                className={cn(
                  'p-2 rounded-lg border cursor-pointer transition-colors',
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
                        'font-medium text-sm',
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
                <div className={cn('text-xs mt-1', isDark ? 'text-gray-400' : 'text-gray-600')}>
                  {robot.model} • {robot.vendor}
                </div>
              </div>
            ))}
          </div>

          {robots.length === 0 && !isLoading && (
            <div className={cn('text-center py-4', isDark ? 'text-gray-400' : 'text-gray-500')}>
              <Map className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No robots found</p>
            </div>
          )}
        </div>

        {/* Geofence Events Panel */}
        {events.length > 0 && (
          <div
            className={cn(
              'absolute top-4 right-4 rounded-lg shadow-lg p-4 w-80 max-h-96 overflow-y-auto',
              isDark ? 'bg-gray-800 border border-gray-700' : 'bg-white'
            )}
          >
            <h3
              className={cn(
                'font-semibold mb-3 flex items-center gap-2',
                isDark ? 'text-gray-200' : 'text-gray-900'
              )}
            >
              <AlertTriangle className="w-4 h-4 text-orange-500" />
              Recent Events ({events.filter(e => !e.acknowledged).length})
            </h3>

            <div className="space-y-2">
              {events.slice(0, 5).map((event) => (
                <div
                  key={event.id}
                  className={cn(
                    'p-3 rounded-lg border',
                    event.acknowledged
                      ? isDark
                        ? 'border-gray-600 bg-gray-700/30'
                        : 'border-gray-300 bg-gray-50'
                      : event.severity === 'critical'
                        ? 'border-red-500 dark:border-red-700 bg-red-50 dark:bg-red-950/30'
                        : event.severity === 'error'
                          ? 'border-orange-500 dark:border-orange-700 bg-orange-50 dark:bg-orange-950/30'
                          : event.severity === 'warning'
                            ? 'border-yellow-500 dark:border-yellow-700 bg-yellow-50 dark:bg-yellow-950/30'
                            : 'border-blue-500 dark:border-blue-700 bg-blue-50 dark:bg-blue-950/30'
                  )}
                >
                  <div className="flex items-start justify-between mb-1">
                    <span
                      className={cn(
                        'text-sm font-medium',
                        isDark ? 'text-gray-200' : 'text-gray-900'
                      )}
                    >
                      {event.robotName}
                    </span>
                    <span
                      className={cn(
                        'text-xs px-2 py-1 rounded',
                        event.severity === 'critical'
                          ? 'bg-red-100 dark:bg-red-950/30 text-red-800 dark:text-red-400'
                          : event.severity === 'error'
                            ? 'bg-orange-100 dark:bg-orange-950/30 text-orange-800 dark:text-orange-400'
                            : event.severity === 'warning'
                              ? 'bg-yellow-100 dark:bg-yellow-950/30 text-yellow-800 dark:text-yellow-400'
                              : 'bg-blue-100 dark:bg-blue-950/30 text-blue-800 dark:text-blue-400'
                      )}
                    >
                      {event.severity}
                    </span>
                  </div>
                  <p className={cn('text-sm mb-2', isDark ? 'text-gray-300' : 'text-gray-700')}>
                    {event.message}
                  </p>
                  <div className="flex items-center justify-between">
                    <span className={cn('text-xs', isDark ? 'text-gray-400' : 'text-gray-500')}>
                      {new Date(event.timestamp).toLocaleTimeString()}
                    </span>
                    {!event.acknowledged && (
                      <button
                        onClick={() => acknowledgeEvent(event.id, 'operator')}
                        className="text-xs px-2 py-1 bg-blue-500 dark:bg-blue-600 text-white rounded hover:bg-blue-600 dark:hover:bg-blue-500 transition-colors"
                      >
                        Acknowledge
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {events.length > 5 && (
              <div className={cn('text-center mt-3', isDark ? 'text-gray-400' : 'text-gray-500')}>
                <p className="text-xs">+{events.length - 5} more events</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
